import { describe, expect, it } from 'vitest';

import { samplePixels } from './rasterSampling';
import type { RasterData } from './imageTypes';

function raster(data: number[], width: number, height: number): RasterData {
  return { data: new Uint8ClampedArray(data), width, height };
}

describe('samplePixels', () => {
  it('skips transparent pixels and returns rgb samples', () => {
    const image = raster(
      [
        10, 20, 30, 255,
        40, 50, 60, 0,
      ],
      2,
      1,
    );

    expect(samplePixels(image, 1)).toEqual([{ r: 10, g: 20, b: 30 }]);
  });

  it('uses the sample offset when stepping through pixels', () => {
    const image = raster(
      [
        10, 20, 30, 255,
        40, 50, 60, 255,
        70, 80, 90, 255,
        11, 21, 31, 255,
        41, 51, 61, 255,
        71, 81, 91, 255,
        12, 22, 32, 255,
        42, 52, 62, 255,
        72, 82, 92, 255,
      ],
      3,
      3,
    );

    expect(samplePixels(image, 2, 1)).toEqual([{ r: 41, g: 51, b: 61 }]);
  });
});
