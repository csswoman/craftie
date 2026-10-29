export type GoogleFontCategory = 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting';

export type GoogleFontOption = {
  family: string;
  category: GoogleFontCategory;
};

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
 */
export function searchGoogleFonts(
  fonts: readonly GoogleFontOption[],
  query: string,
  limit = 8,
): GoogleFontOption[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('es');

  if (normalizedQuery === '') {
    return [];
  }

  return fonts
    .map((font) => ({ font, rank: rankFontMatch(font.family, normalizedQuery) }))
    .filter((entry): entry is { font: GoogleFontOption; rank: number } => entry.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.font.family.localeCompare(b.font.family, 'es'))
    .slice(0, limit)
    .map((entry) => entry.font);
}
