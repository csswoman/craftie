import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { assignRolesFromExtracted } from './rolePalette';
import {
  buildImagePalette,
  buildSelectableColorsFromExtracted,
  classifyHexToGroup,
  DEFAULT_IMAGE_LIGHT_NEUTRAL_HEX,
} from './imagePalette';

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

  it('adds a default white light neutral when extraction has none', () => {
    const { catalog, rolePalette } = buildImagePalette([
      { hex: '#7563FF', prominence: 0.3 },
      { hex: '#A5F085', prominence: 0.25 },
      { hex: '#1E1E1F', prominence: 0.2 },
    ]);

    expect(catalog.some((color) => color.hex === DEFAULT_IMAGE_LIGHT_NEUTRAL_HEX)).toBe(true);
    expect(rolePalette.fondo.source).toBe('derived');
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
});
