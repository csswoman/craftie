import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import {
  clusterSamples,
  extractColorsFromRaster,
  filterNeutralSamples,
  type RasterData,
  validateImageFile,
} from './imageExtractor';

const toLab = converter('lab');

function createRaster(
  width: number,
  height: number,
  paint: (x: number, y: number) => [number, number, number, number],
): RasterData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const [r, g, b, a] = paint(x, y);
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = a;
    }
  }

  return { data, width, height };
}

function solidRaster(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
): RasterData {
  return createRaster(width, height, () => [r, g, b, 255]);
}

function toLabSampleFromRgb(r: number, g: number, b: number) {
  const labColor = toLab({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });

  return {
    rgb: { r, g, b },
    lab: [labColor.l, labColor.a, labColor.b] as [number, number, number],
  };
}

describe('validateImageFile', () => {
  it('throws for unsupported file types', () => {
    const file = new File(['pixels'], 'notes.txt', { type: 'text/plain' });

    expect(() => validateImageFile(file, 5)).toThrow(/Formato no admitido/i);
  });

  it('throws when file size exceeds the limit', () => {
    const file = new File([new Uint8Array(6 * 1024 * 1024)], 'large.png', {
      type: 'image/png',
    });

    expect(() => validateImageFile(file, 5)).toThrow(/supera el límite/i);
  });

  it('accepts common image mime types', () => {
    const file = new File(['pixels'], 'photo.webp', { type: 'image/webp' });

    expect(() => validateImageFile(file, 5)).not.toThrow();
  });
});

describe('filterNeutralSamples', () => {
  it('removes near-white samples unless white dominates the image', () => {
    const samples = [
      ...Array.from({ length: 3 }, () => ({ r: 255, g: 255, b: 255 })),
      { r: 200, g: 40, b: 40 },
      { r: 210, g: 50, b: 50 },
      { r: 30, g: 120, b: 200 },
      { r: 240, g: 180, b: 20 },
      { r: 25, g: 115, b: 195 },
      { r: 205, g: 45, b: 45 },
    ];

    const filtered = filterNeutralSamples(samples);

    expect(filtered.some((sample) => sample.r > 240)).toBe(false);
    expect(filtered.length).toBeGreaterThan(2);
  });

  it('keeps near-white samples when they dominate the image', () => {
    const samples = Array.from({ length: 10 }, () => ({ r: 255, g: 255, b: 255 }));

    expect(filterNeutralSamples(samples)).toHaveLength(10);
  });
});

describe('extractColorsFromRaster', () => {
  it('returns dominant flat colors for simple images', () => {
    const raster = solidRaster(40, 40, 210, 40, 40);
    const colors = extractColorsFromRaster(raster, { count: 2, sampleStep: 4 });

    expect(colors.length).toBeGreaterThanOrEqual(1);
    expect(colors.length).toBeLessThanOrEqual(5);
    expect(colors[0]?.hex).toBe('#D22828');
    expect(colors[0]?.prominence).toBe(1);
  });

  it('sorts results by prominence descending', () => {
    const raster = createRaster(40, 40, (x) => {
      if (x < 26) {
        return [30, 120, 200, 255];
      }

      return [240, 180, 20, 255];
    });

    const colors = extractColorsFromRaster(raster, { count: 2, sampleStep: 2 });

    expect(colors.length).toBe(2);
    expect(colors[0]!.prominence).toBeGreaterThanOrEqual(colors[1]!.prominence);
  });

  it('does not let a mostly white background dominate when accents are present', () => {
    const raster = createRaster(40, 40, (x, y) => {
      const isBorder = x < 4 || y < 4 || x > 35 || y > 35;
      return isBorder ? [252, 252, 252, 255] : [35, 140, 70, 255];
    });

    const colors = extractColorsFromRaster(raster, { count: 3, sampleStep: 2 });

    expect(colors[0]?.hex).not.toBe('#FCFCFC');
    expect(colors.some((color) => color.hex.startsWith('#23') || color.hex.startsWith('#22'))).toBe(
      true,
    );
  });

  it('ignores fully transparent pixels', () => {
    const raster = createRaster(20, 20, () => [0, 0, 0, 0]);

    expect(() => extractColorsFromRaster(raster, { count: 2, sampleStep: 2 })).toThrow(
      /píxeles suficientes/i,
    );
  });

  it('throws when count is outside the allowed range', () => {
    const raster = solidRaster(10, 10, 10, 10, 10);

    expect(() => extractColorsFromRaster(raster, { count: 1 })).toThrow(/between 2 and 5/i);
    expect(() => extractColorsFromRaster(raster, { count: 6 })).toThrow(/between 2 and 5/i);
  });

  it('can vary extraction with sample offset and centroid seed', () => {
    const raster = createRaster(40, 40, (x) => {
      if (x < 13) {
        return [30, 120, 200, 255];
      }

      if (x < 26) {
        return [240, 180, 20, 255];
      }

      return [35, 140, 70, 255];
    });

    const baseline = extractColorsFromRaster(raster, {
      count: 3,
      sampleStep: 6,
      sampleOffset: 0,
      centroidSeed: 0,
    });
    const alternate = extractColorsFromRaster(raster, {
      count: 3,
      sampleStep: 10,
      sampleOffset: 2,
      centroidSeed: 4,
    });

    expect(baseline.length).toBeGreaterThan(0);
    expect(alternate.length).toBeGreaterThan(0);
  });

  it('publishes only sampled pixel colors when medoids are requested', () => {
    const pixels = ['#1478C8', '#1E82D2', '#F0B414'];
    const raster = createRaster(30, 30, (x) => {
      if (x < 10) return [20, 120, 200, 255];
      if (x < 20) return [30, 130, 210, 255];
      return [240, 180, 20, 255];
    });
    const colors = extractColorsFromRaster(raster, {
      count: 2,
      sampleStep: 1,
      publication: 'medoid',
    });

    expect(colors.every((color) => pixels.includes(color.hex))).toBe(true);
  });
});

describe('clusterSamples', () => {
  it('clusters sampled colors deterministically', () => {
    const samples = [
      toLabSampleFromRgb(220, 20, 20),
      toLabSampleFromRgb(225, 25, 25),
      toLabSampleFromRgb(20, 80, 200),
      toLabSampleFromRgb(25, 85, 205),
    ];

    const first = clusterSamples(samples, 2);
    const second = clusterSamples(samples, 2);

    expect(first.map((cluster) => cluster.members.length)).toEqual(
      second.map((cluster) => cluster.members.length),
    );
  });
});
