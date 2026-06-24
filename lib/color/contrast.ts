import { converter, parse } from 'culori';
import type { Rgb } from 'culori';

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

const toRgb = converter('rgb');

function assertValidColorInput(hex: string): void {
  if (typeof hex !== 'string' || hex.trim() === '') {
    throw new Error(
      `Invalid color input: expected a non-empty hex string, received ${String(hex)}`,
    );
  }
}

function hasTransparency(color: { alpha?: number; mode?: string }): boolean {
  if (color.mode === 'transparent') {
    return true;
  }

  return typeof color.alpha === 'number' && color.alpha < 1;
}

function parseOpaqueColor(hex: string): Rgb {
  assertValidColorInput(hex);

  const trimmed = hex.trim();
  const parsed = parse(trimmed);

  if (parsed === undefined) {
    throw new Error(`Unable to parse color: "${trimmed}"`);
  }

  if (hasTransparency(parsed)) {
    throw new Error(`Unsupported alpha/transparency in color: "${trimmed}"`);
  }

  const rgb = toRgb(parsed);

  if (rgb === undefined) {
    throw new Error(`Unable to convert color to RGB: "${trimmed}"`);
  }

  if (hasTransparency(rgb)) {
    throw new Error(`Unsupported alpha/transparency in color: "${trimmed}"`);
  }

  return rgb;
}

function channelToLinear(channel: number): number {
  if (channel <= 0.03928) {
    return channel / 12.92;
  }

  return ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * WCAG 2.2 relative luminance for an sRGB color.
 * @see https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseOpaqueColor(hex);

  const linearR = channelToLinear(r);
  const linearG = channelToLinear(g);
  const linearB = channelToLinear(b);

  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

/**
 * WCAG 2.2 contrast ratio between two sRGB colors.
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

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
