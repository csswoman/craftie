import { normalizeHex } from './normalizeHex';
import {
  contrastRatio,
  hexToOklchChannels,
  oklchChannelsToHex,
} from '../utils/colorMath';

export type TonalScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type TonalScale = Record<TonalScaleStep, string>;

export const TONAL_SCALE_STEPS = [
  50,
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
] as const satisfies readonly TonalScaleStep[];

export const TONAL_TEXT_CARRIER_STEPS = [500, 600] as const satisfies readonly TonalScaleStep[];

export const TONAL_SCALE_TEXT_SAFETY = {
  // These conservative bands are expected to meet WCAG AA against near-white
  // UI surfaces. Exact contrast is still measured by tests because hue/chroma
  // and sRGB gamut clipping can shift the final hex.
  lightSurface: [700, 800, 900],
  // These light steps are the safe text choices against inverse/dark surfaces.
  darkSurface: [50, 100, 200],
} as const satisfies Record<'lightSurface' | 'darkSurface', readonly TonalScaleStep[]>;

const TONAL_LIGHTNESS: Record<TonalScaleStep, number> = {
  50: 0.97,
  100: 0.92,
  200: 0.84,
  300: 0.74,
  400: 0.64,
  500: 0.54,
  600: 0.45,
  700: 0.36,
  800: 0.27,
  900: 0.18,
};

const TONAL_CHROMA_MULTIPLIER: Record<TonalScaleStep, number> = {
  50: 0.18,
  100: 0.3,
  200: 0.48,
  300: 0.68,
  400: 0.86,
  500: 1,
  600: 0.95,
  700: 0.8,
  800: 0.58,
  900: 0.35,
};

/**
 * Builds a deterministic OKLCH tonal scale from one expressive color.
 * Lightness moves from near-white (50) to near-black (900). Chroma peaks near
 * the middle and is reduced toward both extremes so light tones stay usable as
 * surfaces and dark tones avoid muddy, over-saturated clipping.
 */
export function deriveTonalScale(expressiveHex: string): TonalScale {
  const base = hexToOklchChannels(normalizeHex(expressiveHex));

  return Object.fromEntries(
    TONAL_SCALE_STEPS.map((step) => [
      step,
      oklchChannelsToHex(
        TONAL_LIGHTNESS[step],
        Math.max(0.008, base.c * TONAL_CHROMA_MULTIPLIER[step]),
        base.h,
      ),
    ]),
  ) as TonalScale;
}

export function tonalStepMeetsContrast(
  scale: TonalScale,
  step: TonalScaleStep,
  surfaceHex: string,
  ratio = 4.5,
): boolean {
  return contrastRatio(scale[step], surfaceHex) >= ratio;
}
