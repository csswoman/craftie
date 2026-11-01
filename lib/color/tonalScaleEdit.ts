import { TONAL_SCALE_STEPS, type TonalScaleStep } from './tonalScale';
import { contrastRatio, hexToOklchChannels, oklchChannelsToHex } from '../utils/colorMath';

export type TonalScaleRow = Record<TonalScaleStep, string>;

/**
 * Steps whose lightness does not go down from the previous step. A scale reads
 * as a ramp only while lightness decreases from 50 to 900, so these are the
 * steps worth flagging after a manual edit.
 */
export function findOutOfOrderSteps(scale: TonalScaleRow): TonalScaleStep[] {
  const flagged: TonalScaleStep[] = [];
  let previous = Number.POSITIVE_INFINITY;
  for (const step of TONAL_SCALE_STEPS) {
    const lightness = hexToOklchChannels(scale[step]).l;
    if (lightness >= previous - 0.0001) flagged.push(step);
    previous = lightness;
  }
  return flagged;
}

/** Contrast of one step against a surface, with the WCAG AA text verdict. */
export function stepContrast(stepHex: string, surfaceHex: string) {
  const ratio = contrastRatio(stepHex, surfaceHex);
  return { ratio, passesAa: ratio >= 4.5, passesLarge: ratio >= 3 };
}

/** Returns the hex for a lightness/chroma pair while keeping the hue of `hex`. */
export function withLightnessAndChroma(hex: string, lightness: number, chroma: number): string {
  const { h } = hexToOklchChannels(hex);
  return oklchChannelsToHex(Math.min(1, Math.max(0, lightness)), Math.max(0, chroma), h);
}
