import { contrastRatio, evaluateContrast, getContrastStatus } from './contrast';

const LIGHT_TEXT = '#FFFFFF';
const DARK_TEXT = '#1A1C1E';
const PURE_BLACK = '#000000';
const AA_NORMAL_TEXT = 4.5;

export type ReadableTextChoice = {
  textHex: string;
  label: 'claro' | 'oscuro';
  ratio: number;
};

/**
 * Picks black or white text for a background color using WCAG contrast ratio.
 */
export function pickReadableTextColor(backgroundHex: string): string {
  return getReadableTextChoice(backgroundHex).textHex;
}

export function getReadableTextChoice(backgroundHex: string): ReadableTextChoice {
  const whiteContrast = contrastRatio(LIGHT_TEXT, backgroundHex);
  const darkContrast = contrastRatio(DARK_TEXT, backgroundHex);

  const best = whiteContrast >= darkContrast
    ? { textHex: LIGHT_TEXT, label: 'claro' as const, ratio: whiteContrast }
    : { textHex: DARK_TEXT, label: 'oscuro' as const, ratio: darkContrast };

  // Mid-tones (a copper or a teal) can sit between white and the soft near-black
  // without reaching AA on either. Pure black is the last resort before failing.
  if (best.ratio < AA_NORMAL_TEXT) {
    const blackContrast = contrastRatio(PURE_BLACK, backgroundHex);
    if (blackContrast > best.ratio) {
      return { textHex: PURE_BLACK, label: 'oscuro', ratio: blackContrast };
    }
  }

  return best;
}

export function getReadableTextContrastStatus(backgroundHex: string) {
  const choice = getReadableTextChoice(backgroundHex);
  const evaluation = evaluateContrast(choice.textHex, backgroundHex);

  return {
    ...choice,
    level: evaluation.normalText,
    status: getContrastStatus(evaluation, 'AA'),
  };
}

/**
 * Returns true when a light selection ring reads better on the swatch.
 */
export function prefersLightSelectionRing(backgroundHex: string): boolean {
  return pickReadableTextColor(backgroundHex) === LIGHT_TEXT;
}
