import { converter } from 'culori';

import {
  adjustLightnessForContrast,
  contrastRatio,
  relativeLuminance,
} from '../utils/colorMath';
import { normalizeHex } from './normalizeHex';

export { contrastRatio, relativeLuminance } from '../utils/colorMath';

export type WCAGLevel = 'fail' | 'AA' | 'AAA';

export type ContrastTarget = 'AA' | 'AAA';

export type ContrastPairRole =
  | 'on-surface/surface'
  | 'primary/surface'
  | 'primary/neutral-light'
  | 'accent/surface'
  | 'accent/neutral-dark';

export type Palette = {
  primary: string;
  accent: string;
  surface: string;
  onSurface: string;
  neutralLight: string;
  neutralDark: string;
};

/** Short Spanish sample for contrast previews in the UI. */
export const CONTRAST_SAMPLE_TEXT =
  'La tipografía legible mejora la lectura en pantalla.';

export type ColorToken = {
  role: keyof Palette;
  hex: string;
};

export type ContrastResult = {
  pairRole: ContrastPairRole;
  foreground: ColorToken;
  background: ColorToken;
  ratio: number;
  normalText: WCAGLevel;
  largeText: WCAGLevel;
};

export type ContrastStatus = 'pass' | 'warning' | 'fail';

export interface ContrastEvaluation {
  ratio: number;
  normalText: WCAGLevel;
  largeText: WCAGLevel;
}

const NORMAL_TEXT_AA = 4.5;
const NORMAL_TEXT_AAA = 7;
const LARGE_TEXT_AA = 3;
const LARGE_TEXT_AAA = 4.5;

const toOklch = converter('oklch');

/**
 * Maps a contrast ratio to a WCAG 2.2 level for normal or large text.
 */
export function getWCAGLevel(ratio: number, isLargeText: boolean): WCAGLevel {
  if (isLargeText) {
    if (ratio >= LARGE_TEXT_AAA) {
      return 'AAA';
    }

    if (ratio >= LARGE_TEXT_AA) {
      return 'AA';
    }

    return 'fail';
  }

  if (ratio >= NORMAL_TEXT_AAA) {
    return 'AAA';
  }

  if (ratio >= NORMAL_TEXT_AA) {
    return 'AA';
  }

  return 'fail';
}

/**
 * Evaluates contrast between two colors and returns ratio plus WCAG levels.
 */
export function evaluateContrast(hexA: string, hexB: string): ContrastEvaluation {
  const ratio = contrastRatio(hexA, hexB);

  return {
    ratio,
    normalText: getWCAGLevel(ratio, false),
    largeText: getWCAGLevel(ratio, true),
  };
}

const SEMANTIC_PAIRS: Array<{
  pairRole: ContrastPairRole;
  foreground: keyof Palette;
  background: keyof Palette;
}> = [
  { pairRole: 'on-surface/surface', foreground: 'onSurface', background: 'surface' },
  { pairRole: 'primary/surface', foreground: 'primary', background: 'surface' },
  { pairRole: 'primary/neutral-light', foreground: 'primary', background: 'neutralLight' },
  { pairRole: 'accent/surface', foreground: 'accent', background: 'surface' },
  { pairRole: 'accent/neutral-dark', foreground: 'accent', background: 'neutralDark' },
];

function meetsTarget(level: WCAGLevel, target: ContrastTarget): boolean {
  if (level === 'fail') {
    return false;
  }

  if (target === 'AA') {
    return level === 'AA' || level === 'AAA';
  }

  return level === 'AAA';
}

/**
 * Maps a contrast evaluation to a pass/warning/fail status for the selected target.
 * Normal text is the primary criterion; large text can downgrade fail to warning.
 */
export function getContrastStatus(
  evaluation: Pick<ContrastEvaluation, 'normalText' | 'largeText'>,
  target: ContrastTarget,
): ContrastStatus {
  if (meetsTarget(evaluation.normalText, target)) {
    return 'pass';
  }

  if (meetsTarget(evaluation.largeText, target)) {
    return 'warning';
  }

  return 'fail';
}

function isPresentHex(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export type AccessibleVariantSuggestion = {
  hex: string;
  ratio: number;
  normalText: WCAGLevel;
  /** OKLCH lightness delta from the original foreground (0 when already compliant). */
  deltaL: number;
};

function getTargetRatio(target: ContrastTarget): number {
  return target === 'AAA' ? NORMAL_TEXT_AAA : NORMAL_TEXT_AA;
}

/**
 * Suggests the closest OKLCH lightness adjustment to the foreground that meets the target.
 * Keeps hue and chroma intact; searches both directions and picks the smallest change.
 */
export function suggestAccessibleForeground(
  foregroundHex: string,
  backgroundHex: string,
  target: ContrastTarget,
): AccessibleVariantSuggestion | null {
  const targetRatio = getTargetRatio(target);
  const normalizedForeground = normalizeHex(foregroundHex);
  const evaluation = evaluateContrast(normalizedForeground, backgroundHex);

  if (evaluation.ratio >= targetRatio) {
    return {
      hex: normalizedForeground,
      ratio: evaluation.ratio,
      normalText: evaluation.normalText,
      deltaL: 0,
    };
  }

  const oklch = toOklch(normalizedForeground);

  if (!oklch || oklch.mode !== 'oklch') {
    return null;
  }

  const originalL = oklch.l ?? 0;
  const hex = adjustLightnessForContrast(normalizedForeground, backgroundHex, targetRatio);
  const suggested = evaluateContrast(hex, backgroundHex);

  if (suggested.ratio < targetRatio) {
    return null;
  }

  const adjusted = toOklch(hex);
  const deltaL = (adjusted?.l ?? originalL) - originalL;

  return {
    hex,
    ratio: suggested.ratio,
    normalText: suggested.normalText,
    deltaL,
  };
}

/**
 * Evaluates the five semantic palette pairs defined for accessibility review.
 */
export function evaluatePalette(palette: Palette): ContrastResult[] {
  const results: ContrastResult[] = [];

  for (const pair of SEMANTIC_PAIRS) {
    const foregroundHex = palette[pair.foreground];
    const backgroundHex = palette[pair.background];

    if (!isPresentHex(foregroundHex) || !isPresentHex(backgroundHex)) {
      continue;
    }

    const evaluation = evaluateContrast(foregroundHex, backgroundHex);

    results.push({
      pairRole: pair.pairRole,
      foreground: { role: pair.foreground, hex: foregroundHex },
      background: { role: pair.background, hex: backgroundHex },
      ratio: evaluation.ratio,
      normalText: evaluation.normalText,
      largeText: evaluation.largeText,
    });
  }

  return results;
}
