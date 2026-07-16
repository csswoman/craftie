import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import { randomRoleColor } from './randomRoleColor';
import type { PaletteRoleId } from './roleTypes';

function sequence(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
}

describe('randomRoleColor', () => {
  it('returns a valid hex for every role', () => {
    const roles: PaletteRoleId[] = [
      'fondo',
      'superficie',
      'texto',
      'primario',
      'secundario',
      'acento',
      'borde',
    ];

    for (const role of roles) {
      const hex = randomRoleColor(role, {}, sequence([0.2, 0.5, 0.8]));
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('keeps texto AA against fondo and superficie when context is provided', () => {
    const hex = randomRoleColor(
      'texto',
      { fondoHex: '#FBFAF8', superficieHex: '#F9EFF2' },
      sequence([0.9, 0.4, 0.1]),
    );

    expect(contrastRatio(hex, '#FBFAF8')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(hex, '#F9EFF2')).toBeGreaterThanOrEqual(4.5);
  });

  it('produces chromatic fills for primario', () => {
    const hex = randomRoleColor('primario', {}, sequence([0.55, 0.7, 0.2]));
    expect(hexToOklchChannels(hex).c).toBeGreaterThan(0.04);
  });

  it('varies when the random source changes', () => {
    const a = randomRoleColor('acento', {}, sequence([0.1, 0.2, 0.3]));
    const b = randomRoleColor('acento', {}, sequence([0.8, 0.6, 0.9]));
    expect(a).not.toBe(b);
  });
});
