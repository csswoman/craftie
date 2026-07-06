import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio, evaluateContrast } from './contrast';
import { CHROMA_MIN } from './harmony';
import {
  generateAccent,
  generateNeutrals,
  generatePalette,
  generatePaletteFromSelection,
  type GeneratedPalette,
  type NeutralScale,
} from './formulas';
import { createDefaultSelection } from './selectableColors';

const toOklch = converter('oklch');

const GREEN_SEED = '#2F5644';
const BLUE_SEED = '#1E4D8C';
const ORANGE_ACCENT = '#C47A1A';
const LIGHT_SURFACE = '#F2F5F0';
const DARK_TEXT = '#1A2E24';

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function getOklch(hex: string) {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    throw new Error(`Unable to convert ${hex} to OKLCH`);
  }

  return {
    l: color.l ?? 0,
    c: color.c ?? 0,
    h: color.h,
  };
}

function expectReducedChroma(neutrals: NeutralScale, seedHex: string): void {
  const seed = getOklch(seedHex);

  for (const hex of Object.values(neutrals)) {
    const neutral = getOklch(hex);
    expect(neutral.c).toBeLessThan(seed.c);
    expect(neutral.c).toBeLessThanOrEqual(0.06);
  }
}

function expectHueConsistency(neutrals: NeutralScale, seedHex: string): void {
  const seed = getOklch(seedHex);

  if (seed.c < CHROMA_MIN || seed.h === undefined) {
    return;
  }

  for (const hex of Object.values(neutrals)) {
    const neutral = getOklch(hex);

    if (neutral.h !== undefined) {
      expect(hueDistance(seed.h, neutral.h)).toBeLessThanOrEqual(5);
    }
  }
}

function expectUniqueRoles(palette: GeneratedPalette): void {
  const roles = Object.values(palette);
  expect(new Set(roles).size).toBe(roles.length);
}

describe('generateNeutrals', () => {
  it('returns a 5-step neutral scale', () => {
    const neutrals = generateNeutrals(GREEN_SEED);

    expect(Object.keys(neutrals)).toEqual([
      'veryLight',
      'light',
      'medium',
      'dark',
      'veryDark',
    ]);
  });

  it('orders steps from lightest to darkest', () => {
    const neutrals = generateNeutrals(GREEN_SEED);
    const lightnesses = Object.values(neutrals).map((hex) => getOklch(hex).l);

    expect(lightnesses[0]).toBeGreaterThan(lightnesses[1]!);
    expect(lightnesses[1]).toBeGreaterThan(lightnesses[2]!);
    expect(lightnesses[2]).toBeGreaterThan(lightnesses[3]!);
    expect(lightnesses[3]).toBeGreaterThan(lightnesses[4]!);
  });

  it('reduces chroma while preserving seed hue', () => {
    const neutrals = generateNeutrals(GREEN_SEED);

    expectReducedChroma(neutrals, GREEN_SEED);
    expectHueConsistency(neutrals, GREEN_SEED);
  });

  it('produces usable background steps', () => {
    const neutrals = generateNeutrals(BLUE_SEED);

    expect(getOklch(neutrals.veryLight).l).toBeGreaterThan(0.9);
    expect(getOklch(neutrals.veryDark).l).toBeLessThan(0.3);
  });

  it('throws for invalid seeds', () => {
    expect(() => generateNeutrals('')).toThrow(/non-empty/i);
    expect(() => generateNeutrals('#ZZZZZZ')).toThrow();
  });
});

describe('generateAccent', () => {
  it('returns a color distinct from the seed', () => {
    const accent = generateAccent(GREEN_SEED);
    const seed = getOklch(GREEN_SEED);
    const accentOklch = getOklch(accent);

    expect(accent).not.toBe(GREEN_SEED);
    expect(accentOklch.h).toBeDefined();
    expect(hueDistance(seed.h ?? 0, accentOklch.h ?? 0)).toBeGreaterThanOrEqual(30);
  });

  it('favors strong contrast against dark neutrals', () => {
    const accent = generateAccent(BLUE_SEED);
    const darkNeutral = generateNeutrals(BLUE_SEED).veryDark;

    expect(contrastRatio(accent, darkNeutral)).toBeGreaterThan(3);
  });

  it('throws for invalid seeds', () => {
    expect(() => generateAccent('not-a-color')).toThrow();
  });
});

