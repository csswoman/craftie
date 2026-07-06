import { converter } from 'culori';

import type { RasterData, RgbSample } from './imageTypes';

const NEAR_WHITE_L = 0.95;
const NEAR_BLACK_L = 0.05;
const NEUTRAL_DOMINANCE_THRESHOLD = 0.4;

const toOklch = converter('oklch');

function rgbSample(r: number, g: number, b: number): RgbSample {
  return { r, g, b };
}

export function samplePixels(raster: RasterData, sampleStep: number, sampleOffset = 0): RgbSample[] {
  const samples: RgbSample[] = [];
  const { data, width, height } = raster;
  const offset = ((sampleOffset % sampleStep) + sampleStep) % sampleStep;

  for (let y = offset; y < height; y += sampleStep) {
    for (let x = offset; x < width; x += sampleStep) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3] ?? 0;

      if (alpha === 0) {
        continue;
      }

      samples.push(rgbSample(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0));
    }
  }

  return samples;
}

function getOklchLightness(rgb: RgbSample): number {
  const oklch = toOklch({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  });

  if (!oklch || oklch.mode !== 'oklch') {
    return 0;
  }

  return oklch.l;
}

function isNearWhite(rgb: RgbSample): boolean {
  return getOklchLightness(rgb) > NEAR_WHITE_L;
}

function isNearBlack(rgb: RgbSample): boolean {
  return getOklchLightness(rgb) < NEAR_BLACK_L;
}

export function filterNeutralSamples(samples: RgbSample[]): RgbSample[] {
  if (samples.length === 0) {
    return samples;
  }

  const whiteCount = samples.filter(isNearWhite).length;
  const blackCount = samples.filter(isNearBlack).length;
  const whiteRatio = whiteCount / samples.length;
  const blackRatio = blackCount / samples.length;
  const keepWhite = whiteRatio > NEUTRAL_DOMINANCE_THRESHOLD;
  const keepBlack = blackRatio > NEUTRAL_DOMINANCE_THRESHOLD;

  return samples.filter((sample) => {
    if (!keepWhite && isNearWhite(sample)) {
      return false;
    }

    if (!keepBlack && isNearBlack(sample)) {
      return false;
    }

    return true;
  });
}
