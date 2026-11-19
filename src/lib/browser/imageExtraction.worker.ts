/// <reference lib="webworker" />

import { extractColorsFromRaster, type ImageExtractionOptions } from '@lib/color/imageExtractor';

import { createOffscreenContext, rasterizeImage } from './imageRaster';

/**
 * Off-main-thread image extraction: decode (createImageBitmap), downscale on
 * OffscreenCanvas and cluster, so a large photo never blocks the interface.
 * Validation stays on the main thread, before the file is posted.
 */

export type ExtractionRequest = { id: number; file: Blob; options?: ImageExtractionOptions };
export type ExtractionResponse =
  | { id: number; ok: true; colors: ReturnType<typeof extractColorsFromRaster> }
  | { id: number; ok: false; message: string };

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (event: MessageEvent<ExtractionRequest>) => {
  const { id, file, options } = event.data;
  let bitmap: ImageBitmap | null = null;

  try {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error('Unable to load image file.');
    }
    if (bitmap.width === 0 || bitmap.height === 0) {
      throw new Error('Image has no dimensions.');
    }

    const raster = rasterizeImage(bitmap, bitmap.width, bitmap.height, createOffscreenContext);
    const colors = extractColorsFromRaster(raster, options);
    scope.postMessage({ id, ok: true, colors } satisfies ExtractionResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load image file.';
    scope.postMessage({ id, ok: false, message } satisfies ExtractionResponse);
  } finally {
    bitmap?.close();
  }
};
