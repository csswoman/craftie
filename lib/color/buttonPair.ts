import { contrastRatio, mixColors } from '../utils/colorMath';

export type ButtonPair = { fill: string; on: string };

/** WCAG 1.4.3 for the label, 1.4.11 for the button boundary against its surface. */
export const BUTTON_LABEL_MIN = 4.5;
export const BUTTON_FILL_MIN = 3;

export function isUsableButtonPair(pair: ButtonPair, surfaceHex: string): boolean {
  return (
    contrastRatio(pair.on, pair.fill) >= BUTTON_LABEL_MIN &&
    contrastRatio(pair.fill, surfaceHex) >= BUTTON_FILL_MIN
  );
}

/**
 * First candidate whose label reads on the fill (4.5:1) and whose fill stands
 * out from the surface it sits on (3:1). The fallback is returned untouched, so
 * pass an ink/paper pair that is known to work.
 */
export function pickButtonPair(
  candidates: readonly ButtonPair[],
  surfaceHex: string,
  fallback: ButtonPair,
): ButtonPair {
  return candidates.find((pair) => isUsableButtonPair(pair, surfaceHex)) ?? fallback;
}

/** Opaque tint: `share` (0-1) of `colorHex` over `surfaceHex`, so contrast can be measured on it. */
export function softFill(colorHex: string, surfaceHex: string, share: number): string {
  return mixColors(surfaceHex, colorHex, share);
}
