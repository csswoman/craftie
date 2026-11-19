import { describe, expect, it } from 'vitest';

import type { RasterData } from './imageTypes';
import { clampPoint, locateColorsInRaster, sampleRasterColor } from './imagePicking';

function createRaster(
  width: number,
  height: number,
  paint: (x: number, y: number) => [number, number, number, number],
): RasterData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data.set(paint(x, y), (y * width + x) * 4);
    }
  }
  return { data, width, height };
}

/** Left half red, right half blue. */
const halves = createRaster(20, 10, (x) => (x < 10 ? [255, 0, 0, 255] : [0, 0, 255, 255]));

describe('sampleRasterColor', () => {
  it('reads the color under a point', () => {
    expect(sampleRasterColor(halves, { x: 0.2, y: 0.5 })).toBe('#FF0000');
    expect(sampleRasterColor(halves, { x: 0.8, y: 0.5 })).toBe('#0000FF');
  });

  it('averages the neighborhood on an edge', () => {
    // Pixel 10 sits on the boundary: its 3×3 window covers one red and two blue columns.
    expect(sampleRasterColor(halves, { x: 10 / 20, y: 0.5 })).toBe('#5500AA');
  });

  it('clamps points outside the image', () => {
    expect(sampleRasterColor(halves, { x: -1, y: 2 })).toBe('#FF0000');
    expect(sampleRasterColor(halves, { x: 5, y: -3 })).toBe('#0000FF');
  });

  it('ignores transparent pixels and returns null when nothing is opaque', () => {
    const clear = createRaster(4, 4, () => [10, 20, 30, 0]);
    expect(sampleRasterColor(clear, { x: 0.5, y: 0.5 })).toBeNull();
  });
});

describe('locateColorsInRaster', () => {
  it('places each color on the area that holds it', () => {
    const [red, blue] = locateColorsInRaster(halves, ['#FF0000', '#0000FF']);
    expect(red!.x).toBeLessThan(0.5);
    expect(blue!.x).toBeGreaterThan(0.5);
  });

  it('finds the nearest area for a color the image does not contain exactly', () => {
    const [point] = locateColorsInRaster(halves, ['#E01010']);
    expect(sampleRasterColor(halves, point!)).toBe('#FF0000');
  });

  it('falls back to the center when the image is fully transparent', () => {
    const clear = createRaster(4, 4, () => [0, 0, 0, 0]);
    expect(locateColorsInRaster(clear, ['#FFFFFF'])).toEqual([{ x: 0.5, y: 0.5 }]);
  });
});

describe('clampPoint', () => {
  it('keeps points inside the unit box', () => {
    expect(clampPoint({ x: -0.2, y: 1.4 })).toEqual({ x: 0, y: 1 });
  });
});
