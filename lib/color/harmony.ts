import { converter, formatHex } from 'culori';

import { normalizeHex } from './normalizeHex';

/** Minimum chroma (OKLCH) to treat a color as having a meaningful hue. */
export const CHROMA_MIN = 0.04;

/** Hue deviation from group mean that marks an outlier (degrees). */
export const HUE_OUTLIER_THRESHOLD = 60;

/** Lightness deviation from group mean that marks an outlier (OKLCH L, 0–1). */
export const LIGHTNESS_OUTLIER_THRESHOLD = 0.18;

/** Chroma deviation from group mean that marks an outlier (OKLCH C). */
export const CHROMA_OUTLIER_THRESHOLD = 0.08;

/** Max hue spread for a monochromatic palette (degrees). */
export const MONOCHROMATIC_SPREAD = 15;

/** Max hue spread for an analogous palette (degrees). */
export const ANALOGOUS_SPREAD = 30;

/** Cluster membership tolerance when fitting harmony patterns (degrees). */
export const HARMONY_CLUSTER_TOLERANCE = 30;

export type HarmonyType =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'split_complementary'
  | 'tetradic'
  | 'achromatic'
  | 'mixed';

export type HarmonyConfidence = 'strong' | 'weak' | 'none';

export type OutlierDimension = 'hue' | 'lightness' | 'chroma';

export interface OklchColor {
  l: number;
  c: number;
  h: number | undefined;
}

export interface PaletteColorEntry {
  hex: string;
  oklch: OklchColor;
}

export interface PaletteOklchStats {
  meanHue: number | null;
  meanLightness: number;
  meanChroma: number;
  chromaticCount: number;
}

export interface PaletteOutlier {
  hex: string;
  dimensions: OutlierDimension[];
  oklch: OklchColor;
}

export interface HarmonySuggestion {
  originalHex: string;
  suggestedHex: string;
  reason: string;
}

export interface HarmonyPattern {
  type: HarmonyType;
  confidence: HarmonyConfidence;
  /** Hue anchors (degrees) for the detected pattern, when applicable. */
  anchors: number[];
}

export interface HarmonyAnalysis {
  colors: PaletteColorEntry[];
  stats: PaletteOklchStats;
  pattern: HarmonyPattern;
  outliers: PaletteOutlier[];
  suggestions: HarmonySuggestion[];
}

const toOklch = converter('oklch');

