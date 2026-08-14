import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { assignRolesFromHexes } from './rolePalette';
import { hasUnlockedPaletteRoles, randomUnlockedRolePalette } from './randomUnlockedRolePalette';
import type { PaletteRoleId } from './roleTypes';

function sequence(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
}

describe('randomUnlockedRolePalette', () => {
  const palette = assignRolesFromHexes(['#FBFAF8', '#2F6FED', '#E4572E', '#1A1A1A']);

  it('updates only unlocked roles', () => {
    const locked: PaletteRoleId[] = ['primario', 'acento'];
    const updates = randomUnlockedRolePalette(palette, locked, sequence([0.2, 0.5, 0.8]));

    expect(updates.primario).toBeUndefined();
    expect(updates.acento).toBeUndefined();
    expect(updates.fondo).toBeDefined();
    expect(updates.texto).toBeDefined();
  });

  it('returns no updates when every role is locked', () => {
    const locked: PaletteRoleId[] = [
      'fondo',
      'superficie',
      'texto',
      'texto-secundario',
      'primario',
      'secundario',
      'acento',
      'borde',
    ];
    expect(randomUnlockedRolePalette(palette, locked, sequence([0.1, 0.2, 0.3]))).toEqual({});
    expect(hasUnlockedPaletteRoles(locked)).toBe(false);
  });

  it('keeps texto AA against regenerated surfaces when unlocked', () => {
    const updates = randomUnlockedRolePalette(
      palette,
      [],
      sequence([0.15, 0.4, 0.7, 0.25, 0.6, 0.9]),
    );
    const fondo = updates.fondo ?? palette.fondo.hex;
    const superficie = updates.superficie ?? palette.superficie.hex;
    const texto = updates.texto ?? palette.texto.hex;

    expect(contrastRatio(texto, fondo)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(texto, superficie)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps dark-theme texto AA against regenerated dark surfaces', () => {
    const updates = randomUnlockedRolePalette(
      palette,
      [],
      sequence([0.2, 0.45, 0.7, 0.3, 0.55, 0.85]),
      'dark',
    );
    const fondo = updates.fondo ?? palette.fondo.hex;
    const superficie = updates.superficie ?? palette.superficie.hex;
    const texto = updates.texto ?? palette.texto.hex;

    expect(contrastRatio(texto, fondo)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(texto, superficie)).toBeGreaterThanOrEqual(4.5);
  });

  it('reports whether any role can be randomized', () => {
    expect(hasUnlockedPaletteRoles([])).toBe(true);
    expect(hasUnlockedPaletteRoles(['primario'])).toBe(true);
  });
});
