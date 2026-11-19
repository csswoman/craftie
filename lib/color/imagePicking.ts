import type { RasterData } from './imageTypes';
import { normalizeHex } from './normalizeHex';

/**
 * Reads colors at points of an image and finds where a color sits in it.
 * Points are normalized to the image box (0–1 on each axis) so callers can
 * map them to any rendered size of the same image.
 */

export type ImagePoint = { x: number; y: number };

/** Pixels below half opacity are antialiased edges, not image color. */
const ALPHA_MIN = 128;
/** Neighborhood radius in raster pixels: 1 averages a 3×3 window. */
const DEFAULT_RADIUS = 1;
/** Grid stride when locating colors; averaging covers the skipped pixels. */
const LOCATE_STEP = 2;

type Rgb = [number, number, number];
type Lab = [number, number, number];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function clampPoint(point: ImagePoint): ImagePoint {
  return { x: clamp01(point.x), y: clamp01(point.y) };
}

function toPixel(raster: RasterData, point: ImagePoint): { px: number; py: number } {
  const { x, y } = clampPoint(point);
  return {
    px: Math.min(raster.width - 1, Math.floor(x * raster.width)),
    py: Math.min(raster.height - 1, Math.floor(y * raster.height)),
  };
}

function averageAt(raster: RasterData, px: number, py: number, radius: number): Rgb | null {
  const { data, width, height } = raster;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = Math.max(0, py - radius); y <= Math.min(height - 1, py + radius); y += 1) {
    for (let x = Math.max(0, px - radius); x <= Math.min(width - 1, px + radius); x += 1) {
      const index = (y * width + x) * 4;
      if ((data[index + 3] ?? 0) < ALPHA_MIN) {
        continue;
      }
      r += data[index] ?? 0;
      g += data[index + 1] ?? 0;
      b += data[index + 2] ?? 0;
      count += 1;
    }
  }

  return count === 0 ? null : [r / count, g / count, b / count];
}

function rgbToHex([r, g, b]: Rgb): string {
  const channel = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

function hexToRgb(hex: string): Rgb {
  const value = normalizeHex(hex).slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** sRGB → OKLab. Inlined because locating runs it for every grid point. */
function rgbToOklab([r8, g8, b8]: Rgb): Lab {
  const r = linear(r8);
  const g = linear(g8);
  const b = linear(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function labDistanceSq(a: Lab, b: Lab): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/**
 * Color at a point, averaged over a small window so one noisy pixel does not
 * decide it. Returns null when the point only covers transparent pixels.
 */
export function sampleRasterColor(
  raster: RasterData,
  point: ImagePoint,
  radius = DEFAULT_RADIUS,
): string | null {
  if (raster.width === 0 || raster.height === 0) {
    return null;
  }

  const { px, py } = toPixel(raster, point);
  const rgb = averageAt(raster, px, py, radius);
  return rgb ? rgbToHex(rgb) : null;
}

/**
 * For each color, the point of the image whose neighborhood is closest to it
 * in OKLab. Neighborhoods are averaged, so flat areas win over single pixels
 * on an edge. Falls back to the center when the image has no opaque pixels.
 */
export function locateColorsInRaster(raster: RasterData, hexes: readonly string[]): ImagePoint[] {
  const grid: { point: ImagePoint; lab: Lab }[] = [];

  for (let py = 0; py < raster.height; py += LOCATE_STEP) {
    for (let px = 0; px < raster.width; px += LOCATE_STEP) {
      const rgb = averageAt(raster, px, py, DEFAULT_RADIUS);
      if (rgb) {
        grid.push({
          point: { x: (px + 0.5) / raster.width, y: (py + 0.5) / raster.height },
          lab: rgbToOklab(rgb),
        });
      }
    }
  }

  return hexes.map((hex) => {
    const target = rgbToOklab(hexToRgb(hex));
    let best: ImagePoint = { x: 0.5, y: 0.5 };
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const cell of grid) {
      const distance = labDistanceSq(cell.lab, target);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = cell.point;
      }
    }

    return best;
  });
}
