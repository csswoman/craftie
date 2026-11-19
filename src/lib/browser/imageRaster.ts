import type { RasterData } from '@lib/color/imageExtractor';

/**
 * Downscales a decoded image to the extraction raster. Shared by the main
 * thread (DOM canvas) and the extraction worker (OffscreenCanvas) so both
 * paths read the exact same pixels.
 */

/**
 * Smoothed downscale target. Averaging pixels removes JPEG noise, and every
 * remaining pixel is sampled, so the image is read whole instead of on a grid.
 */
export const MAX_RASTER_DIMENSION = 128;

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type CreateContext = (width: number, height: number) => Context2D;

export function getDrawDimensions(
  width: number,
  height: number,
  maxDimension = MAX_RASTER_DIMENSION,
): { width: number; height: number } {
  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / largestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function prepare(context: Context2D | null): Context2D {
  if (context === null) {
    throw new Error('Unable to create canvas rendering context.');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return context;
}

export const createDomContext: CreateContext = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return prepare(canvas.getContext('2d', { willReadFrequently: true }));
};

export const createOffscreenContext: CreateContext = (width, height) =>
  prepare(new OffscreenCanvas(width, height).getContext('2d', { willReadFrequently: true }));

export function rasterizeImage(
  image: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  createContext: CreateContext,
  maxDimension = MAX_RASTER_DIMENSION,
): RasterData {
  const dimensions = getDrawDimensions(naturalWidth, naturalHeight, maxDimension);
  let source: CanvasImageSource = image;
  let width = naturalWidth;
  let height = naturalHeight;

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
