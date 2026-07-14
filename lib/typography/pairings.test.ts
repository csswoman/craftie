import { describe, expect, it } from 'vitest';

import {
  FONT_PAIRS,
  getPairingsForStyle,
  getRecommendedPairings,
  scorePairForMood,
  type FontMeta,
  type FontPair,
} from './pairings';

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

function createPair(overrides: Partial<FontPair> & Pick<FontPair, 'id' | 'mood'>): FontPair {
  return {
    displayName: overrides.id,
    heading: createFontMeta({ family: `${overrides.id}-heading`, bestFor: 'heading' }),
    body: createFontMeta({ family: `${overrides.id}-body`, bestFor: 'body' }),
    rationale: `Rationale for ${overrides.id}`,
    character: overrides.mood,
    ...overrides,
  };
}

const mockPairs: FontPair[] = [
  createPair({
    id: 'quiet-editorial',
    mood: ['sereno', 'editorial'],
    heading: createFontMeta({
      family: 'Playfair Display',
      classification: 'serif',
      contrast: 'high',
      personality: ['elegante', 'clásico', 'editorial'],
      bestFor: 'heading',
    }),
    body: createFontMeta({
      family: 'Open Sans',
      classification: 'sans-serif',
      contrast: 'medium',
      personality: ['legible', 'neutral'],
      bestFor: 'body',
    }),
  }),
  createPair({
    id: 'warm-signal',
    mood: ['cálido', 'enérgico'],
    heading: createFontMeta({
      family: 'Oswald',
      classification: 'sans-serif',
      contrast: 'high',
      personality: ['contundente', 'activo', 'directo'],
      bestFor: 'heading',
    }),
    body: createFontMeta({
      family: 'Source Sans 3',
      classification: 'sans-serif',
      contrast: 'high',
      personality: ['claro', 'funcional'],
      bestFor: 'body',
    }),
  }),
  createPair({
    id: 'technical-clarity',
    mood: ['técnico', 'sereno'],
    heading: createFontMeta({
      family: 'IBM Plex Sans',
      classification: 'sans-serif',
      contrast: 'medium',
      personality: ['preciso', 'sobrio'],
      bestFor: 'heading',
    }),
    body: createFontMeta({
      family: 'IBM Plex Mono',
      classification: 'monospace',
      contrast: 'medium',
      personality: ['técnico', 'denso'],
      bestFor: 'body',
    }),
  }),
  createPair({
    id: 'display-contrast',
    mood: ['expresivo', 'editorial'],
    heading: createFontMeta({
      family: 'Fraunces',
      classification: 'display',
      contrast: 'high',
      personality: ['expresivo', 'carácter', 'distintivo'],
      bestFor: 'heading',
    }),
    body: createFontMeta({
      family: 'Work Sans',
      classification: 'sans-serif',
      contrast: 'medium',
      personality: ['limpio', 'versátil', 'estable'],
      bestFor: 'body',
    }),
  }),
];

function withMockPairs(run: (pairs: FontPair[]) => void): void {
  const original = [...FONT_PAIRS];
  FONT_PAIRS.length = 0;
  FONT_PAIRS.push(...mockPairs);

  try {
    run(mockPairs);
  } finally {
    FONT_PAIRS.length = 0;
    FONT_PAIRS.push(...original);
  }
}

describe('pairings', () => {
  it('exports a curated Google Fonts library with character hooks', () => {
    expect(FONT_PAIRS.length).toBeGreaterThanOrEqual(70);
    expect(FONT_PAIRS.every((pair) => pair.displayName && pair.character.length > 0)).toBe(true);
    expect(
      FONT_PAIRS.every((pair) => pair.heading.googleFontsRef && pair.body.googleFontsRef),
    ).toBe(true);
    expect(
      FONT_PAIRS.every((pair) =>
        pair.heading.googleFontsRef.startsWith('https://fonts.google.com/specimen/') &&
        pair.body.googleFontsRef.startsWith('https://fonts.google.com/specimen/'),
      ),
    ).toBe(true);

    const familyKeys = FONT_PAIRS.map((pair) =>
      [pair.heading.family, pair.body.family].sort().join('::'),
    );
    expect(new Set(familyKeys).size).toBe(familyKeys.length);

    const ids = FONT_PAIRS.map((pair) => pair.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('getPairingsForStyle', () => {
    it('returns all pairs when mood input is empty', () => {
      withMockPairs((pairs) => {
        expect(getPairingsForStyle([])).toEqual(pairs);
      });
    });

    it('filters pairs that share at least one mood tag', () => {
      withMockPairs(() => {
        const results = getPairingsForStyle(['editorial']);

        expect(results.map((pair) => pair.id)).toEqual(['quiet-editorial', 'display-contrast']);
      });
    });

    it('preserves source order from FONT_PAIRS', () => {
      withMockPairs(() => {
        const results = getPairingsForStyle(['sereno']);

        expect(results.map((pair) => pair.id)).toEqual(['quiet-editorial', 'technical-clarity']);
      });
    });

    it('returns no pairs when there is no mood overlap', () => {
      withMockPairs(() => {
        expect(getPairingsForStyle(['industrial'])).toEqual([]);
      });
    });
  });

  describe('scorePairForMood', () => {
    it('adds one point per matching mood tag', () => {
      const pair = mockPairs[0]!;

      expect(scorePairForMood(pair, ['sereno'])).toBe(1);
      expect(scorePairForMood(pair, ['sereno', 'editorial'])).toBe(2);
      expect(scorePairForMood(pair, ['cálido'])).toBe(0);
    });

    it('subtracts one point when heading and body both have high contrast', () => {
      const pair = mockPairs[1]!;

      expect(scorePairForMood(pair, ['cálido'])).toBe(0);
    });

    it('subtracts one point when both fonts carry many personality tags', () => {
      const pair = mockPairs[3]!;

      expect(scorePairForMood(pair, ['expresivo'])).toBe(0);
    });

    it('applies mood overlap and penalties deterministically', () => {
      const pair = mockPairs[3]!;

      expect(scorePairForMood(pair, ['expresivo', 'editorial'])).toBe(1);
    });

    it('returns a negative score when penalties outweigh mood overlap', () => {
      const pair = createPair({
        id: 'heavy-pair',
        mood: ['enérgico'],
        heading: createFontMeta({
          family: 'Heavy Heading',
          contrast: 'high',
          personality: ['uno', 'dos', 'tres'],
          bestFor: 'heading',
        }),
        body: createFontMeta({
          family: 'Heavy Body',
          contrast: 'high',
          personality: ['cuatro', 'cinco', 'seis'],
          bestFor: 'body',
        }),
      });

      expect(scorePairForMood(pair, ['enérgico'])).toBe(-1);
    });
  });

  describe('getRecommendedPairings', () => {
    it('returns up to three highest-scoring pairs for a mood list', () => {
      withMockPairs(() => {
        const results = getRecommendedPairings(['editorial'], 3);

        expect(results.map((pair) => pair.id)).toEqual(['quiet-editorial', 'display-contrast']);
      });
    });
  });
});
