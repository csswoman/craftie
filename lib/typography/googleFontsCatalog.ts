export type GoogleFontCategory = 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting';

export type GoogleFontOption = {
  family: string;
  category: GoogleFontCategory;
};

/** Selectable filter value: either a concrete category or the catch-all 'all'. */
export type GoogleFontCategoryFilter = GoogleFontCategory | 'all';

export const GOOGLE_FONT_CATEGORY_FILTERS: readonly {
  value: GoogleFontCategoryFilter;
  label: string;
}[] = [
    { value: 'all', label: 'Todas' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans' },
    { value: 'display', label: 'Display' },
    { value: 'monospace', label: 'Mono' },
    { value: 'handwriting', label: 'Script' },
  ];

/**
 * Keeps only fonts in the given category. Returns the list unchanged when the
 * filter is 'all'. Pure and deterministic (preserves input order).
 */
export function filterGoogleFontsByCategory(
  fonts: readonly GoogleFontOption[],
  category: GoogleFontCategoryFilter,
): GoogleFontOption[] {
  if (category === 'all') {
    return [...fonts];
  }

  return fonts.filter((font) => font.category === category);
}

export function filterGoogleFontsByPrefix(
  fonts: readonly GoogleFontOption[],
  query: string,
  limit = 8,
): GoogleFontOption[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('es');

  if (normalizedQuery === '') {
    return [];
  }

  return fonts
    .filter((font) => font.family.toLocaleLowerCase('es').startsWith(normalizedQuery))
    .slice(0, limit);
}

// Lower rank value = stronger match. Keep ordering deterministic.
const RANK_EXACT_PREFIX = 0;
const RANK_WORD_BOUNDARY = 1;
const RANK_SUBSTRING = 2;

function rankFontMatch(family: string, normalizedQuery: string): number | null {
  const normalizedFamily = family.toLocaleLowerCase('es');

  if (normalizedFamily.startsWith(normalizedQuery)) {
    return RANK_EXACT_PREFIX;
  }

  const startsAWord = normalizedFamily
    .split(/\s+/)
    .some((word) => word.startsWith(normalizedQuery));
  if (startsAWord) {
    return RANK_WORD_BOUNDARY;
  }

  if (normalizedFamily.includes(normalizedQuery)) {
    return RANK_SUBSTRING;
  }

  return null;
}

/**
 * Deterministic ranked search over Google font families.
 *
 * Ranking tiers (strongest first): exact prefix match, then word-boundary
 * match (query begins a word within the family, e.g. "grotesk" -> "Space
 * Grotesk"), then plain substring match. Non-matches are excluded. Results are
 * sorted by rank and then by family name for stable ordering, then sliced to
 * `limit`.
 *
 * An optional `category` filter is applied before ranking; 'all' (the default)
 * keeps every category. Filtering stays pure and deterministic.
 */
export function searchGoogleFonts(
  fonts: readonly GoogleFontOption[],
  query: string,
  limit = 8,
  options: { category?: GoogleFontCategoryFilter } = {},
): GoogleFontOption[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('es');

  if (normalizedQuery === '') {
    return [];
  }

  const scoped = filterGoogleFontsByCategory(fonts, options.category ?? 'all');

  return scoped
    .map((font) => ({ font, rank: rankFontMatch(font.family, normalizedQuery) }))
    .filter((entry): entry is { font: GoogleFontOption; rank: number } => entry.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.font.family.localeCompare(b.font.family, 'es'))
    .slice(0, limit)
    .map((entry) => entry.font);
}
