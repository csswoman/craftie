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
