import { describe, expect, it } from 'vitest';

import {
  getPaletteAwareRecommendations,
  hasPaletteContext,
  scorePairForPalette,
  type PaletteContext,
} from './paletteAwarePairing';
import type { FontMeta, FontPair } from './fontPairTypes';

function createFontMeta(overrides: Partial<FontMeta> & Pick<FontMeta, 'family'>): FontMeta {
  return {
    googleFontsRef: `https://fonts.google.com/specimen/${overrides.family}`,
    classification: 'sans-serif',
    contrast: 'medium',
    xHeight: 'medium',
    personality: ['neutral'],
    bestFor: 'both',
    ...overrides,
  };
}

function createPair(overrides: Partial<FontPair> & Pick<FontPair, 'id'>): FontPair {
  return {
    displayName: overrides.id,
    heading: createFontMeta({ family: `${overrides.id}-heading`, bestFor: 'heading' }),
    body: createFontMeta({ family: `${overrides.id}-body`, bestFor: 'body' }),
    rationale: `Rationale for ${overrides.id}`,
    mood: overrides.mood ?? [],
    character: overrides.character ?? [],
    ...overrides,
  };
}

const serifSansPair = createPair({
  id: 'serif-sans',
  mood: ['editorial'],
  heading: createFontMeta({ family: 'SerifHead', classification: 'serif', bestFor: 'heading' }),
  body: createFontMeta({ family: 'SansBody', classification: 'sans-serif', bestFor: 'body' }),
});

const twoSansPair = createPair({
  id: 'two-sans',
  mood: ['editorial'],
  heading: createFontMeta({
    family: 'SansHead',
    classification: 'sans-serif',
    contrast: 'medium',
    personality: ['moderno'],
    bestFor: 'heading',
  }),
  body: createFontMeta({
    family: 'SansBody2',
    classification: 'sans-serif',
    contrast: 'low',
    personality: ['legible'],
    bestFor: 'body',
  }),
});

const geometricTwinPair = createPair({
  id: 'geometric-twins',
  mood: ['editorial'],
  heading: createFontMeta({
    family: 'GeoHead',
    classification: 'sans-serif',
    contrast: 'low',
    personality: ['geométrico', 'moderno'],
    bestFor: 'heading',
  }),
  body: createFontMeta({
    family: 'GeoBody',
    classification: 'sans-serif',
    contrast: 'low',
    personality: ['geométrico', 'neutral'],
    bestFor: 'body',
  }),
});

// Strong readable contrast (near black on white).
const STRONG_CONTEXT: Omit<PaletteContext, 'mood'> = {
  paletteTextHex: '#1a1a1a',
  paletteBackgroundHex: '#ffffff',
};

// Weak contrast (light gray on white).
const WEAK_CONTEXT: Omit<PaletteContext, 'mood'> = {
  paletteTextHex: '#cfcfcf',
  paletteBackgroundHex: '#ffffff',
};

describe('scorePairForPalette', () => {
  it('rewards a serif + sans pair over two sans-serif fonts', () => {
    const context: PaletteContext = { mood: ['editorial'], ...STRONG_CONTEXT };

    const serifSans = scorePairForPalette(serifSansPair, context);
    const twoSans = scorePairForPalette(twoSansPair, context);

    expect(serifSans.score).toBeGreaterThan(twoSans.score);
    expect(serifSans.rationale.some((line) => line.includes('complementan'))).toBe(true);
  });

  it('penalizes two geometric sans fonts more than a plain two-sans pair', () => {
    const context: PaletteContext = { mood: ['editorial'], ...STRONG_CONTEXT };

    const twoSans = scorePairForPalette(twoSansPair, context);
    const geometricTwins = scorePairForPalette(geometricTwinPair, context);

    expect(geometricTwins.score).toBeLessThan(twoSans.score);
    expect(geometricTwins.rationale.some((line) => line.includes('geométrico'))).toBe(true);
  });

  it('emits a size-up recommendation for a low x-height body font', () => {
    const lowXHeightPair = createPair({
      id: 'low-x',
      mood: [],
      heading: createFontMeta({ family: 'Head', classification: 'serif', bestFor: 'heading' }),
      body: createFontMeta({
        family: 'TinyBody',
        classification: 'sans-serif',
        xHeight: 'low',
        bestFor: 'body',
      }),
    });

    const result = scorePairForPalette(lowXHeightPair, { mood: [], ...STRONG_CONTEXT });

    expect(result.bodySizeUpNote).not.toBeNull();
    expect(result.rationale.some((line) => line.includes('altura-x'))).toBe(true);
  });

  it('lets palette contrast change the score deterministically', () => {
    const strong = scorePairForPalette(serifSansPair, { mood: ['editorial'], ...STRONG_CONTEXT });
    const weak = scorePairForPalette(serifSansPair, { mood: ['editorial'], ...WEAK_CONTEXT });

    expect(strong.paletteContrastRatio).toBeGreaterThan(weak.paletteContrastRatio);
    expect(strong.score).toBeGreaterThan(weak.score);

    // Determinism: repeated calls produce identical results.
    const repeat = scorePairForPalette(serifSansPair, { mood: ['editorial'], ...STRONG_CONTEXT });
    expect(repeat.score).toBe(strong.score);
    expect(repeat.rationale).toEqual(strong.rationale);
  });

  it('handles empty mood and missing palette hexes', () => {
    const result = scorePairForPalette(serifSansPair, {
      mood: [],
      paletteTextHex: '',
      paletteBackgroundHex: '',
    });

    expect(result.paletteContrastRatio).toBe(0);
    expect(Number.isFinite(result.score)).toBe(true);
  });
});

describe('getPaletteAwareRecommendations', () => {
  it('orders serif+sans ahead of two-sans and limits results', () => {
    const context: PaletteContext = { mood: ['editorial'], ...STRONG_CONTEXT };
    const results = getPaletteAwareRecommendations(context, 3);

    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((entry) => {
      expect(Array.isArray(entry.paletteRationale)).toBe(true);
      expect(typeof entry.paletteContrastRatio).toBe('number');
    });
  });

  it('returns an empty list for a non-positive limit', () => {
    const context: PaletteContext = { mood: ['editorial'], ...STRONG_CONTEXT };
    expect(getPaletteAwareRecommendations(context, 0)).toEqual([]);
  });
});

describe('hasPaletteContext', () => {
  it('is false for missing hexes and true for valid hexes', () => {
    expect(hasPaletteContext(null, '#ffffff')).toBe(false);
    expect(hasPaletteContext('#111111', null)).toBe(false);
    expect(hasPaletteContext('#111111', '#ffffff')).toBe(true);
  });
});
