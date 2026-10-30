import { oklchChannelsToHex } from '../utils/colorMath';
import type { NeutralTint } from './neutralTint';
import { toOklch } from './oklchMath';

/**
 * UI neutral scale: white, grays and black for interface chrome (pages,
 * cards, dividers, borders, disabled states, body text). 0 is white and
 * 1000 is black; the steps in between are what web and mobile UIs reach for
 * when they need "a gray".
 */
export const NEUTRAL_SCALE_STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000] as const;

export type NeutralScaleStep = (typeof NEUTRAL_SCALE_STEPS)[number];
export type NeutralScale = Record<NeutralScaleStep, string>;

/** OKLCH lightness per step. */
export const NEUTRAL_SCALE_LIGHTNESS: Record<NeutralScaleStep, number> = {
  0: 1,
  50: 0.985,
  100: 0.965,
  200: 0.925,
  300: 0.87,
  400: 0.71,
  500: 0.555,
  600: 0.45,
  700: 0.37,
  800: 0.27,
  900: 0.205,
  950: 0.15,
  1000: 0,
};

/**
 * Tint chroma per step at full strength. It stays below what reads as a
 * color: the grays harmonize with the brand hue but still look gray. White
 * and black stay pure.
 */
export const NEUTRAL_SCALE_CHROMA: Record<NeutralScaleStep, number> = {
  0: 0,
  50: 0.002,
  100: 0.003,
  200: 0.004,
  300: 0.006,
  400: 0.008,
  500: 0.01,
  600: 0.01,
  700: 0.01,
  800: 0.008,
  900: 0.008,
  950: 0.006,
  1000: 0,
};

/** Reference chroma under which a neutral counts as pure gray. */
const TINTED_REFERENCE_CHROMA_MIN = 0.004;

export function deriveNeutralScale(tint: Pick<NeutralTint, 'hue' | 'chromaScale'>): NeutralScale {
  return Object.fromEntries(
    NEUTRAL_SCALE_STEPS.map((step) => [
      step,
      oklchChannelsToHex(
        NEUTRAL_SCALE_LIGHTNESS[step],
        NEUTRAL_SCALE_CHROMA[step] * tint.chromaScale,
        tint.hue,
      ),
    ]),
  ) as NeutralScale;
}

/**
 * Reads the tint back from a derived neutral (body text works best: it has
 * the most chroma of the structural tokens), so callers holding only final
 * colors can rebuild the matching scale.
 */
export function neutralTintFromHex(referenceHex: string): Pick<NeutralTint, 'hue' | 'chromaScale'> {
  const reference = toOklch(referenceHex);
  const chroma = reference?.c ?? 0;

  return chroma >= TINTED_REFERENCE_CHROMA_MIN
    ? { hue: reference?.h ?? 0, chromaScale: 1 }
    : { hue: 0, chromaScale: 0 };
}
