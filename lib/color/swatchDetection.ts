import type { ExtractedColor, RasterData } from './imageTypes';
import { normalizeHex } from './normalizeHex';
import { toOklch } from './oklchMath';

/**
 * Detects flat color swatches (palette cards, Coolors-style stripes) in a
 * raster and reads their exact color. A palette image already states its
 * colors as solid blocks, so reading those blocks beats clustering, which
 * would blend them with labels, shadows and the background.
 *
 * Returns null when the image does not look like a palette, so callers fall
 * back to clustering for photos.
 */

/** Max per-channel difference from the seed color inside one swatch. */
const REGION_TOLERANCE = 10;
/** Seeds must sit inside a flat area: every neighbor this close to them. */
const SEED_TOLERANCE = 4;
/** Swatches cover at least this share of the image, and this many pixels. */
const MIN_AREA_SHARE = 0.003;
const MIN_AREA_PIXELS = 12;
/** Thinner regions are text strokes or divider lines, not swatches. */
const MIN_SIDE = 3;
/** Pixels / bounding box: rectangles with a label inside still pass; shapes with holes (a card around a swatch) do not. */
const MIN_FILL = 0.7;
/** Neutral regions touching the border are the page background or app chrome. */
const BACKGROUND_CHROMA_MAX = 0.03;
const MIN_SWATCHES = 3;
/** Flat UI (panels, cards) yields only neutrals; a palette has real color. */
const MIN_CHROMATIC_SWATCHES = 2;
const MIN_COVERAGE = 0.08;
const MAX_SWATCHES = 12;
/** Swatches closer than this (per channel) are the same color repeated. */
const DUPLICATE_TOLERANCE = 3;
/**
 * A flat swatch is mostly one exact color; a gradient sliced by the region
 * tolerance spreads evenly across it instead.
 */
const UNIFORM_TOLERANCE = 2;
const MIN_UNIFORM_SHARE = 0.6;
const ALPHA_MIN = 128;

type Swatch = {
  r: number;
  g: number;
  b: number;
  area: number;
  top: number;
  left: number;
  bottom: number;
};

function channelDistance(data: Uint8ClampedArray, a: number, b: number): number {
  return Math.max(
    Math.abs((data[a] ?? 0) - (data[b] ?? 0)),
    Math.abs((data[a + 1] ?? 0) - (data[b + 1] ?? 0)),
    Math.abs((data[a + 2] ?? 0) - (data[b + 2] ?? 0)),
  );
}

function isOpaque(data: Uint8ClampedArray, pixel: number): boolean {
  return (data[pixel * 4 + 3] ?? 0) >= ALPHA_MIN;
}

function isFlatSeed(raster: RasterData, x: number, y: number): boolean {
  const { data, width, height } = raster;
  const center = (y * width + x) * 4;

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (!isOpaque(data, ny * width + nx)) return false;
      if (channelDistance(data, center, (ny * width + nx) * 4) > SEED_TOLERANCE) return false;
    }
  }

  return true;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/** Flood-fills the pixels within tolerance of the seed; marks them visited. */
