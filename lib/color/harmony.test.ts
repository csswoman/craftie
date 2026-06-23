import { describe, expect, it } from 'vitest';

import {
  analyzeHarmony,
  detectHarmonyPattern,
  detectOutliers,
  getPaletteStats,
  HUE_OUTLIER_THRESHOLD,
  suggestHarmonyAdjustments,
} from './harmony';
import { normalizeHex } from './normalizeHex';

const MONOCHROMATIC_GREENS = ['#1A3D2E', '#2F5644', '#4A7D66', '#6B9E7A', '#C4D9C8'];
const ANALOGOUS_GREENS = ['#53932D', '#469539', '#369744', '#20984F', '#009958'];
const COMPLEMENTARY_PAIR = ['#1E4D8C', '#C47A1A'];
const TRIADIC = ['#D7263D', '#2AA876', '#2B4FD6'];

describe('getPaletteStats', () => {
  it('computes central OKLCH values for a green palette', () => {
    const analysis = analyzeHarmony(MONOCHROMATIC_GREENS);
    const { stats } = analysis;

    expect(stats.chromaticCount).toBeGreaterThan(0);
    expect(stats.meanHue).not.toBeNull();
    expect(stats.meanLightness).toBeGreaterThan(0);
    expect(stats.meanChroma).toBeGreaterThan(0);
  });
});

describe('detectOutliers', () => {
  it('flags a hue that deviates from the group mean', () => {
    const palette = [...MONOCHROMATIC_GREENS, '#FF4D00'];
    const analysis = analyzeHarmony(palette);

    expect(analysis.outliers.some((outlier) => outlier.hex === '#FF4D00')).toBe(true);
    expect(
      analysis.outliers.find((outlier) => outlier.hex === '#FF4D00')?.dimensions,
    ).toContain('hue');
  });

  it('does not flag cohesive monochromatic palettes', () => {
    const analysis = analyzeHarmony(MONOCHROMATIC_GREENS);

    expect(analysis.outliers).toHaveLength(0);
  });
});

describe('detectHarmonyPattern', () => {
  it('detects monochromatic palettes', () => {
    const analysis = analyzeHarmony(MONOCHROMATIC_GREENS);

    expect(analysis.pattern.type).toBe('monochromatic');
    expect(analysis.pattern.confidence).toBe('strong');
  });

  it('detects analogous palettes', () => {
    const analysis = analyzeHarmony(ANALOGOUS_GREENS);

    expect(analysis.pattern.type).toBe('analogous');
  });

  it('detects complementary palettes', () => {
    const analysis = analyzeHarmony(COMPLEMENTARY_PAIR);

    expect(analysis.pattern.type).toBe('complementary');
    expect(analysis.pattern.anchors).toHaveLength(2);
  });

  it('detects triadic palettes', () => {
    const analysis = analyzeHarmony(TRIADIC);

    expect(analysis.pattern.type).toBe('triadic');
    expect(analysis.pattern.anchors).toHaveLength(3);
  });

  it('reports mixed harmony when a pattern is broken by an outlier hue', () => {
    const broken = [...ANALOGOUS_GREENS, '#FF4D00'];
    const analysis = analyzeHarmony(broken);

    expect(analysis.outliers.length).toBeGreaterThan(0);
    expect(analysis.pattern.type).toBe('analogous');
  });
});

describe('suggestHarmonyAdjustments', () => {
  it('keeps lightness and chroma while shifting hue toward the group', () => {
    const palette = [...MONOCHROMATIC_GREENS, '#FF4D00'];
    const analysis = analyzeHarmony(palette);
    const suggestion = analysis.suggestions.find((item) => item.originalHex === '#FF4D00');

    expect(suggestion).toBeDefined();
    expect(suggestion?.suggestedHex).not.toBe('#FF4D00');
    expect(suggestion?.reason).toMatch(/matiz/i);

    const original = analysis.colors.find((color) => color.hex === '#FF4D00')!;
    const suggested = analysis.colors.find((color) => color.hex === suggestion!.suggestedHex);

    if (!suggested) {
      const suggestedEntry = analyzeHarmony([suggestion!.suggestedHex]).colors[0]!;
      expect(suggestedEntry.oklch.l).toBeCloseTo(original.oklch.l, 1);
      expect(suggestedEntry.oklch.c).toBeCloseTo(original.oklch.c, 1);
      expect(suggestedEntry.oklch.h).not.toBeUndefined();
      if (original.oklch.h !== undefined && suggestedEntry.oklch.h !== undefined) {
        expect(
          Math.abs(suggestedEntry.oklch.h - original.oklch.h) > HUE_OUTLIER_THRESHOLD / 2,
        ).toBe(true);
      }
    }
  });

  it('returns no suggestions when there are no outliers', () => {
    const analysis = analyzeHarmony(MONOCHROMATIC_GREENS);

    expect(analysis.suggestions).toHaveLength(0);
  });
});

describe('analyzeHarmony', () => {
  it('normalizes input hex values', () => {
    const analysis = analyzeHarmony(['#2f5644', '#6b9e7a']);

    expect(analysis.colors.map((color) => color.hex)).toEqual(['#2F5644', '#6B9E7A']);
  });

  it('throws for empty palettes', () => {
    expect(() => analyzeHarmony([])).toThrow(/at least one color/i);
  });

  it('throws for invalid colors', () => {
    expect(() => analyzeHarmony(['#ZZZZZZ'])).toThrow();
  });

  it('exposes stats, pattern, outliers, and suggestions together', () => {
    const palette = [...MONOCHROMATIC_GREENS, '#FF4D00'];
    const colors = palette.map((hex) => normalizeHex(hex));
    const entries = analyzeHarmony(colors).colors;
    const stats = getPaletteStats(entries);
    const patternOnAll = detectHarmonyPattern(entries);
    const outliers = detectOutliers(entries, stats, patternOnAll);
    const outlierHexes = new Set(outliers.map((outlier) => outlier.hex));
    const inlierColors = entries.filter((color) => !outlierHexes.has(color.hex));
    const pattern =
      inlierColors.length > 0 && inlierColors.length < entries.length
        ? detectHarmonyPattern(inlierColors)
        : patternOnAll;
    const suggestions = suggestHarmonyAdjustments(entries, outliers, pattern);
    const bundled = analyzeHarmony(palette);

    expect(bundled.stats.meanLightness).toBeCloseTo(stats.meanLightness, 5);
    expect(bundled.pattern.type).toBe(pattern.type);
    expect(bundled.outliers).toEqual(outliers);
    expect(bundled.suggestions).toEqual(suggestions);
  });
});