function assertNonEmptyPalette(hexes: string[]): void {
  if (!Array.isArray(hexes) || hexes.length === 0) {
    throw new Error('Palette must contain at least one color');
  }
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function circularMeanHue(hues: number[]): number {
  let sinSum = 0;
  let cosSum = 0;

  for (const hue of hues) {
    const radians = (hue * Math.PI) / 180;
    sinSum += Math.sin(radians);
    cosSum += Math.cos(radians);
  }

  const meanRadians = Math.atan2(sinSum, cosSum);
  const degrees = (meanRadians * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

function maxHueSpread(hues: number[]): number {
  if (hues.length <= 1) {
    return 0;
  }

  let maxSpread = 0;

  for (let index = 0; index < hues.length; index += 1) {
    for (let inner = index + 1; inner < hues.length; inner += 1) {
      maxSpread = Math.max(maxSpread, hueDistance(hues[index]!, hues[inner]!));
    }
  }

  return maxSpread;
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

function medianAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const med = median(values);
  return median(values.map((value) => Math.abs(value - med)));
}

function isRobustOutlier(value: number, values: number[], threshold: number): boolean {
  const spread = medianAbsoluteDeviation(values);
  const cutoff = Math.max(threshold, spread * 2.5);
  return Math.abs(value - median(values)) > cutoff;
}

function largestCohesiveHueSubset(hues: number[], maxSpread: number): number[] {
  if (hues.length === 0) {
    return [];
  }

  let bestSubset: number[] = [];

  for (let mask = 1; mask < 1 << hues.length; mask += 1) {
    const subset = hues.filter((_, index) => (mask >> index) & 1);

    if (maxHueSpread(subset) <= maxSpread && subset.length > bestSubset.length) {
      bestSubset = subset;
    }
  }

  return bestSubset;
}

function cohesiveSubsetThreshold(hueCount: number): number {
  return Math.max(2, Math.ceil(hueCount * 0.6));
}

function isHueOutlier(
  hue: number,
  hues: number[],
  pattern: HarmonyPattern,
): boolean {
  if (pattern.type === 'monochromatic') {
    const anchor = pattern.anchors[0];

    if (anchor === undefined) {
      return false;
    }

    return hueDistance(hue, anchor) > MONOCHROMATIC_SPREAD;
  }

  if (pattern.type === 'analogous') {
    const anchor = pattern.anchors[0];

    if (anchor === undefined) {
      return false;
    }

    return hueDistance(hue, anchor) > ANALOGOUS_SPREAD;
  }

  if (
    pattern.type === 'complementary' ||
    pattern.type === 'triadic' ||
    pattern.type === 'split_complementary' ||
    pattern.type === 'tetradic'
  ) {
    return !pattern.anchors.some(
      (anchor) => hueDistance(hue, anchor) <= HARMONY_CLUSTER_TOLERANCE,
    );
  }

  if (pattern.type === 'mixed' && pattern.anchors[0] !== undefined) {
    return hueDistance(hue, pattern.anchors[0]) > HUE_OUTLIER_THRESHOLD;
  }

  return false;
}

function nearestHue(hue: number, candidates: number[]): number {
  return candidates.reduce((best, candidate) =>
    hueDistance(hue, candidate) < hueDistance(hue, best) ? candidate : best,
  );
}

function isChromatic(color: OklchColor): boolean {
  return color.c >= CHROMA_MIN && color.h !== undefined;
}

function toPaletteEntries(hexes: string[]): PaletteColorEntry[] {
  return hexes.map((hex) => {
    const normalized = normalizeHex(hex);
    const converted = toOklch(normalized);

    if (!converted || converted.mode !== 'oklch') {
      throw new Error(`Unable to convert color to OKLCH: "${normalized}"`);
    }

    return {
      hex: normalized,
      oklch: {
        l: converted.l ?? 0,
        c: converted.c ?? 0,
        h: converted.h,
      },
    };
  });
}

export function getPaletteStats(colors: PaletteColorEntry[]): PaletteOklchStats {
  const chromatic = colors.filter((color) => isChromatic(color.oklch));
  const hues = chromatic
    .map((color) => color.oklch.h)
    .filter((hue): hue is number => hue !== undefined);

  const meanLightness =
    colors.reduce((sum, color) => sum + color.oklch.l, 0) / colors.length;
  const meanChroma =
    colors.reduce((sum, color) => sum + color.oklch.c, 0) / colors.length;

  return {
    meanHue: hues.length > 0 ? circularMeanHue(hues) : null,
    meanLightness,
    meanChroma,
    chromaticCount: chromatic.length,
  };
}

export function detectOutliers(
  colors: PaletteColorEntry[],
  stats: PaletteOklchStats,
  pattern: HarmonyPattern,
): PaletteOutlier[] {
  const lightnessValues = colors.map((color) => color.oklch.l);
  const chromaValues = colors.map((color) => color.oklch.c);
  const outliers: PaletteOutlier[] = [];
  const canDetectLightnessChromaOutliers = colors.length >= 4;
  const chromaticHues = colors
    .filter((color) => isChromatic(color.oklch))
    .map((color) => color.oklch.h)
    .filter((hue): hue is number => hue !== undefined);

  for (const color of colors) {
    const dimensions: OutlierDimension[] = [];
    const { l, c, h } = color.oklch;

    if (
      canDetectLightnessChromaOutliers &&
      isRobustOutlier(l, lightnessValues, LIGHTNESS_OUTLIER_THRESHOLD)
    ) {
      dimensions.push('lightness');
    }

    if (
      canDetectLightnessChromaOutliers &&
      isRobustOutlier(c, chromaValues, CHROMA_OUTLIER_THRESHOLD)
    ) {
      dimensions.push('chroma');
    }

    if (
      isChromatic(color.oklch) &&
      h !== undefined &&
      isHueOutlier(h, chromaticHues, pattern)
    ) {
      dimensions.push('hue');
    }

    if (dimensions.length > 0) {
      outliers.push({
        hex: color.hex,
        dimensions,
        oklch: color.oklch,
      });
    }
  }

  return outliers;
}

function patternMatchScore(hues: number[], anchors: number[], tolerance: number): number {
  if (hues.length === 0 || anchors.length === 0) {
    return 0;
  }

  let matched = 0;

  for (const hue of hues) {
    const fitsAnchor = anchors.some((anchor) => hueDistance(hue, anchor) <= tolerance);

    if (fitsAnchor) {
      matched += 1;
    }
  }

  return matched / hues.length;
}

function complementaryScore(hues: number[]): { score: number; anchors: number[] } {
  if (hues.length < 2) {
    return { score: 0, anchors: [] };
  }

  let bestScore = 0;
  let bestAnchors: number[] = [];

  for (const anchor of hues) {
    const complement = (anchor + 180) % 360;
    const score = patternMatchScore(hues, [anchor, complement], HARMONY_CLUSTER_TOLERANCE);

    if (score > bestScore) {
      bestScore = score;
      bestAnchors = [anchor, complement];
    }
  }

  return { score: bestScore, anchors: bestAnchors };
}

function triadicScore(hues: number[]): { score: number; anchors: number[] } {
  if (hues.length < 3) {
    return { score: 0, anchors: [] };
  }

  let bestScore = 0;
  let bestAnchors: number[] = [];

  for (const anchor of hues) {
    const second = (anchor + 120) % 360;
    const third = (anchor + 240) % 360;
    const score = patternMatchScore(
      hues,
      [anchor, second, third],
      HARMONY_CLUSTER_TOLERANCE,
    );

    if (score > bestScore) {
      bestScore = score;
      bestAnchors = [anchor, second, third];
    }
  }

  return { score: bestScore, anchors: bestAnchors };
}

function splitComplementaryScore(hues: number[]): { score: number; anchors: number[] } {
  if (hues.length < 3) {
    return { score: 0, anchors: [] };
  }

  let bestScore = 0;
  let bestAnchors: number[] = [];

  for (const anchor of hues) {
    const left = (anchor + 150) % 360;
    const right = (anchor + 210) % 360;
    const score = patternMatchScore(hues, [anchor, left, right], HARMONY_CLUSTER_TOLERANCE);

    if (score > bestScore) {
      bestScore = score;
      bestAnchors = [anchor, left, right];
    }
  }

  return { score: bestScore, anchors: bestAnchors };
}

function tetradicScore(hues: number[]): { score: number; anchors: number[] } {
  if (hues.length < 4) {
    return { score: 0, anchors: [] };
  }

  let bestScore = 0;
  let bestAnchors: number[] = [];

  for (const anchor of hues) {
    const second = (anchor + 90) % 360;
    const third = (anchor + 180) % 360;
    const fourth = (anchor + 270) % 360;
    const score = patternMatchScore(
      hues,
      [anchor, second, third, fourth],
      HARMONY_CLUSTER_TOLERANCE,
    );

    if (score > bestScore) {
      bestScore = score;
      bestAnchors = [anchor, second, third, fourth];
    }
  }

  return { score: bestScore, anchors: bestAnchors };
}

function confidenceFromCoverage(coverage: number): HarmonyConfidence {
  if (coverage >= 0.85) {
    return 'strong';
  }

  if (coverage >= 0.65) {
    return 'weak';
  }

  return 'none';
}

export function detectHarmonyPattern(colors: PaletteColorEntry[]): HarmonyPattern {
  const hues = colors
    .filter((color) => isChromatic(color.oklch))
    .map((color) => color.oklch.h)
    .filter((hue): hue is number => hue !== undefined);

  if (hues.length === 0) {
    return { type: 'achromatic', confidence: 'strong', anchors: [] };
  }

  const spread = maxHueSpread(hues);

  if (spread <= MONOCHROMATIC_SPREAD) {
    return {
      type: 'monochromatic',
      confidence: 'strong',
      anchors: [circularMeanHue(hues)],
    };
  }

  if (spread <= ANALOGOUS_SPREAD) {
    return {
      type: 'analogous',
      confidence: 'strong',
      anchors: [circularMeanHue(hues)],
    };
  }

  const threshold = cohesiveSubsetThreshold(hues.length);
  const monochromaticCore = largestCohesiveHueSubset(hues, MONOCHROMATIC_SPREAD);
  const analogousCore = largestCohesiveHueSubset(hues, ANALOGOUS_SPREAD);
  const monochromaticCoreIsStrong =
    monochromaticCore.length >= threshold &&
    maxHueSpread(monochromaticCore) <= MONOCHROMATIC_SPREAD;
  const analogousCoreIsStrong =
    analogousCore.length >= threshold &&
    maxHueSpread(analogousCore) <= ANALOGOUS_SPREAD;

  if (analogousCoreIsStrong) {
    const preferMonochromatic =
      monochromaticCoreIsStrong &&
      monochromaticCore.length >= analogousCore.length;

    if (!preferMonochromatic) {
      return {
        type: 'analogous',
        confidence: confidenceFromCoverage(analogousCore.length / hues.length),
        anchors: [circularMeanHue(analogousCore)],
      };
    }
  }

  if (monochromaticCoreIsStrong) {
    return {
      type: 'monochromatic',
      confidence: confidenceFromCoverage(monochromaticCore.length / hues.length),
      anchors: [circularMeanHue(monochromaticCore)],
    };
  }

  const complementary = complementaryScore(hues);
  const triadic = triadicScore(hues);
  const split = splitComplementaryScore(hues);
  const tetradic = tetradicScore(hues);

  const candidates: Array<{ type: HarmonyType; score: number; anchors: number[] }> = [
    {
      type: 'complementary',
      score: complementary.score,
      anchors: complementary.anchors,
    },
    { type: 'triadic', score: triadic.score, anchors: triadic.anchors },
    {
      type: 'split_complementary',
      score: split.score,
      anchors: split.anchors,
    },
    { type: 'tetradic', score: tetradic.score, anchors: tetradic.anchors },
  ];

  candidates.sort((left, right) => right.score - left.score);
  const best = candidates[0];

  if (!best || best.score < 0.67) {
    return { type: 'mixed', confidence: 'none', anchors: [circularMeanHue(hues)] };
  }

  return {
    type: best.type,
    confidence: confidenceFromCoverage(best.score),
    anchors: best.anchors,
  };
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
