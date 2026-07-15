import { describe, expect, it } from 'vitest';
import { converter } from 'culori';

import { MATERIALS, transformPalette, type Material } from './paintMaterials';

const toOklch = converter('oklch');

function readOklch(hex: string) {
  const color = toOklch(hex);
  if (!color || color.mode !== 'oklch' || color.l === undefined || color.c === undefined) {
    throw new Error(`Invalid color ${hex}`);
  }
  return { l: color.l, c: color.c, h: color.h ?? 0 };
}

describe('paint material transforms', () => {
  it.each<Material>(['gouache', 'acuarela', 'oleo'])('preserves hue for %s', (material) => {
    const source = readOklch('#D64B3B');
    const transformed = readOklch(transformPalette(['#D64B3B'], material)[0]!);

    expect(Math.abs(transformed.h - source.h)).toBeLessThan(0.2);
  });

  it('compresses gouache lightness and raises chroma', () => {
    const source = readOklch('#D64B3B');
    const transformed = MATERIALS.gouache.apply(source);

    expect(transformed.l).toBeCloseTo(0.5 + (source.l - 0.5) * 0.55);
    expect(transformed.c).toBeCloseTo(source.c * 1.05);
  });

  it('lightens and softens watercolor', () => {
    const source = readOklch('#7D372A');
    const transformed = MATERIALS.acuarela.apply(source);

    expect(transformed.l).toBeGreaterThan(source.l);
    expect(transformed.c).toBeCloseTo(source.c * 0.55);
    expect(transformed.l).toBeLessThanOrEqual(0.95);
  });

  it('expands oil lightness and raises chroma', () => {
    const source = readOklch('#D64B3B');
    const transformed = MATERIALS.oleo.apply(source);

    expect(transformed.l).toBeCloseTo(0.5 + (source.l - 0.5) * 1.15);
    expect(transformed.c).toBeCloseTo(source.c * 1.12);
  });

  it('clamps transformed colors to sRGB hex output', () => {
    expect(transformPalette(['#FF00FF'], 'oleo')[0]).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('keeps invalid colors unchanged', () => {
    expect(transformPalette(['not-a-color'], 'gouache')).toEqual(['not-a-color']);
  });
});
