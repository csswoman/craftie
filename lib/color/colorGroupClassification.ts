import { converter } from 'culori';

import type { ColorGroupId } from './selectableColors';

const toOklch = converter('oklch');

/** OKLCH lightness (0–1) above which a low-chroma color reads as a light neutral. */
export const LIGHT_NEUTRAL_LIGHTNESS_MIN = 0.78;
/** OKLCH lightness (0–1) at or below which a low-chroma color reads as a dark neutral. */
export const DARK_NEUTRAL_LIGHTNESS_MAX = 0.39;
/** OKLCH chroma (0–~0.4) at or below which a color is treated as neutral, not intense. */
export const NEUTRAL_CHROMA_MAX = 0.065;
/** OKLCH chroma (0–~0.4) at or above which a color is treated as an intense accent. */
export const INTENSE_CHROMA_MIN = 0.062;

export type ColorGroupThresholds = {
  lightNeutralLightnessMin: number;
  darkNeutralLightnessMax: number;
  neutralChromaMax: number;
  intenseChromaMin: number;
};

export const DEFAULT_COLOR_GROUP_THRESHOLDS: ColorGroupThresholds = {
  lightNeutralLightnessMin: LIGHT_NEUTRAL_LIGHTNESS_MIN,
  darkNeutralLightnessMax: DARK_NEUTRAL_LIGHTNESS_MAX,
  neutralChromaMax: NEUTRAL_CHROMA_MAX,
  intenseChromaMin: INTENSE_CHROMA_MIN,
};

/**
 * Classifies a color into palette buckets using OKLCH lightness and chroma.
 *
 * Order: intense chroma first, then light/dark neutrals by lightness + low chroma,
 * then lightness fallbacks for muted mid-chroma colors.
 */
export function classifyColorToGroup(
  hex: string,
  thresholds: ColorGroupThresholds,
): ColorGroupId {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    return 'bold';
  }

  const { l: lightness, c: chroma } = color;
  const {
    lightNeutralLightnessMin,
    darkNeutralLightnessMax,
    neutralChromaMax,
    intenseChromaMin,
  } = thresholds;

  if (chroma >= intenseChromaMin) {
    return 'bold';
  }

  const isNeutralChroma = chroma <= neutralChromaMax;

  if (lightness >= lightNeutralLightnessMin && isNeutralChroma) {
    return 'light-neutral';
  }

  if (lightness <= darkNeutralLightnessMax && isNeutralChroma) {
    return 'dark-neutral';
  }

  if (lightness >= lightNeutralLightnessMin) {
    return 'light-neutral';
  }

  if (lightness <= darkNeutralLightnessMax) {
    return 'dark-neutral';
  }

  return 'bold';
}
