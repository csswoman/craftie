import { formatHex } from 'culori';

import {
  ANALOGOUS_SPREAD,
  HARMONY_CLUSTER_TOLERANCE,
  MONOCHROMATIC_SPREAD,
} from './harmonyConstants';
import {
  detectOutliers,
  getPaletteStats,
  isChromatic,
  toPaletteEntries,
} from './harmonyAnalysisCore';
import type {
  HarmonyAnalysis,
  HarmonyConfidence,
  HarmonyPattern,
  HarmonySuggestion,
  HarmonyType,
  OklchColor,
  PaletteColorEntry,
  PaletteOutlier,
} from './harmonyTypes';
import {
  circularMeanHue,
  hueDistance,
  maxHueSpread,
} from './harmonyMath';

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

function assertNonEmptyPalette(hexes: string[]): void {
  if (!Array.isArray(hexes) || hexes.length === 0) {
    throw new Error('Palette must contain at least one color');
  }
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

function nearestHue(hue: number, candidates: number[]): number {
  return candidates.reduce((best, candidate) =>
    hueDistance(hue, candidate) < hueDistance(hue, best) ? candidate : best,
  );
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
