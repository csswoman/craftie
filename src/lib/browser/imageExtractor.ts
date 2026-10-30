import {
  extractColorsFromRaster,
  PALETTE_EXTRACTION_COUNT,
  type ExtractedColor,
  type ImageExtractionOptions,
  type RasterData,
  validateImageFile,
} from '@lib/color/imageExtractor';

const PALETTE_MAX_COUNT = 12;
/**
 * Smoothed downscale target. Averaging pixels removes JPEG noise, and every
 * remaining pixel is sampled, so the image is read whole instead of on a grid.
 */
const MAX_CANVAS_DIMENSION = 128;

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

function createContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (context === null) {
    throw new Error('Unable to create canvas rendering context.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return context;
}

function rasterizeImage(image: HTMLImageElement): RasterData {
  const dimensions = getDrawDimensions(image.naturalWidth, image.naturalHeight);
  let source: CanvasImageSource = image;
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  // Halve in steps: one large bilinear downscale skips pixels and aliases in
  // some browsers; successive halvings average every pixel.
  while (width / 2 >= dimensions.width * 2 && height / 2 >= 1) {
    width = Math.max(1, Math.round(width / 2));
    height = Math.max(1, Math.round(height / 2));
    const step = createContext(width, height);
    step.drawImage(source, 0, 0, width, height);
    source = step.canvas;
  }

  const context = createContext(dimensions.width, dimensions.height);
  context.drawImage(source, 0, 0, dimensions.width, dimensions.height);
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
  });
}
