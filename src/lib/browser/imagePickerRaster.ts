import type { RasterData } from '@lib/color/imageTypes';

import { createDomContext, rasterizeImage } from './imageRaster';

/**
 * Raster for picking colors by pointer. Larger than the extraction raster so
 * a marker can land on small details, still small enough to locate every
 * extracted color in a few milliseconds.
 */
export const PICKER_RASTER_DIMENSION = 480;

/** Decodes an image URL (a local blob URL) into the picker raster. */
export function loadPickerRaster(src: string): Promise<RasterData> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error('Image has no dimensions.'));
        return;
      }
      try {
        resolve(
          rasterizeImage(image, image.naturalWidth, image.naturalHeight, createDomContext, PICKER_RASTER_DIMENSION),
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unable to read image pixels.'));
      }
    };
    image.onerror = () => reject(new Error('Unable to load image.'));
    image.src = src;
  });
}