function growRegion(raster: RasterData, seed: number, visited: Uint8Array): Swatch | null {
  const { data, width, height } = raster;
  const seedIndex = seed * 4;
  const stack = [seed];
  const reds: number[] = [];
  const greens: number[] = [];
  const blues: number[] = [];
  let [left, right, top, bottom] = [width, -1, height, -1];
  let touchesBorder = false;
  visited[seed] = 1;

  while (stack.length > 0) {
    const pixel = stack.pop()!;
    const x = pixel % width;
    const y = (pixel - x) / width;
    reds.push(data[pixel * 4] ?? 0);
    greens.push(data[pixel * 4 + 1] ?? 0);
    blues.push(data[pixel * 4 + 2] ?? 0);
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesBorder = true;

    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx;
      if (visited[next] || !isOpaque(data, next)) continue;
      if (channelDistance(data, seedIndex, next * 4) > REGION_TOLERANCE) continue;
      visited[next] = 1;
      stack.push(next);
    }
  }

  const area = reds.length;
  const boxWidth = right - left + 1;
  const boxHeight = bottom - top + 1;

  if (
    area < Math.max(MIN_AREA_PIXELS, MIN_AREA_SHARE * width * height) ||
    Math.min(boxWidth, boxHeight) < MIN_SIDE ||
    area / (boxWidth * boxHeight) < MIN_FILL
  ) {
    return null;
  }

  const swatch = { r: median(reds), g: median(greens), b: median(blues), area, top, left, bottom };
  let uniform = 0;
  for (let index = 0; index < area; index += 1) {
    if (
      Math.abs(reds[index]! - swatch.r) <= UNIFORM_TOLERANCE &&
      Math.abs(greens[index]! - swatch.g) <= UNIFORM_TOLERANCE &&
      Math.abs(blues[index]! - swatch.b) <= UNIFORM_TOLERANCE
    ) {
      uniform += 1;
    }
  }

  if (uniform / area < MIN_UNIFORM_SHARE) {
    return null;
  }

  if (touchesBorder && isNeutral(swatch)) {
    return null;
  }

  return swatch;
}

function isNeutral({ r, g, b }: Pick<Swatch, 'r' | 'g' | 'b'>): boolean {
  const oklch = toOklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 });
  return !oklch || oklch.mode !== 'oklch' || (oklch.c ?? 0) < BACKGROUND_CHROMA_MAX;
}

function isDuplicate(swatch: Swatch, kept: Swatch[]): boolean {
  return kept.some(
    (other) =>
      Math.abs(other.r - swatch.r) <= DUPLICATE_TOLERANCE &&
      Math.abs(other.g - swatch.g) <= DUPLICATE_TOLERANCE &&
      Math.abs(other.b - swatch.b) <= DUPLICATE_TOLERANCE,
  );
}

/** Reading order: rows top to bottom (swatches overlapping vertically share a row), then left to right. */
function readingOrder(swatches: Swatch[]): Swatch[] {
  const byTop = [...swatches].sort((left, right) => left.top - right.top);
  const rows: Swatch[][] = [];

  for (const swatch of byTop) {
    const row = rows.find((candidate) => candidate.some((other) => swatch.top <= other.bottom && other.top <= swatch.bottom));
    if (row) row.push(swatch);
    else rows.push([swatch]);
  }

  return rows.flatMap((row) => row.sort((left, right) => left.left - right.left));
}

function toHex({ r, g, b }: Swatch): string {
  return normalizeHex(`#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`);
}

export function detectSwatchColors(raster: RasterData): ExtractedColor[] | null {
  const { width, height } = raster;
  const visited = new Uint8Array(width * height);
  const found: Swatch[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (visited[pixel] || !isOpaque(raster.data, pixel) || !isFlatSeed(raster, x, y)) continue;
      const swatch = growRegion(raster, pixel, visited);
      if (swatch) found.push(swatch);
    }
  }

  const coverage = found.reduce((sum, swatch) => sum + swatch.area, 0) / (width * height);

  if (found.length < MIN_SWATCHES || coverage < MIN_COVERAGE) {
    return null;
  }

  const unique: Swatch[] = [];
  for (const swatch of readingOrder(found)) {
    if (!isDuplicate(swatch, unique)) unique.push(swatch);
  }

  if (
    unique.length < MIN_SWATCHES ||
    unique.filter((swatch) => !isNeutral(swatch)).length < MIN_CHROMATIC_SWATCHES
  ) {
    return null;
  }

  const kept = unique.slice(0, MAX_SWATCHES);
  const totalArea = kept.reduce((sum, swatch) => sum + swatch.area, 0);

  return kept.map((swatch) => ({ hex: toHex(swatch), prominence: swatch.area / totalArea }));
}
