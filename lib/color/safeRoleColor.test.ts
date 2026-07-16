import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { getSafeRoleColorNearCurrent } from './safeRoleColor';
import type { PaletteRoleId, RolePalette, RoleSlot } from './roleTypes';

function slot(role: PaletteRoleId, hex: string): RoleSlot {
  return { role, hex, name: role, source: 'extracted' };
}

function buildPalette(overrides: Partial<Record<PaletteRoleId, string>>): RolePalette {
  const base: Record<PaletteRoleId, string> = {
    fondo: '#FBFAF8',
    superficie: '#F9EFF2',
    texto: '#1A1A1A',
    primario: '#2563EB',
    secundario: '#1C4B8E',
    acento: '#7C3AED',
    borde: '#D8D2CC',
  };

  const merged = { ...base, ...overrides };

  return Object.fromEntries(
    (Object.keys(merged) as PaletteRoleId[]).map((role) => [role, slot(role, merged[role])]),
  ) as RolePalette;
}

describe('getSafeRoleColorNearCurrent', () => {
  it('darkens a too-light text so it passes AA on both fondo and superficie', () => {
    const palette = buildPalette({ texto: '#F4ECEF' });

    const safe = getSafeRoleColorNearCurrent(palette, 'texto');

    expect(safe).not.toBeNull();
    expect(contrastRatio(safe!.hex, palette.fondo.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(safe!.hex, palette.superficie.hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('adjusts fondo so the existing text becomes legible', () => {
    const palette = buildPalette({ texto: '#3A3A3A', fondo: '#4A4A4A', superficie: '#4A4A4A' });

    const safe = getSafeRoleColorNearCurrent(palette, 'fondo');

    expect(safe).not.toBeNull();
    expect(contrastRatio(palette.texto.hex, safe!.hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('preserves hue and chroma while only shifting lightness', () => {
    const palette = buildPalette({ texto: '#F4ECEF' });

    const safe = getSafeRoleColorNearCurrent(palette, 'texto');

    // Cocoa Brown keeps its warm hue trace; it should not collapse to pure black.
    expect(safe!.hex.toUpperCase()).not.toBe('#000000');
  });

  it('returns null for roles without a fixable neutral pair', () => {
    const palette = buildPalette({});

    expect(getSafeRoleColorNearCurrent(palette, 'borde')).toBeNull();
  });
});
