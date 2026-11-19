import {
  extractColorsFromRaster,
  PALETTE_EXTRACTION_COUNT,
  type ExtractedColor,
  type ImageExtractionOptions,
  validateImageFile,
} from '@lib/color/imageExtractor';

import { extractInWorker } from './imageExtractionWorkerClient';
import { createDomContext, rasterizeImage } from './imageRaster';

const PALETTE_MAX_COUNT = 12;

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error('Image has no dimensions.'));
        return;
      }
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to load image file.'));
    };

    image.src = objectUrl;
  });
}

async function extractOnMainThread(
  file: File,
  options?: ImageExtractionOptions,
): Promise<ExtractedColor[]> {
  const image = await loadImageElement(file);
  const raster = rasterizeImage(image, image.naturalWidth, image.naturalHeight, createDomContext);
  return extractColorsFromRaster(raster, options);
}

/**
 * Extracts dominant colors from a local image file using canvas sampling and
 * k-means. Decoding, downscaling and clustering run in a Web Worker when the
 * browser supports it, so large photos do not block the interface.
 */
export async function extractColorsFromImage(
  file: File,
  options?: ImageExtractionOptions,
): Promise<ExtractedColor[]> {
  const maxFileSizeMB = options?.maxFileSizeMB ?? 5;
  validateImageFile(file, maxFileSizeMB);

  try {
    return await extractInWorker(file, options);
  } catch {
    // Worker unavailable or it could not decode this file: the main thread
    // path reads the same pixels and owns the final error, if any.
    return extractOnMainThread(file, options);
  }
}

/**
 * Extracts a broader set of dominant colors for the visual palette builder.
 * A higher regenerateIndex reseeds clustering; role variety on regenerate
 * comes from the palette variant, not from sampling noise.
 */
export async function extractPaletteColorsFromImage(
  file: File,
  regenerateIndex = 0,
  mode: 'paint' | 'ui' = 'ui',
): Promise<ExtractedColor[]> {
  return extractColorsFromImage(file, {
    count: PALETTE_EXTRACTION_COUNT,
    maxCount: PALETTE_MAX_COUNT,
    sampleStep: 1,
    centroidSeed: regenerateIndex,
    publication: mode === 'paint' ? 'medoid' : 'centroid',
    swatches: true,
  });
}
