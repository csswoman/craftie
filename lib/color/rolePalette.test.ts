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
import { relativeLuminance } from '../utils/colorMath';
import { hasAdequateSurfaceFillSeparation } from '../utils/surfaceFillSeparation';

const toOklch = converter('oklch');

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
    expect(palette.texto.source).toBe('derived');
    expect(palette.superficie.source).toBe('derived');
    expect(palette.borde.source).toBe('derived');
    expect(palette.secundario.source).toBe('derived');
    expect(palette.primario.source).toBe('extracted');
    expect(palette.acento.source).toBe('extracted');

    const fondoOklch = toOklch(palette.fondo.hex);
    expect(fondoOklch?.l ?? 0).toBeCloseTo(0.98, 1);
    expect(fondoOklch?.c ?? 1).toBeLessThan(0.02);
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
    expect(palette.primario.source).toBe('extracted');
    expect(palette.secundario.source).toBe('derived');
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

  it('toggles a color off by reverting its role to derived', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.4 },
      { hex: '#9ADBD6', prominence: 0.3 },
      { hex: '#2C3E50', prominence: 0.3 },
    ]);

    const toggledOff = toggleColorInRolePalette(palette, '#9ADBD6');
    expect(toggledOff.primario.source).toBe('derived');
    expect(normalizeHex(toggledOff.primario.hex)).not.toBe(normalizeHex('#9ADBD6'));

    const toggledOn = toggleColorInRolePalette(toggledOff, '#9ADBD6');
    expect(normalizeHex(toggledOn.primario.hex)).toBe(normalizeHex('#9ADBD6'));
    expect(toggledOn.primario.source).toBe('extracted');
  });

  it('preserves locked roles when merging a new auto-assignment', () => {
    const current = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#2C3E50']);
    const lockedPrimario = replaceRoleHex(current, 'primario', '#FF5500');
    const reassigned = assignRolesFromHexes(['#FFFFFF', '#3366CC', '#111111']);

    const merged = mergeRolePalettePreservingLocks(lockedPrimario, reassigned, ['primario']);

    expect(merged.primario.hex).toBe('#FF5500');
    expect(merged.fondo.source).toBe('derived');
  });

  it('recomputes derived neutrals when fondo changes, except locked roles', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#9ADBD6', '#E8D44D', '#2C3E50']);
    const seeds = extractSeedsFromPalette(palette);
    const originalTexto = palette.texto.hex;
    const originalSuperficie = palette.superficie.hex;

    const updated = replaceRoleHex(palette, 'fondo', '#1A1A2E');

    expect(updated.texto.hex).not.toBe(originalTexto);
    expect(updated.superficie.hex).not.toBe(originalSuperficie);
    expect(updated.texto.source).toBe('derived');

    const locked = replaceRoleHex(updated, 'texto', '#ABCDEF', { lockedRoles: ['texto'] });
    const afterFondoChange = replaceRoleHex(locked, 'fondo', '#F0F4FA', { lockedRoles: ['texto'] });

    expect(afterFondoChange.texto.hex).toBe('#ABCDEF');
    expect(afterFondoChange.superficie.hex).not.toBe(updated.superficie.hex);
    expect(seeds.neutralHue).toBeDefined();
  });

  it('only seeds primario and acento from pixels when chromatics exist', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#9ADBD6', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
      { hex: '#2C3E50', prominence: 0.2 },
    ]);

    const extractedRoles = PALETTE_ROLE_ORDER.filter((role) => palette[role].source === 'extracted');

    expect(extractedRoles.sort()).toEqual(['acento', 'primario'].sort());
    expect(palette.fondo.source).toBe('derived');
    expect(palette.secundario.source).toBe('derived');
    expect(palette.texto.source).toBe('derived');
  });

  it('derives warm structural neutrals from primario instead of catalog grays', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#3366CC', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
    ]);

    expect(palette.superficie.source).toBe('derived');
    expect(palette.borde.source).toBe('derived');
    expect(toOklch(palette.superficie.hex)?.c ?? 0).toBeGreaterThan(0.004);
    expect(
      hasAdequateSurfaceFillSeparation(palette.superficie.hex, palette.primario.hex),
    ).toBe(true);
    expect(relativeLuminance(palette.superficie.hex)).toBeGreaterThan(
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
