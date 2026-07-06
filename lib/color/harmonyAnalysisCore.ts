import { converter } from 'culori';

import {
  ANALOGOUS_SPREAD,
  CHROMA_MIN,
  CHROMA_OUTLIER_THRESHOLD,
  HARMONY_CLUSTER_TOLERANCE,
  HUE_OUTLIER_THRESHOLD,
  LIGHTNESS_OUTLIER_THRESHOLD,
  MONOCHROMATIC_SPREAD,
} from './harmonyConstants';
import {
  circularMeanHue,
  hueDistance,
  isRobustOutlier,
} from './harmonyMath';
import type {
  HarmonyPattern,
  OklchColor,
  OutlierDimension,
  PaletteColorEntry,
  PaletteOklchStats,
  PaletteOutlier,
} from './harmonyTypes';
import { normalizeHex } from './normalizeHex';

const toOklch = converter('oklch');

export function isChromatic(color: OklchColor): boolean {
  return color.c >= CHROMA_MIN && color.h !== undefined;
}

export function toPaletteEntries(hexes: string[]): PaletteColorEntry[] {
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
