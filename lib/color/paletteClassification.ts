import { converter } from 'culori';

import type { ExtractedColor } from './imageTypes';

export type PaletteType = 'pastel' | 'vivid' | 'dark' | 'neutral';

export type PaletteClassification = {
  type: PaletteType;
  averageLightness: number;
  averageChroma: number;
  lightnessRange: number;
  neutralWeight: number;
};

const toOklch = converter('oklch');

function normalizedWeights(colors: ExtractedColor[]): Array<{ l: number; c: number; weight: number }> {
  const channels = colors.flatMap((color) => {
    const value = toOklch(color.hex);

    return value ? [{ l: value.l ?? 0, c: value.c ?? 0, weight: Math.max(0, color.prominence) }] : [];
  });
  const total = channels.reduce((sum, color) => sum + color.weight, 0) || channels.length || 1;

  return channels.map((color) => ({ ...color, weight: color.weight / total }));
}

/** Classifies source colors using area-weighted OKLCH signals. */
export function classifyPalette(colors: ExtractedColor[]): PaletteClassification {
  const weighted = normalizedWeights(colors);

  if (weighted.length === 0) {
    return {
      type: 'neutral',
      averageLightness: 0,
      averageChroma: 0,
      lightnessRange: 0,
      neutralWeight: 1,
    };
  }

  const averageLightness = weighted.reduce((sum, color) => sum + color.l * color.weight, 0);
  const averageChroma = weighted.reduce((sum, color) => sum + color.c * color.weight, 0);
  const lightnesses = weighted.map((color) => color.l);
  const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
  const neutralWeight = weighted.reduce(
    (sum, color) => sum + (color.c < 0.03 ? color.weight : 0),
    0,
  );

  let type: PaletteType;

  if (neutralWeight >= 0.65 || averageChroma < 0.03) {
    type = 'neutral';
  } else if (averageLightness > 0.8 && averageChroma <= 0.12 && lightnessRange < 0.25) {
    type = 'pastel';
  } else if (averageLightness < 0.4 && lightnessRange < 0.35) {
    type = 'dark';
  } else if (averageChroma > 0.12 || lightnessRange > 0.35) {
    type = 'vivid';
  } else {
    type = averageLightness >= 0.68 ? 'pastel' : averageLightness <= 0.45 ? 'dark' : 'vivid';
  }

  return { type, averageLightness, averageChroma, lightnessRange, neutralWeight };
}
