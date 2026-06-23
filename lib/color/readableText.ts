import { contrastRatio } from './contrast';

const LIGHT_TEXT = '#FFFFFF';
const DARK_TEXT = '#1A1C1E';

/**
 * Picks black or white text for a background color using WCAG contrast ratio.
 */
export function pickReadableTextColor(backgroundHex: string): string {
  const whiteContrast = contrastRatio(LIGHT_TEXT, backgroundHex);
  const darkContrast = contrastRatio(DARK_TEXT, backgroundHex);

  return whiteContrast >= darkContrast ? LIGHT_TEXT : DARK_TEXT;
}

/**
 * Returns true when a light selection ring reads better on the swatch.
 */
export function prefersLightSelectionRing(backgroundHex: string): boolean {
  return pickReadableTextColor(backgroundHex) === LIGHT_TEXT;
}
