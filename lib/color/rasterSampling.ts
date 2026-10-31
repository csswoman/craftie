import { converter } from 'culori';

import type { RasterData, RgbSample } from './imageTypes';

const NEAR_WHITE_L = 0.95;
const NEAR_BLACK_L = 0.05;
const NEUTRAL_DOMINANCE_THRESHOLD = 0.4;
/** Near-white/black with at least this chroma (cream, ink blue) is color identity, not noise. */
const TINTED_NEUTRAL_CHROMA_MIN = 0.015;
/** Pixels below half opacity are antialiased edges, not image color. */
const ALPHA_MIN = 128;
/** Bits kept per channel when grouping pixels; 5 bits = 32 levels. */
const QUANTIZE_BITS = 5;

const toOklch = converter('oklch');

export function samplePixels(raster: RasterData, sampleStep: number, sampleOffset = 0): RgbSample[] {
  const samples: RgbSample[] = [];
  const { data, width, height } = raster;
  const offset = ((sampleOffset % sampleStep) + sampleStep) % sampleStep;

  for (let y = offset; y < height; y += sampleStep) {
    for (let x = offset; x < width; x += sampleStep) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3] ?? 0;

      if (alpha < ALPHA_MIN) {
        continue;
      }

      samples.push({ r: data[index] ?? 0, g: data[index + 1] ?? 0, b: data[index + 2] ?? 0 });
    }
  }

  return samples;
}

/**
 * Groups near-identical pixels into weighted bins (mean color, pixel count).
 * Clustering bins instead of raw pixels removes JPEG noise and keeps k-means
 * fast on full-resolution samples.
 */
export function quantizeSamples(samples: RgbSample[]): RgbSample[] {
  const shift = 8 - QUANTIZE_BITS;
  const bins = new Map<number, { r: number; g: number; b: number; weight: number }>();

  for (const sample of samples) {
    const key = ((sample.r >> shift) << (QUANTIZE_BITS * 2)) |
      ((sample.g >> shift) << QUANTIZE_BITS) |
      (sample.b >> shift);
    const weight = sample.weight ?? 1;
    const bin = bins.get(key);

    if (bin) {
      bin.r += sample.r * weight;
      bin.g += sample.g * weight;
      bin.b += sample.b * weight;
      bin.weight += weight;
    } else {
      bins.set(key, { r: sample.r * weight, g: sample.g * weight, b: sample.b * weight, weight });
    }
  }

  return [...bins.values()].map((bin) => ({
    r: Math.round(bin.r / bin.weight),
    g: Math.round(bin.g / bin.weight),
    b: Math.round(bin.b / bin.weight),
    weight: bin.weight,
  }));
}

function getOklchLightnessAndChroma(rgb: RgbSample): { lightness: number; chroma: number } {
  const oklch = toOklch({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  });

  if (!oklch || oklch.mode !== 'oklch') {
    return { lightness: 0, chroma: 0 };
  }

  return { lightness: oklch.l, chroma: oklch.c ?? 0 };
}

/**
 * Drops near-white and near-black samples unless they cover a large share of
 * the image (then they are the subject or the backdrop, not noise).
 */
export function filterNeutralSamples(samples: RgbSample[]): RgbSample[] {
  if (samples.length === 0) {
    return samples;
  }

  const classified = samples.map((sample) => {
    const { lightness, chroma } = getOklchLightnessAndChroma(sample);
    const tinted = chroma >= TINTED_NEUTRAL_CHROMA_MIN;
    return {
      sample,
      weight: sample.weight ?? 1,
      white: lightness > NEAR_WHITE_L && !tinted,
      black: lightness < NEAR_BLACK_L && !tinted,
    };
  });
  const total = classified.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  const whiteRatio = classified.reduce((sum, entry) => sum + (entry.white ? entry.weight : 0), 0) / total;
  const blackRatio = classified.reduce((sum, entry) => sum + (entry.black ? entry.weight : 0), 0) / total;
  const keepWhite = whiteRatio > NEUTRAL_DOMINANCE_THRESHOLD;
  const keepBlack = blackRatio > NEUTRAL_DOMINANCE_THRESHOLD;

  return classified
    .filter((entry) => (keepWhite || !entry.white) && (keepBlack || !entry.black))
    .map((entry) => entry.sample);
}
