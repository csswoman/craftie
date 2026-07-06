import { contrastRatio, evaluateContrast, getContrastStatus } from './contrast';

const LIGHT_TEXT = '#FFFFFF';
const DARK_TEXT = '#1A1C1E';

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

  if (whiteContrast >= darkContrast) {
    return { textHex: LIGHT_TEXT, label: 'claro', ratio: whiteContrast };
  }

  return { textHex: DARK_TEXT, label: 'oscuro', ratio: darkContrast };
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
