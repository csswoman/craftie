import { describe, expect, it } from 'vitest';

import type { FontMeta, FontPair } from './fontPairTypes';
import {
  PAIRING_CATEGORY_FILTERS,
  filterFontPairs,
  shouldShowPairingSearch,
  suggestFontPairs,
} from './pairingFilters';

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

function createPair(
  overrides: Partial<FontPair> & Pick<FontPair, 'id' | 'displayName' | 'character'>,
): FontPair {
  return {
    mood: [],
    rationale: 'test',
    heading: createFontMeta({ family: `${overrides.id}-H`, bestFor: 'heading' }),
    body: createFontMeta({ family: `${overrides.id}-B`, bestFor: 'body' }),
    ...overrides,
  };
}

const fixtures: FontPair[] = [
  createPair({
    id: 'editorial-lora',
    displayName: 'Editorial clara',
    character: ['editorial', 'minimal'],
    heading: createFontMeta({ family: 'Lora', bestFor: 'heading' }),
    body: createFontMeta({ family: 'Inter', bestFor: 'body' }),
  }),
  createPair({
    id: 'tech-plex',
    displayName: 'Técnico humano',
    character: ['technical'],
    heading: createFontMeta({ family: 'IBM Plex Sans', bestFor: 'heading' }),
    body: createFontMeta({ family: 'IBM Plex Mono', bestFor: 'body' }),
  }),
  createPair({
    id: 'warm-fraunces',
    displayName: 'Cálido expresivo',
    character: ['warm'],
    heading: createFontMeta({ family: 'Fraunces', bestFor: 'heading' }),
    body: createFontMeta({ family: 'Manrope', bestFor: 'body' }),
  }),
];

describe('PAIRING_CATEGORY_FILTERS', () => {
  it('exposes all + four stable UI categories', () => {
    expect(PAIRING_CATEGORY_FILTERS.map((f) => f.value)).toEqual([
      'all',
      'editorial',
      'technical',
      'warm',
      'minimal',
    ]);
  });
});

describe('filterFontPairs', () => {
  it('returns all pairs when category is all and query is empty', () => {
    expect(filterFontPairs(fixtures, { category: 'all', query: '' })).toHaveLength(3);
  });

  it('filters by character category', () => {
    const result = filterFontPairs(fixtures, { category: 'editorial', query: '' });
    expect(result.map((p) => p.id)).toEqual(['editorial-lora']);
  });

  it('filters by displayName case-insensitively', () => {
    const result = filterFontPairs(fixtures, { category: 'all', query: 'técnico' });
    expect(result.map((p) => p.id)).toEqual(['tech-plex']);
  });

  it('filters by heading or body family substring', () => {
    expect(filterFontPairs(fixtures, { category: 'all', query: 'manrope' }).map((p) => p.id)).toEqual([
      'warm-fraunces',
    ]);
    expect(filterFontPairs(fixtures, { category: 'all', query: 'lora' }).map((p) => p.id)).toEqual([
      'editorial-lora',
    ]);
  });

  it('combines category and query with AND', () => {
    expect(
      filterFontPairs(fixtures, { category: 'minimal', query: 'inter' }).map((p) => p.id),
    ).toEqual(['editorial-lora']);
    expect(filterFontPairs(fixtures, { category: 'technical', query: 'lora' })).toEqual([]);
  });
});

describe('suggestFontPairs', () => {
  it('with empty query returns the four named categories (not all)', () => {
    const suggestions = suggestFontPairs(fixtures, '', 8);
    expect(suggestions.every((s) => s.type === 'category')).toBe(true);
    expect(suggestions.map((s) => s.value)).toEqual([
      'editorial',
      'technical',
      'warm',
      'minimal',
    ]);
  });

  it('returns category, family, and pair matches without duplicate values per type', () => {
    const suggestions = suggestFontPairs(fixtures, 'a', 10);
    const categories = suggestions.filter((s) => s.type === 'category');
    const families = suggestions.filter((s) => s.type === 'family');
    const pairs = suggestions.filter((s) => s.type === 'pair');

    expect(categories.some((s) => s.value === 'editorial')).toBe(true);
    expect(families.some((s) => s.value === 'Lora')).toBe(true);
    expect(pairs.some((s) => s.value === 'editorial-lora')).toBe(true);
  });

  it('respects limit', () => {
    expect(suggestFontPairs(fixtures, 'a', 2)).toHaveLength(2);
  });

  it('returns [] when query has no matches', () => {
    expect(suggestFontPairs(fixtures, 'zzzz-no-match', 8)).toEqual([]);
  });
});

describe('shouldShowPairingSearch', () => {
  it('hides search below 20 pairs', () => {
    expect(shouldShowPairingSearch(0)).toBe(false);
    expect(shouldShowPairingSearch(9)).toBe(false);
    expect(shouldShowPairingSearch(19)).toBe(false);
  });

  it('shows search from 20 pairs upward', () => {
    expect(shouldShowPairingSearch(20)).toBe(true);
    expect(shouldShowPairingSearch(92)).toBe(true);
  });
});
