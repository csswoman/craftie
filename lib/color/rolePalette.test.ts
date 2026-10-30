import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import {
  assignColorToRolePalette,
  assignRolesFromExtracted,
  assignRolesFromHexes,
  extractSeedsFromPalette,
  mergeRolePalettePreservingLocks,
  PALETTE_ROLE_ORDER,
  replaceRoleHex,
  rolePaletteToGeneratedPalette,
  toggleColorInRolePalette,
  validateRolePalette,
} from './rolePalette';
import { normalizeHex } from './normalizeHex';
import { contrastRatio, relativeLuminance } from '../utils/colorMath';
import { hasAdequateSurfaceFillSeparation } from '../utils/surfaceFillSeparation';
import { isTextSafe } from './roleFitness';

const toOklch = converter('oklch');

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return distance > 180 ? 360 - distance : distance;
}

describe('rolePalette', () => {
  it('fills all seven role slots from extracted colors', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#E8D44D', prominence: 0.15 },
      { hex: '#F4A261', prominence: 0.1 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]);

    expect(PALETTE_ROLE_ORDER.every((role) => palette[role].hex)).toBe(true);
    expect(palette.fondo.source).toBe('derived');
    expect(normalizeHex(palette.fondo.hex)).not.toBe(normalizeHex('#F7F7F5'));
    expect(palette.superficie.source).toBe('derived');
    expect(palette.texto.source).toBe('derived');
    expect(['extracted', 'corrected']).toContain(palette.primario.source);
    expect(['extracted', 'corrected']).toContain(palette.acento.source);

    const fondoOklch = toOklch(palette.fondo.hex);
    expect(fondoOklch?.l ?? 0).toBeCloseTo(0.98, 1);
    expect(fondoOklch?.c ?? 1).toBeLessThan(0.02);
  });

  it('uses more than two extracted colors when the source palette is rich', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#E8D44D', prominence: 0.15 },
      { hex: '#F4A261', prominence: 0.1 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]);

    const sourceBackedRoles = PALETTE_ROLE_ORDER.filter(
      (role) => palette[role].source !== 'derived',
    );

    expect(sourceBackedRoles.length).toBeGreaterThan(2);
  });

  it('assigns distinct hues to primario, secundario and acento', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.2 },
      { hex: '#9ADBD6', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
      { hex: '#F4A261', prominence: 0.15 },
      { hex: '#2C3E50', prominence: 0.2 },
    ]);

    const hues = [palette.primario.hex, palette.secundario.hex, palette.acento.hex];
    expect(new Set(hues).size).toBe(3);
  });

  it('derives missing roles from the dominant hue', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#7563FF', prominence: 0.3 },
      { hex: '#A5F085', prominence: 0.25 },
      { hex: '#1E1E1F', prominence: 0.2 },
    ]);

    expect(palette.fondo.source).toBe('derived');
    expect(palette.texto.source).toBe('derived');
    expect(['extracted', 'corrected']).toContain(palette.primario.source);
    expect(palette.superficie.source).toBe('derived');
    expect(PALETTE_ROLE_ORDER.every((role) => palette[role].hex)).toBe(true);
    expect(validateRolePalette(palette)).toEqual({ ok: true });
  });

  it('maps role palette to generated palette roles', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#E8D44D', '#2C3E50']);
    const generated = rolePaletteToGeneratedPalette(palette);

    expect(generated.surface).toBe(palette.fondo.hex);
    expect(generated.onSurface).toBe(palette.texto.hex);
    expect(generated.primary).toBe(palette.primario.hex);
    expect(generated.accent).toBe(palette.acento.hex);
    expect(generated.neutralLight).toBe(palette.superficie.hex);
    expect(generated.neutralDark).toBe(palette.borde.hex);
  });

  it('replaces a role hex and marks it as extracted', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.4 },
      { hex: '#9ADBD6', prominence: 0.3 },
      { hex: '#2C3E50', prominence: 0.3 },
    ]);

    const updated = replaceRoleHex(palette, 'primario', '#FF5500');

    expect(updated.primario.hex).toBe('#FF5500');
    expect(updated.primario.source).toBe('extracted');
  });

  it('refreshes primario textSafe when its hex is replaced', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const updated = replaceRoleHex(palette, 'primario', '#FFFFFF');

    expect(updated.primario.textSafe).toBe(
      isTextSafe(updated.primario.hex, updated.superficie.hex),
    );
  });

  it('refreshes muted text and expressive textSafe when superficie is replaced', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const updated = replaceRoleHex(palette, 'superficie', '#B0B0B0');
    const mutedRatio = contrastRatio(
      updated['texto-secundario'].hex,
      updated.superficie.hex,
    );

    expect(mutedRatio).toBeGreaterThanOrEqual(2.8);
    expect(mutedRatio).toBeLessThanOrEqual(3.4);
    for (const role of ['primario', 'secundario', 'acento'] as const) {
      expect(updated[role].textSafe).toBe(
        isTextSafe(updated[role].hex, updated.superficie.hex),
      );
    }
  });

  it('preserves locked muted text when superficie is replaced', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const mutedHex = palette['texto-secundario'].hex;

    const updated = replaceRoleHex(palette, 'superficie', '#202020', {
      lockedRoles: ['texto-secundario'],
    });

    expect(updated['texto-secundario'].hex).toBe(mutedHex);
  });

  it('toggles a color off by reverting its role to derived', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.4 },
      { hex: '#9ADBD6', prominence: 0.3 },
      { hex: '#2C3E50', prominence: 0.3 },
    ]);

    const toggledOff = toggleColorInRolePalette(palette, '#9ADBD6');
    expect(['derived', 'corrected']).toContain(toggledOff.primario.source);
    expect(normalizeHex(toggledOff.primario.hex)).not.toBe(normalizeHex('#9ADBD6'));

    const toggledOn = toggleColorInRolePalette(toggledOff, '#9ADBD6');
    expect(PALETTE_ROLE_ORDER.every((role) => toggledOn[role].hex)).toBe(true);
    expect(['extracted', 'corrected']).toContain(toggledOn.primario.source);
  });

  it('preserves locked roles when merging a new auto-assignment', () => {
    const current = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#2C3E50']);
    const lockedPrimario = replaceRoleHex(current, 'primario', '#FF5500');
    const reassigned = assignRolesFromHexes(['#FFFFFF', '#3366CC', '#111111']);

    const merged = mergeRolePalettePreservingLocks(lockedPrimario, reassigned, ['primario']);

    expect(merged.primario.hex).toBe('#FF5500');
    expect(normalizeHex(merged.fondo.hex)).not.toBe(normalizeHex('#FFFFFF'));
    expect(merged.fondo.source).toBe('derived');
  });

  it('recomputes derived neutrals when fondo changes, except locked roles', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#E8D44D', '#2C3E50']);
    const seeds = extractSeedsFromPalette(palette);
    const originalSuperficie = palette.superficie.hex;

    const updated = replaceRoleHex(palette, 'fondo', '#1A1A2E');

    expect(updated.superficie.hex).not.toBe(originalSuperficie);
    expect(contrastRatio(updated.texto.hex, updated.fondo.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(updated.texto.hex, updated.superficie.hex)).toBeGreaterThanOrEqual(4.5);

    const locked = replaceRoleHex(updated, 'texto', '#ABCDEF', { lockedRoles: ['texto'] });
    const afterFondoChange = replaceRoleHex(locked, 'fondo', '#F0F4FA', { lockedRoles: ['texto'] });

    expect(afterFondoChange.texto.hex).toBe('#ABCDEF');
    expect(afterFondoChange.superficie.hex).not.toBe(updated.superficie.hex);
    expect(seeds.neutralHue).toBeDefined();
  });

  it('derives structural neutrals instead of assigning usable source neutrals to them', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#9ADBD6', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
      { hex: '#2C3E50', prominence: 0.2 },
    ]);

    expect(normalizeHex(palette.fondo.hex)).not.toBe(normalizeHex('#F7F7F5'));
    expect(palette.fondo.source).toBe('derived');
    expect(normalizeHex(palette.texto.hex)).not.toBe(normalizeHex('#2C3E50'));
    expect(palette.texto.source).toBe('derived');
    expect(['extracted', 'corrected']).toContain(palette.primario.source);
    expect(['extracted', 'corrected', 'derived']).toContain(palette.acento.source);
    expect(['extracted', 'corrected', 'derived']).toContain(palette.secundario.source);
  });

  it('derives superficie even when a source neutral stays close to fondo', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#3366CC', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
    ]);

    expect(normalizeHex(palette.superficie.hex)).not.toBe(normalizeHex('#EFEFE8'));
    expect(palette.superficie.source).toBe('derived');

    const superficieVsFondo = contrastRatio(palette.superficie.hex, palette.fondo.hex);
    expect(superficieVsFondo).toBeGreaterThan(1);
    expect(superficieVsFondo).toBeLessThanOrEqual(1.4);
    expect(
      hasAdequateSurfaceFillSeparation(palette.superficie.hex, palette.primario.hex),
    ).toBe(true);
  });

  it('keeps derived structural neutrals tied to the dominant image hue', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#3366CC', prominence: 0.35 },
      { hex: '#E8D44D', prominence: 0.3 },
    ]);

    expect(palette.superficie.source).toBe('derived');
    expect(palette.borde.source).toBe('derived');
    const surface = toOklch(palette.superficie.hex);
    // Blue and yellow are near-opposite hues; averaging them would tint the
    // neutrals green, so the dominant source hue drives the ramp.
    const dominantHue = toOklch('#3366CC')?.h ?? 0;
    expect(surface?.c ?? 0).toBeGreaterThan(0.01);
    expect(surface?.c ?? 1).toBeLessThanOrEqual(0.02);
    expect(hueDistance(surface?.h ?? 0, dominantHue)).toBeLessThanOrEqual(3);
    expect(
      hasAdequateSurfaceFillSeparation(palette.superficie.hex, palette.primario.hex),
    ).toBe(true);
    expect(relativeLuminance(palette.superficie.hex)).toBeLessThan(
      relativeLuminance(palette.fondo.hex),
    );
  });

  it('routes catalog light neutrals to fondo reference, not structural surfaces', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const updated = assignColorToRolePalette(palette, '#EFEFE8');

    expect(updated.fondo.source).toBe('derived');
    expect(normalizeHex(updated.superficie.hex)).not.toBe(normalizeHex('#EFEFE8'));
    expect(normalizeHex(updated.borde.hex)).not.toBe(normalizeHex('#EFEFE8'));
  });
});
