import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import { contrastRatio, relativeLuminance } from './colorMath';
import {
  deriveBorder,
  deriveElevation,
  deriveFondo,
  deriveNavbar,
  deriveNeutralRoles,
  deriveSecondary,
  deriveSuperficie,
  deriveText,
  polarityOf,
} from './deriveRoles';
import {
  hasAdequateSurfaceFillSeparation,
} from './surfaceFillSeparation';

const toOklch = converter('oklch');

describe('deriveRoles', () => {
  const fondo = deriveFondo(210, 'light');
  const primario = '#3366CC';

  it('classifies polarity from relative luminance', () => {
    expect(polarityOf('#FFFFFF')).toBe('light');
    expect(polarityOf('#111111')).toBe('dark');
  });

  it('derives brand-tinted surfaces separated from full fill intensity', () => {
    const neutrals = deriveNeutralRoles(fondo, primario, 'light');

    for (const hex of [neutrals.superficie, neutrals.navbar]) {
      const oklch = toOklch(hex);

      expect(oklch?.c ?? 0).toBeGreaterThan(0.004);
    }

    expect(hasAdequateSurfaceFillSeparation(neutrals.superficie, primario)).toBe(true);
    expect(toOklch(neutrals.borde)?.c ?? 0).toBeGreaterThan(0.004);
  });

  it('separates card from fondo by elevation, not a flat gray overlay', () => {
    const lightSurface = deriveSuperficie(fondo, primario, 'light');
    const darkFondo = deriveFondo(210, 'dark');
    const darkSurface = deriveSuperficie(darkFondo, primario, 'dark');

    expect(relativeLuminance(lightSurface)).toBeGreaterThan(relativeLuminance(fondo));
    expect(relativeLuminance(darkSurface)).toBeGreaterThan(relativeLuminance(darkFondo));
    expect(hasAdequateSurfaceFillSeparation(lightSurface, primario)).toBe(true);
  });

  it('keeps navbar subtler than card while sharing brand temperature', () => {
    const card = deriveSuperficie(fondo, primario, 'light');
    const navbar = deriveNavbar(fondo, primario, 'light');
    const cardOklch = toOklch(card);
    const navbarOklch = toOklch(navbar);

    expect(navbar).not.toBe(card);
    expect(hasAdequateSurfaceFillSeparation(card, primario)).toBe(true);
    expect((cardOklch?.c ?? 0)).toBeGreaterThan(navbarOklch?.c ?? 0);
  });

  it('lifts tones with deriveElevation according to theme polarity', () => {
    const lightRaised = deriveElevation(fondo, 'light');
    const darkRaised = deriveElevation(deriveFondo(210, 'dark'), 'dark');

    expect(relativeLuminance(lightRaised)).toBeGreaterThan(relativeLuminance(fondo));
    expect(relativeLuminance(darkRaised)).toBeGreaterThan(
      relativeLuminance(deriveFondo(210, 'dark')),
    );
  });

  it('derives accessible text from the background', () => {
    const text = deriveText('#3366CC');
    expect(contrastRatio(text, '#3366CC')).toBeGreaterThan(4.5);
  });

  it('derives border as a brand-tinted mix between fondo and texto', () => {
    const border = deriveBorder(fondo, '#1A1C1E', primario);

    expect(border).not.toBe(fondo);
    expect(border).not.toBe('#1A1C1E');
    expect(toOklch(border)?.c ?? 0).toBeGreaterThan(0.008);
  });

  it('derives secondary as a tonal shift from primary', () => {
    const secondary = deriveSecondary('#3366CC');
    expect(secondary).not.toBe('#3366CC');
  });

  it('derives fondo as near-white or near-black with subtle tint', () => {
    const light = deriveFondo(210, 'light');
    const dark = deriveFondo(210, 'dark');
    const lightOklch = toOklch(light);
    const darkOklch = toOklch(dark);

    expect(lightOklch?.l ?? 0).toBeCloseTo(0.98, 2);
    expect(lightOklch?.c ?? 1).toBeLessThan(0.02);
    expect(darkOklch?.l ?? 1).toBeCloseTo(0.15, 2);
    expect(darkOklch?.c ?? 1).toBeLessThan(0.02);
  });
});
