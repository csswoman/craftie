import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import { contrastRatio } from '../utils/colorMath';
import { assignRolesFromHexes, extractSeedsFromPalette } from './rolePalette';
import {
  deriveDarkBackground,
  deriveTheme,
  resolveThemePalette,
  EMPTY_THEMES,
} from './themePalette';
import { deriveFondo } from '../utils/deriveRoles';

const toOklch = converter('oklch');

describe('themePalette', () => {
  it('derives a dark fondo tinted with the neutral hue', () => {
    const darkBg = deriveDarkBackground('#3366CC');
    expect(darkBg).toMatch(/^#[0-9A-F]{6}$/);
    expect(contrastRatio('#FFFFFF', darkBg)).toBeGreaterThan(4.5);
    const oklch = toOklch(darkBg);
    expect(oklch?.c ?? 1).toBeLessThan(0.02);
  });

  it('builds a coherent dark theme from seeds without re-extracting', () => {
    const light = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const seeds = extractSeedsFromPalette(light);

    const dark = deriveTheme(seeds, 'dark');

    expect(dark.fondo.source).toBe('derived');
    expect(dark.fondo.hex).not.toBe(light.fondo.hex);
    expect(dark.secundario.source === 'derived' || dark.secundario.source === 'corrected').toBe(true);
  });

  it('resolves active theme palette from seeds, derivation and overrides', () => {
    const light = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const seeds = extractSeedsFromPalette(light);

    const resolved = resolveThemePalette(seeds, 'light', EMPTY_THEMES);

    expect(resolved?.primario.hex).toBe(seeds.primario);
    expect(resolved?.fondo.source).toBe('derived');
    expect(resolved?.texto.source).toBe('derived');
  });

  it('lightens chromatic seeds for dark theme contrast', () => {
    const seeds = {
      primario: '#1A4D8F',
      acento: '#0F3D6E',
      neutralHue: 220,
    };

    const dark = deriveTheme(seeds, 'dark');

    expect(dark.primario.hex).toBe(seeds.primario);
    expect(dark.acento.hex).toBe(seeds.acento);
  });

  it('synthesizes light fondo as near-white with minimal chroma', () => {
    const fondo = deriveFondo(145, 'light');
    const oklch = toOklch(fondo);

    expect(oklch?.l ?? 0).toBeCloseTo(0.98, 2);
    expect(oklch?.c ?? 1).toBeLessThan(0.02);
  });
});
