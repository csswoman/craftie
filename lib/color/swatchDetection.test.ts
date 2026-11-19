import { describe, expect, it } from 'vitest';

import { extractColorsFromRaster, type RasterData } from './imageExtractor';
import { detectSwatchColors } from './swatchDetection';

type Rgb = [number, number, number];

function createRaster(width: number, height: number, paint: (x: number, y: number) => Rgb): RasterData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const [r, g, b] = paint(x, y);
      data.set([r, g, b, 255], index);
    }
  }

  return { data, width, height };
}

const YELLOW: Rgb = [0xfb, 0xe8, 0xa4];
const GREEN: Rgb = [0xd5, 0xed, 0xb9];
const PEACH: Rgb = [0xff, 0xc1, 0x98];
const BLUE: Rgb = [0xa5, 0xe1, 0xe9];
const PINK: Rgb = [0xfa, 0xc9, 0xdc];
const LAVENDER: Rgb = [0xc4, 0xbd, 0xf3];
const BACKGROUND: Rgb = [0xf2, 0xf2, 0xf2];
const LABEL: Rgb = [0x55, 0x55, 0x55];

/** Two rows of three white cards, each with a swatch and a dark label line, on a gray page. */
function cardGrid(): RasterData {
  const swatches = [[YELLOW, GREEN, PEACH], [BLUE, PINK, LAVENDER]];

  return createRaster(120, 100, (x, y) => {
    const column = Math.floor(x / 40);
    const row = Math.floor(y / 50);
    const cardX = x % 40;
    const cardY = y % 50;
    if (cardX < 4 || cardX >= 36 || cardY < 4 || cardY >= 46) return BACKGROUND;
    if (cardX >= 8 && cardX < 32 && cardY >= 8 && cardY < 32) return swatches[row]![column]!;
    if (cardY === 38 && cardX >= 10 && cardX < 30 && x % 2 === 0) return LABEL;
    return [255, 255, 255];
  });
}

const hex = ([r, g, b]: Rgb) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

describe('detectSwatchColors', () => {
  it('reads the exact color of each card swatch in reading order', () => {
    const colors = detectSwatchColors(cardGrid());

    expect(colors?.map((color) => color.hex)).toEqual(
      [YELLOW, GREEN, PEACH, BLUE, PINK, LAVENDER].map(hex),
    );
    expect(colors?.reduce((sum, color) => sum + color.prominence, 0)).toBeCloseTo(1);
  });

  it('reads full-height stripes even with text-like holes inside them', () => {
    const stripes: Rgb[] = [[0x1b, 0x40, 0x79], [0x4d, 0x7c, 0x8a], [0x7f, 0x9c, 0x96], [0xcb, 0xdf, 0x90]];
    const raster = createRaster(80, 60, (x, y) => {
      const stripe = stripes[Math.floor(x / 20)]!;
      const inLabel = y >= 44 && y < 48 && x % 20 >= 4 && x % 20 < 16 && x % 2 === 0;
      return inLabel ? [255, 255, 255] : stripe;
    });

    expect(detectSwatchColors(raster)?.map((color) => color.hex)).toEqual(stripes.map(hex));
  });

  it('keeps one entry for a repeated color', () => {
    const raster = createRaster(80, 20, (x) => [YELLOW, PINK, YELLOW, BLUE][Math.floor(x / 20)]!);

    expect(detectSwatchColors(raster)?.map((color) => color.hex)).toEqual([YELLOW, PINK, BLUE].map(hex));
  });

  it('returns null for a smooth gradient, like a photo of the sky', () => {
    const raster = createRaster(64, 64, (x, y) => [40 + x * 3, 90 + y * 2, 200]);

    expect(detectSwatchColors(raster)).toBeNull();
  });

  it('returns null for noisy photo-like pixels', () => {
    let seed = 7;
    const random = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    const raster = createRaster(64, 64, () => [
      Math.floor(random() * 255),
      Math.floor(random() * 255),
      Math.floor(random() * 255),
    ]);

    expect(detectSwatchColors(raster)).toBeNull();
  });

  it('returns null for flat UI made only of neutral panels', () => {
    const raster = createRaster(90, 30, (x) => [[255, 255, 255], [0xe7, 0xe6, 0xe4], [0xc6, 0xc5, 0xc4]][Math.floor(x / 30)] as Rgb);

    expect(detectSwatchColors(raster)).toBeNull();
  });

  it('returns null with fewer than three swatches', () => {
    const raster = createRaster(40, 20, (x) => (x < 20 ? YELLOW : PINK));

    expect(detectSwatchColors(raster)).toBeNull();
  });
});

describe('extractColorsFromRaster with swatches', () => {
  it('uses the swatch colors when the image is a palette', () => {
    const colors = extractColorsFromRaster(cardGrid(), { count: 5, maxCount: 12, sampleStep: 1, swatches: true });

    expect(colors.map((color) => color.hex)).toEqual([YELLOW, GREEN, PEACH, BLUE, PINK, LAVENDER].map(hex));
  });

  it('clusters as before when swatch detection is off', () => {
    const colors = extractColorsFromRaster(cardGrid(), { count: 5, maxCount: 12, sampleStep: 1 });

    expect(colors.map((color) => color.hex)).not.toEqual([YELLOW, GREEN, PEACH, BLUE, PINK, LAVENDER].map(hex));
  });
});
