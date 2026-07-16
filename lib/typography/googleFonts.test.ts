import { describe, expect, it } from 'vitest';

import type { FontPair } from './pairings';
import { buildGoogleFontsUrl, buildSingleFamilyGoogleFontsUrl, getGoogleFontsLinkId } from './googleFonts';

function createPair(overrides: Partial<FontPair> & Pick<FontPair, 'id'>): FontPair {
  return {
    heading: {
      family: 'Playfair Display',
      googleFontsRef: 'https://fonts.google.com/specimen/Playfair+Display',
      classification: 'serif',
      contrast: 'high',
      xHeight: 'medium',
      personality: ['editorial'],
      bestFor: 'heading',
    },
    body: {
      family: 'Open Sans',
      googleFontsRef: 'https://fonts.google.com/specimen/Open+Sans',
      classification: 'sans-serif',
      contrast: 'medium',
      xHeight: 'high',
      personality: ['legible'],
      bestFor: 'body',
    },
    displayName: overrides.id,
    rationale: 'Editorial pairing',
    mood: ['editorial'],
    character: ['editorial'],
    ...overrides,
  };
}

describe('googleFonts', () => {
  it('builds a CSS API v2 URL with display=swap', () => {
    const url = buildGoogleFontsUrl([createPair({ id: 'editorial' })]);

    expect(url).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/);
    expect(url).toContain('display=swap');
    expect(url).toContain('family=Playfair+Display:wght@500;600;700');
    expect(url).toContain('family=Open+Sans:wght@400;500');
  });

  it('does not duplicate families used in multiple pairs', () => {
    const pairs = [
      createPair({ id: 'one' }),
      createPair({
        id: 'two',
        heading: {
          family: 'Playfair Display',
          googleFontsRef: 'https://fonts.google.com/specimen/Playfair+Display',
          classification: 'serif',
          contrast: 'high',
          xHeight: 'medium',
          personality: ['editorial'],
          bestFor: 'heading',
        },
        body: {
          family: 'Open Sans',
          googleFontsRef: 'https://fonts.google.com/specimen/Open+Sans',
          classification: 'sans-serif',
          contrast: 'medium',
          xHeight: 'high',
          personality: ['legible'],
          bestFor: 'body',
        },
      }),
    ];

    const url = buildGoogleFontsUrl(pairs);
    const playfairMatches = url.match(/family=Playfair\+Display/g) ?? [];
    const openSansMatches = url.match(/family=Open\+Sans/g) ?? [];

    expect(playfairMatches).toHaveLength(1);
    expect(openSansMatches).toHaveLength(1);
  });

  it('merges weights when the same family appears as heading and body', () => {
    const url = buildGoogleFontsUrl([
      createPair({
        id: 'shared',
        heading: {
          family: 'Inter',
          googleFontsRef: 'https://fonts.google.com/specimen/Inter',
          classification: 'sans-serif',
          contrast: 'medium',
          xHeight: 'high',
          personality: ['neutral'],
          bestFor: 'heading',
        },
        body: {
          family: 'Inter',
          googleFontsRef: 'https://fonts.google.com/specimen/Inter',
          classification: 'sans-serif',
          contrast: 'medium',
          xHeight: 'high',
          personality: ['neutral'],
          bestFor: 'body',
        },
      }),
    ]);

    expect(url).toContain('family=Inter:wght@400;500;600;700');
  });

  it('encodes family names with spaces', () => {
    const url = buildGoogleFontsUrl([
      createPair({
        id: 'spaced',
        heading: {
          family: 'Source Sans 3',
          googleFontsRef: 'https://fonts.google.com/specimen/Source+Sans+3',
          classification: 'sans-serif',
          contrast: 'medium',
          xHeight: 'high',
          personality: ['neutral'],
          bestFor: 'heading',
        },
      }),
    ]);

    expect(url).toContain('family=Source+Sans+3:wght@');
  });

  it('includes per-pair default weights in the CSS URL', () => {
    const url = buildGoogleFontsUrl([
      createPair({
        id: 'lora-inter',
        heading: {
          family: 'Lora',
          googleFontsRef: 'https://fonts.google.com/specimen/Lora',
          classification: 'serif',
          contrast: 'medium',
          xHeight: 'medium',
          personality: ['editorial'],
          bestFor: 'heading',
          defaultWeight: 600,
        },
        body: {
          family: 'Inter',
          googleFontsRef: 'https://fonts.google.com/specimen/Inter',
          classification: 'sans-serif',
          contrast: 'medium',
          xHeight: 'high',
          personality: ['legible'],
          bestFor: 'body',
          defaultWeight: 400,
        },
      }),
    ]);

    expect(url).toContain('family=Lora:wght@');
    expect(url).toMatch(/family=Lora:wght@[0-9;]*600/);
    expect(url).toContain('family=Inter:wght@');
  });

  it('builds a single-family custom load URL', () => {
    const url = buildSingleFamilyGoogleFontsUrl('Space Grotesk');

    expect(url).toContain('family=Space+Grotesk:wght@400;500;600;700');
    expect(url).toContain('display=swap');
    expect(buildSingleFamilyGoogleFontsUrl('   ')).toBe('');
  });

  it('creates a stable link id from the generated URL', () => {
    const url = buildGoogleFontsUrl([createPair({ id: 'editorial' })]);

    expect(getGoogleFontsLinkId(url)).toBe(getGoogleFontsLinkId(url));
    expect(getGoogleFontsLinkId(url)).toMatch(/^google-fonts-[a-z0-9]+$/);
  });
});
