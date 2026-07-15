import {
  extractColorsFromRaster,
  PALETTE_EXTRACTION_COUNT,
  type ExtractedColor,
  type ImageExtractionOptions,
  type RasterData,
  validateImageFile,
} from '@lib/color/imageExtractor';

const PALETTE_MAX_COUNT = 12;
const MAX_CANVAS_DIMENSION = 256;

function getDrawDimensions(width: number, height: number): { width: number; height: number } {
  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_CANVAS_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_CANVAS_DIMENSION / largestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to load image file.'));
    };

    image.src = objectUrl;
  });
}

function rasterizeImage(image: HTMLImageElement): RasterData {
  const dimensions = getDrawDimensions(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (context === null) {
    throw new Error('Unable to create canvas rendering context.');
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const imageData = context.getImageData(0, 0, dimensions.width, dimensions.height);

  return {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
  };
}

/**
 * Extracts dominant colors from a local image file using canvas sampling and k-means.
 */
export async function extractColorsFromImage(
  file: File,
  options?: ImageExtractionOptions,
): Promise<ExtractedColor[]> {
  const maxFileSizeMB = options?.maxFileSizeMB ?? 5;
  validateImageFile(file, maxFileSizeMB);

  const image = await loadImageElement(file);
  const raster = rasterizeImage(image);

  return extractColorsFromRaster(raster, options);
}

/**
 * Extracts a broader set of dominant colors for the visual palette builder.
 * Pass a higher regenerateIndex to sample the image differently and surface alternate colors.
 */
export async function extractPaletteColorsFromImage(
  file: File,
  regenerateIndex = 0,
  mode: 'paint' | 'ui' = 'ui',
): Promise<ExtractedColor[]> {
  const sampleSteps = [6, 8, 10, 12, 14];
  const sampleStep = sampleSteps[regenerateIndex % sampleSteps.length]!;

  return extractColorsFromImage(file, {
    count: PALETTE_EXTRACTION_COUNT,
    maxCount: PALETTE_MAX_COUNT,
    sampleStep,
    sampleOffset: regenerateIndex % sampleStep,
    centroidSeed: regenerateIndex * 3,
    publication: mode === 'paint' ? 'medoid' : 'centroid',
  });
}