describe('generatePalette', () => {
  it('generates all required roles from a single seed', () => {
    const palette = generatePalette([GREEN_SEED]);

    expect(palette).toEqual({
      primary: GREEN_SEED,
      accent: expect.any(String),
      surface: expect.any(String),
      onSurface: expect.any(String),
      neutralLight: expect.any(String),
      neutralDark: expect.any(String),
    });
    expectUniqueRoles(palette);
  });

  it('passes WCAG AA for surface and on-surface', () => {
    const palette = generatePalette([BLUE_SEED]);
    const evaluation = evaluateContrast(palette.onSurface, palette.surface);

    expect(evaluation.normalText).not.toBe('fail');
    expect(evaluation.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps accent visually distinct from primary', () => {
    const palette = generatePalette([GREEN_SEED]);
    const primary = getOklch(palette.primary);
    const accent = getOklch(palette.accent);

    expect(hueDistance(primary.h ?? 0, accent.h ?? 0)).toBeGreaterThanOrEqual(30);
  });

  it('prefers user-provided colors for matching roles', () => {
    const palette = generatePalette([GREEN_SEED, ORANGE_ACCENT]);

    expect(palette.primary).toBe(GREEN_SEED);
    expect(palette.accent).toBe(ORANGE_ACCENT);
  });

  it('avoids duplicate roles when multiple seeds are provided', () => {
    const palette = generatePalette([
      GREEN_SEED,
      ORANGE_ACCENT,
      LIGHT_SURFACE,
      DARK_TEXT,
    ]);

    expectUniqueRoles(palette);
    expect(palette.surface).toBe(LIGHT_SURFACE);
    expect(palette.onSurface).toBe(DARK_TEXT);
  });

  it('deduplicates identical seed values', () => {
    const palette = generatePalette([GREEN_SEED, GREEN_SEED, ORANGE_ACCENT]);

    expect(palette.primary).toBe(GREEN_SEED);
    expect(palette.accent).toBe(ORANGE_ACCENT);
    expectUniqueRoles(palette);
  });

  it('derives an accessible primary when the lead seed is too light for text', () => {
    const brightLime = '#A2FC87';
    const palette = generatePalette([brightLime]);
    const primaryOnSurface = evaluateContrast(palette.primary, palette.surface);

    expect(primaryOnSurface.normalText).not.toBe('fail');
    expect(primaryOnSurface.ratio).toBeGreaterThanOrEqual(4.5);
    expect(palette.primary).not.toBe(brightLime);
    expect(palette.accent).toBe(brightLime);
  });

  it('keeps a user-provided accent when the lead seed becomes a derived primary', () => {
    const brightLime = '#A2FC87';
    const palette = generatePalette([brightLime, ORANGE_ACCENT]);

    expect(evaluateContrast(palette.primary, palette.surface).normalText).not.toBe('fail');
    expect(palette.accent).toBe(ORANGE_ACCENT);
    expect(palette.primary).not.toBe(brightLime);
  });

  it('throws for empty seed lists', () => {
    expect(() => generatePalette([])).toThrow(/at least one seed/i);
  });
});

describe('generatePaletteFromSelection', () => {
  it('uses selected colors for roles and keeps a bright bold as accent when needed', () => {
    const selection = createDefaultSelection();
    const palette = generatePaletteFromSelection(selection);
    const roleHexes = Object.values(palette).map((hex) => hex.toUpperCase());
    const boldHexes = selection
      .filter((color) => color.group === 'bold')
      .map((color) => color.hex.toUpperCase());

    expect(boldHexes.some((hex) => roleHexes.includes(hex))).toBe(true);
    expect(evaluateContrast(palette.primary, palette.surface).normalText).not.toBe('fail');
  });

  it('keeps a bright bold color as accent when primary must be derived', () => {
    const brightLime = '#A2FC87';
    const purple = '#CCC6EA';
    const surface = '#EEF9EB';
    const dark = '#212D1E';

    const palette = generatePaletteFromSelection([
      { id: 'surface', name: 'Surface', hex: surface, group: 'light-neutral' },
      { id: 'lime', name: 'Lime', hex: brightLime, group: 'bold' },
      { id: 'purple', name: 'Purple', hex: purple, group: 'bold' },
      { id: 'dark', name: 'Dark', hex: dark, group: 'dark-neutral' },
    ]);

    expect(palette.surface).toBe(surface);
    expect(palette.accent.toUpperCase()).toBe(brightLime.toUpperCase());
    expect(evaluateContrast(palette.primary, palette.surface).normalText).not.toBe('fail');
  });
});
