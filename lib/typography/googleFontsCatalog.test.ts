import { describe, expect, it } from 'vitest';

import {
  filterGoogleFontsByPrefix,
  searchGoogleFonts,
  type GoogleFontOption,
} from './googleFontsCatalog';

const fonts: GoogleFontOption[] = [
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Open Sans Condensed', category: 'sans-serif' },
  { family: 'Source Sans 3', category: 'sans-serif' },
];

describe('filterGoogleFontsByPrefix', () => {
  it('matches family names from their beginning only', () => {
    expect(filterGoogleFontsByPrefix(fonts, 'Open').map((font) => font.family)).toEqual([
      'Open Sans',
      'Open Sans Condensed',
    ]);
    expect(filterGoogleFontsByPrefix(fonts, 'Sans')).toEqual([]);
  });

  it('limits suggestions and ignores surrounding whitespace', () => {
    expect(filterGoogleFontsByPrefix(fonts, ' Open ', 1)).toEqual([fonts[0]]);
  });
});

describe('searchGoogleFonts', () => {
  const groteskFonts: GoogleFontOption[] = [
    { family: 'Space Grotesk', category: 'sans-serif' },
    { family: 'Grotesk Remix', category: 'display' },
    { family: 'Darker Grotesque', category: 'sans-serif' },
    { family: 'Open Sans', category: 'sans-serif' },
  ];

  it('finds word-boundary matches so "grotesk" returns "Space Grotesk"', () => {
    const families = searchGoogleFonts(groteskFonts, 'grotesk').map((font) => font.family);
    expect(families).toContain('Space Grotesk');
    expect(families).not.toContain('Open Sans');
  });

  it('ranks exact-prefix matches above substring matches', () => {
    const results = searchGoogleFonts(
      [
        { family: 'Space Grotesk', category: 'sans-serif' },
        { family: 'Spacely', category: 'display' },
      ],
      'space',
    );
    // Both are exact-prefix matches, so the deterministic name tie-break
    // orders "Space Grotesk" before "Spacely".
    expect(results.map((font) => font.family)).toEqual(['Space Grotesk', 'Spacely']);
  });

  it('ranks an exact prefix above a pure substring match', () => {
    const results = searchGoogleFonts(
      [
        // "Sans" begins a later word -> word-boundary (rank 1).
        { family: 'Comic Neue Sans', category: 'display' },
        // "sans" appears mid-word -> pure substring (rank 2).
        { family: 'Unsans', category: 'sans-serif' },
        // "Sans" is the leading prefix (rank 0).
        { family: 'Sans Forgetica', category: 'display' },
      ],
      'sans',
    );
    // Ordering must follow rank: prefix, then word-boundary, then substring.
    expect(results.map((font) => font.family)).toEqual([
      'Sans Forgetica',
      'Comic Neue Sans',
      'Unsans',
    ]);
  });

  it('orders ties deterministically by family name', () => {
    const results = searchGoogleFonts(
      [
        { family: 'Grotesk Zulu', category: 'display' },
        { family: 'Grotesk Alfa', category: 'display' },
      ],
      'grotesk',
    );
    expect(results.map((font) => font.family)).toEqual(['Grotesk Alfa', 'Grotesk Zulu']);
  });

  it('returns an empty list for blank queries and respects the limit', () => {
    expect(searchGoogleFonts(groteskFonts, '   ')).toEqual([]);
    expect(searchGoogleFonts(groteskFonts, 'grotesk', 1)).toHaveLength(1);
  });
});
