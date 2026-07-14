import type { FontPair } from './fontPairTypes';

export const PAIRING_CATEGORY_FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Técnico', value: 'technical' },
  { label: 'Cálido', value: 'warm' },
  { label: 'Minimal', value: 'minimal' },
] as const;

export type PairingCategoryValue = (typeof PAIRING_CATEGORY_FILTERS)[number]['value'];

export type FilterFontPairsInput = {
  category: PairingCategoryValue;
  query: string;
};

/** Catalog must have at least this many pairs before search renders. */
export const SEARCH_MIN_PAIRS = 20;

export function shouldShowPairingSearch(pairCount: number): boolean {
  return pairCount >= SEARCH_MIN_PAIRS;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchesQuery(pair: FontPair, query: string): boolean {
  const q = normalize(query);
  if (!q) {
    return true;
  }

  return (
    normalize(pair.displayName).includes(q) ||
    normalize(pair.heading.family).includes(q) ||
    normalize(pair.body.family).includes(q)
  );
}

export function filterFontPairs(
  pairs: FontPair[],
  { category, query }: FilterFontPairsInput,
): FontPair[] {
  return pairs.filter((pair) => {
    const categoryOk = category === 'all' || pair.character.includes(category);
    return categoryOk && matchesQuery(pair, query);
  });
}

export type PairingSuggestionType = 'category' | 'family' | 'pair';

export type PairingSuggestion = {
  type: PairingSuggestionType;
  label: string;
  value: string;
};

export function suggestFontPairs(
  pairs: FontPair[],
  query: string,
  limit = 8,
): PairingSuggestion[] {
  const q = normalize(query);
  const out: PairingSuggestion[] = [];
  const seen = new Set<string>();

  const push = (suggestion: PairingSuggestion) => {
    const key = `${suggestion.type}:${suggestion.value}`;
    if (seen.has(key) || out.length >= limit) {
      return;
    }
    seen.add(key);
    out.push(suggestion);
  };

  const namedCategories = PAIRING_CATEGORY_FILTERS.filter((f) => f.value !== 'all');

  if (!q) {
    for (const filter of namedCategories) {
      push({ type: 'category', label: filter.label, value: filter.value });
    }
    return out;
  }

  for (const filter of namedCategories) {
    if (
      normalize(filter.label).includes(q) ||
      normalize(filter.value).includes(q)
    ) {
      push({ type: 'category', label: filter.label, value: filter.value });
    }
  }

  for (const pair of pairs) {
    for (const family of [pair.heading.family, pair.body.family]) {
      if (normalize(family).includes(q)) {
        push({ type: 'family', label: family, value: family });
      }
    }
  }

  for (const pair of pairs) {
    if (normalize(pair.displayName).includes(q) || normalize(pair.id).includes(q)) {
      push({
        type: 'pair',
        label: pair.displayName,
        value: pair.id,
      });
    }
  }

  return out;
}
