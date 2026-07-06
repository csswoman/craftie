import { formatHex } from 'culori';

import { HARMONY_CLUSTER_TOLERANCE } from './harmonyConstants';
import {
  detectOutliers,
  getPaletteStats,
  isChromatic,
  toPaletteEntries,
} from './harmonyAnalysisCore';
import type {
  HarmonyAnalysis,
  HarmonyPattern,
  HarmonySuggestion,
  OklchColor,
  PaletteColorEntry,
  PaletteOutlier,
} from './harmonyTypes';
import { circularMeanHue, hueDistance } from './harmonyMath';
import { detectHarmonyPattern } from './harmonyPattern';

export {
  ANALOGOUS_SPREAD,
  CHROMA_MIN,
  CHROMA_OUTLIER_THRESHOLD,
  HARMONY_CLUSTER_TOLERANCE,
  HUE_OUTLIER_THRESHOLD,
  LIGHTNESS_OUTLIER_THRESHOLD,
  MONOCHROMATIC_SPREAD,
} from './harmonyConstants';

export type {
  HarmonyAnalysis,
  HarmonyConfidence,
  HarmonyPattern,
  HarmonySuggestion,
  HarmonyType,
  OklchColor,
  OutlierDimension,
  PaletteColorEntry,
  PaletteOklchStats,
  PaletteOutlier,
} from './harmonyTypes';

export { detectOutliers, getPaletteStats } from './harmonyAnalysisCore';
export { detectHarmonyPattern } from './harmonyPattern';

function assertNonEmptyPalette(hexes: string[]): void {
  if (!Array.isArray(hexes) || hexes.length === 0) {
    throw new Error('Palette must contain at least one color');
  }
}

function nearestHue(hue: number, candidates: number[]): number {
  return candidates.reduce((best, candidate) =>
    hueDistance(hue, candidate) < hueDistance(hue, best) ? candidate : best,
  );
}

function targetHueForSuggestion(
  outlier: PaletteOutlier,
  pattern: HarmonyPattern,
  inlierHues: number[],
): number {
  if (outlier.oklch.h === undefined) {
    return pattern.anchors[0] ?? 0;
  }

  if (pattern.anchors.length > 0) {
    return nearestHue(outlier.oklch.h, pattern.anchors);
  }

  if (inlierHues.length > 0) {
    return circularMeanHue(inlierHues);
  }

  return outlier.oklch.h;
}

function oklchToHex(color: OklchColor): string {
  const hex = formatHex({
    mode: 'oklch',
    l: color.l,
    c: color.c,
    h: color.h,
  });

  if (!hex) {
    throw new Error('Unable to format suggested color as hex');
  }

  return hex.toUpperCase();
}

export function suggestHarmonyAdjustments(
  colors: PaletteColorEntry[],
  outliers: PaletteOutlier[],
  pattern: HarmonyPattern,
): HarmonySuggestion[] {
  const outlierHexes = new Set(outliers.map((outlier) => outlier.hex));
  const inlierHues = colors
    .filter((color) => !outlierHexes.has(color.hex) && isChromatic(color.oklch))
    .map((color) => color.oklch.h)
    .filter((hue): hue is number => hue !== undefined);

  return outliers.map((outlier) => {
    const targetHue = targetHueForSuggestion(outlier, pattern, inlierHues);
    const suggestedHex = oklchToHex({
      l: outlier.oklch.l,
      c: outlier.oklch.c,
      h: targetHue,
    });

    const harmonyLabel = pattern.type.replace('_', ' ');

    return {
      originalHex: outlier.hex,
      suggestedHex,
      reason: `Ajusta el matiz hacia la armonía ${harmonyLabel} detectada, manteniendo luminosidad y croma.`,
    };
  });
}

export function analyzeHarmony(hexes: string[]): HarmonyAnalysis {
  assertNonEmptyPalette(hexes);

  const colors = toPaletteEntries(hexes);
  const stats = getPaletteStats(colors);
  const patternOnAll = detectHarmonyPattern(colors);
  const outliers = detectOutliers(colors, stats, patternOnAll);
  const outlierHexes = new Set(outliers.map((outlier) => outlier.hex));
  const inlierColors = colors.filter((color) => !outlierHexes.has(color.hex));
  const pattern =
    inlierColors.length > 0 && inlierColors.length < colors.length
      ? detectHarmonyPattern(inlierColors)
      : patternOnAll;
  const suggestions = suggestHarmonyAdjustments(colors, outliers, pattern);

  return {
    colors,
    stats,
    pattern,
    outliers,
    suggestions,
  };
}
