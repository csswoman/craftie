import { describe, expect, it } from 'vitest';

import { getDrawDimensions, MAX_RASTER_DIMENSION } from './imageRaster';

describe('getDrawDimensions', () => {
  it('keeps small images at their size', () => {
    expect(getDrawDimensions(100, 60)).toEqual({ width: 100, height: 60 });
  });

  it('scales the largest side to the raster limit and keeps the aspect ratio', () => {
    expect(getDrawDimensions(4000, 3000)).toEqual({ width: MAX_RASTER_DIMENSION, height: 96 });
    expect(getDrawDimensions(3000, 4000)).toEqual({ width: 96, height: MAX_RASTER_DIMENSION });
  });

  it('never returns a zero side', () => {
    expect(getDrawDimensions(10_000, 10)).toEqual({ width: MAX_RASTER_DIMENSION, height: 1 });
  });
});
