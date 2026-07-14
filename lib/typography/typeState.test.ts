import { describe, expect, it } from 'vitest';

import type { FontMeta, FontPair } from './fontPairTypes';
import {
  applyPairToTypography,
  previewPairTypography,
  resolveEffectiveTypography,
  typographyFromPair,
} from './typeState';

function createFontMeta(
  overrides: Partial<FontMeta> & Pick<FontMeta, 'family' | 'bestFor'>,
): FontMeta {
  return {
    googleFontsRef: `https://fonts.google.com/specimen/${overrides.family}`,
    classification: 'sans-serif',
    contrast: 'medium',
    xHeight: 'medium',
    personality: ['neutral'],
    ...overrides,
  };
}

function createPair(
  overrides: Partial<FontPair> & Pick<FontPair, 'id'>,
): FontPair {
  return {
    displayName: overrides.id,
    heading: createFontMeta({ family: `${overrides.id}-H`, bestFor: 'heading', defaultWeight: 700 }),
    body: createFontMeta({ family: `${overrides.id}-B`, bestFor: 'body', defaultWeight: 400 }),
    rationale: 'test',
    mood: [],
    character: ['minimal'],
    ...overrides,
  };
}

const editorial = createPair({
  id: 'editorial',
  heading: createFontMeta({
    family: 'Lora',
    bestFor: 'heading',
    classification: 'serif',
    defaultWeight: 600,
  }),
  body: createFontMeta({ family: 'Inter', bestFor: 'body', defaultWeight: 400 }),
});

const technical = createPair({
  id: 'technical',
  heading: createFontMeta({ family: 'Space Grotesk', bestFor: 'heading', defaultWeight: 700 }),
  body: createFontMeta({ family: 'Work Sans', bestFor: 'body', defaultWeight: 400 }),
});

describe('resolveEffectiveTypography', () => {
  it('prefers hovered when non-null', () => {
    const applied = typographyFromPair(editorial);
    const hovered = typographyFromPair(technical);
    expect(resolveEffectiveTypography({ applied, hovered }).headingFamily).toBe('Space Grotesk');
  });

  it('falls back to applied when hovered is null', () => {
    const applied = typographyFromPair(editorial);
    expect(resolveEffectiveTypography({ applied, hovered: null }).headingFamily).toBe('Lora');
  });
});

describe('applyPairToTypography', () => {
  it('applies full pair when no pins', () => {
    const applied = typographyFromPair(editorial);
    const next = applyPairToTypography(applied, technical, {
      pinHeading: false,
      pinBody: false,
    });
    expect(next.headingFamily).toBe('Space Grotesk');
    expect(next.bodyFamily).toBe('Work Sans');
    expect(next.catalogPairId).toBe('technical');
  });

  it('updates only body when heading is pinned', () => {
    const applied = typographyFromPair(editorial);
    const next = applyPairToTypography(applied, technical, {
      pinHeading: true,
      pinBody: false,
    });
    expect(next.headingFamily).toBe('Lora');
    expect(next.bodyFamily).toBe('Work Sans');
    expect(next.catalogPairId).toBeNull();
  });

  it('updates only heading when body is pinned', () => {
    const applied = typographyFromPair(editorial);
    const next = applyPairToTypography(applied, technical, {
      pinHeading: false,
      pinBody: true,
    });
    expect(next.headingFamily).toBe('Space Grotesk');
    expect(next.bodyFamily).toBe('Inter');
    expect(next.catalogPairId).toBeNull();
  });

  it('returns applied unchanged when both pins are active', () => {
    const applied = typographyFromPair(editorial);
    const next = applyPairToTypography(applied, technical, {
      pinHeading: true,
      pinBody: true,
    });
    expect(next).toEqual(applied);
  });
});

describe('previewPairTypography', () => {
  it('returns null when both pins are active', () => {
    const applied = typographyFromPair(editorial);
    expect(
      previewPairTypography(applied, technical, { pinHeading: true, pinBody: true }),
    ).toBeNull();
  });
});
