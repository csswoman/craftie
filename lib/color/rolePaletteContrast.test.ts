import { describe, expect, it } from 'vitest';

import { evaluateContrast } from './contrast';
import {
  assignRolesFromExtracted,
  PALETTE_ROLE_ORDER,
} from './rolePalette';
import {
  buildRolePaletteColumnsWithContrast,
  getRolePaletteContrastChecks,
  hasRolePaletteContrastFailure,
} from './rolePaletteContrast';

describe('rolePaletteContrast', () => {
  it('reports contrast checks for texto on fondo and superficie', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#2C3E50', prominence: 0.15 },
    ]);

    const checks = getRolePaletteContrastChecks(palette);

    expect(checks).toHaveLength(2);
    expect(checks.map((check) => check.pairId)).toEqual(['texto/fondo', 'texto/superficie']);
    expect(checks[0]?.ratio).toBeCloseTo(
      evaluateContrast(palette.texto.hex, palette.fondo.hex).ratio,
      2,
    );
  });

  it('derives accessible texto when extracted neutrals are too similar', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#E8E8E8', prominence: 0.5 },
      { hex: '#D0D0D0', prominence: 0.3 },
      { hex: '#C8C8C8', prominence: 0.2 },
    ]);

    expect(palette.texto.source).toBe('derived');
    expect(hasRolePaletteContrastFailure(palette)).toBe(false);
    expect(
      buildRolePaletteColumnsWithContrast(palette).find((column) => column.id === 'texto')
        ?.contrastBadges?.every((badge) => badge.status !== 'fail'),
    ).toBe(true);
  });

  it('attaches contrast badges to texto, fondo, superficie and chromatic roles', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#FFFFFF', prominence: 0.4 },
      { hex: '#F0F0F0', prominence: 0.2 },
      { hex: '#111111', prominence: 0.2 },
      { hex: '#3366CC', prominence: 0.2 },
    ]);

    const columns = buildRolePaletteColumnsWithContrast(palette);
    const texto = columns.find((column) => column.id === 'texto');
    const fondo = columns.find((column) => column.id === 'fondo');
    const primario = columns.find((column) => column.id === 'primario');

    expect(texto?.contrastBadges?.length).toBe(2);
    expect(texto?.contrastBadges?.[0]?.label).toBe('vs Fondo');
    expect(fondo?.contrastBadges?.length).toBe(1);
    expect(fondo?.contrastBadges?.[0]?.level).not.toBe('fail');
    expect(primario?.contrastBadges?.length).toBe(1);
    expect(primario?.contrastBadges?.[0]?.label).toBe('Texto legible');
  });

  it('marks role columns when a required contrast pair fails AA', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F5F5F5', prominence: 0.4 },
      { hex: '#EEEEEE', prominence: 0.3 },
      { hex: '#E0E0E0', prominence: 0.2 },
      { hex: '#D8D8D8', prominence: 0.1 },
    ]);

    // Force a failing texto/fondo pair while keeping a valid structure.
    palette.texto = { ...palette.texto, hex: '#CFCFCF', source: 'extracted' };
    palette.fondo = { ...palette.fondo, hex: '#E8E8E8', source: 'extracted' };

    expect(hasRolePaletteContrastFailure(palette)).toBe(true);

    const columns = buildRolePaletteColumnsWithContrast(palette);
    const texto = columns.find((column) => column.id === 'texto');
    const fondo = columns.find((column) => column.id === 'fondo');

    expect(texto?.contrastBadges?.some((badge) => badge.status === 'fail')).toBe(true);
    expect(fondo?.contrastBadges?.some((badge) => badge.status === 'fail')).toBe(true);
  });
});

describe('rolePalette completeness', () => {
  it('fills all seven roles from a single extracted color using derived tints', () => {
    const palette = assignRolesFromExtracted([{ hex: '#7563FF', prominence: 1 }]);

    expect(PALETTE_ROLE_ORDER.every((role) => palette[role].hex)).toBe(true);
    expect(PALETTE_ROLE_ORDER.filter((role) => palette[role].source === 'derived').length).toBeGreaterThan(0);
  });
});
