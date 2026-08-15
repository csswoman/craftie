import { describe, expect, it } from 'vitest';

import { filterGoogleFontsByPrefix, type GoogleFontOption } from './googleFontsCatalog';

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
