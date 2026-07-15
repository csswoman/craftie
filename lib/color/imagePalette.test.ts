import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { assignRolesFromExtracted } from './rolePalette';
import {
  buildImagePalette,
  buildSelectableColorsFromExtracted,
  classifyHexToGroup,
} from './imagePalette';

const toOklch = converter('oklch');

describe('imagePalette', () => {  it('classifies colors into light, bold, and dark groups', () => {
    expect(classifyHexToGroup('#F7F7F5')).toBe('light-neutral');
    expect(classifyHexToGroup('#9ADBD6')).toBe('bold');
    expect(classifyHexToGroup('#2C3E50')).toBe('dark-neutral');
    expect(classifyHexToGroup('#D4C197')).toBe('light-neutral');
    expect(classifyHexToGroup('#523F27')).toBe('dark-neutral');
  });

  it('builds a grouped catalog from extracted colors', () => {
    const catalog = buildSelectableColorsFromExtracted([
      { hex: '#F7F7F5', prominence: 0.4 },
      { hex: '#9ADBD6', prominence: 0.25 },
      { hex: '#E8D44D', prominence: 0.2 },
      { hex: '#2C3E50', prominence: 0.15 },
    ]);

    expect(catalog.some((color) => color.group === 'light-neutral')).toBe(true);
    expect(catalog.some((color) => color.group === 'bold')).toBe(true);
    expect(catalog.some((color) => color.group === 'dark-neutral')).toBe(true);
    expect(catalog.length).toBeGreaterThanOrEqual(4);
    expect(catalog.every((color) => !/^(Claro|Intenso|Oscuro) \d+$/.test(color.name))).toBe(true);
  });

  it('does not invent white when extraction has no light neutral', () => {
    const { catalog, rolePalette } = buildImagePalette([
      { hex: '#7563FF', prominence: 0.3 },
      { hex: '#A5F085', prominence: 0.25 },
      { hex: '#1E1E1F', prominence: 0.2 },
    ]);

    expect(catalog.some((color) => color.hex === '#FFFFFF')).toBe(false);
    expect(['derived', 'extracted']).toContain(rolePalette.fondo.source);
    expect(rolePalette.texto.source).toBe('derived');
    expect(contrastRatio(rolePalette.texto.hex, rolePalette.fondo.hex)).toBeGreaterThan(4.5);
  });

  it('auto-fills all role slots from an image catalog', () => {
    const { catalog, rolePalette } = buildImagePalette([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#E8D44D', prominence: 0.15 },
      { hex: '#F4A261', prominence: 0.1 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]);

    expect(catalog.length).toBeGreaterThanOrEqual(5);
    expect(['extracted', 'corrected']).toContain(rolePalette.primario.source);
    expect(rolePalette.fondo.source).toBe('derived');
    expect(assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]).texto.hex).toBeTruthy();
  });

  it('keeps pastel source colors on small UI roles and synthesizes neutral surfaces', () => {
    const result = buildImagePalette([
      { hex: '#B6E4E6', prominence: 0.36 },
      { hex: '#EDC3DB', prominence: 0.28 },
      { hex: '#D0C4F4', prominence: 0.22 },
      { hex: '#89DFE7', prominence: 0.14 },
      { hex: '#8A7151', prominence: 0.005 },
    ]);

    expect(result.classification.type).toBe('pastel');
    expect(result.rolePalette.fondo.hex).not.toBe('#B6E4E6');
    expect(result.rolePalette.fondo.source).toBe('derived');
    expect(toOklch(result.rolePalette.fondo.hex)?.l ?? 0).toBeGreaterThan(0.96);
    expect(toOklch(result.rolePalette.fondo.hex)?.c ?? 0).toBeGreaterThan(0);
    expect(result.rolePalette.primario.source).toBe('extracted');
    expect(result.rolePalette.acento.hex).not.toBe('#8A7151');
    expect(contrastRatio(result.rolePalette.texto.hex, result.rolePalette.fondo.hex)).toBeGreaterThanOrEqual(4.5);
  });
});
