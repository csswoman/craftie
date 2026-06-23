import { describe, expect, it } from 'vitest';

import {
  buildDefaultSelectionFromCatalog,
  buildImagePalette,
  buildSelectableColorsFromExtracted,
  classifyHexToGroup,
} from './imagePalette';

describe('imagePalette', () => {
  it('classifies colors into light, bold, and dark groups', () => {
    expect(classifyHexToGroup('#F7F7F5')).toBe('light-neutral');
    expect(classifyHexToGroup('#9ADBD6')).toBe('bold');
    expect(classifyHexToGroup('#2C3E50')).toBe('dark-neutral');
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
  });

  it('creates a valid default selection from an image catalog', () => {
    const { catalog, selection } = buildImagePalette([
      { hex: '#F7F7F5', prominence: 0.35 },
      { hex: '#EFEFE8', prominence: 0.1 },
      { hex: '#9ADBD6', prominence: 0.2 },
      { hex: '#E8D44D', prominence: 0.15 },
      { hex: '#F4A261', prominence: 0.1 },
      { hex: '#2C3E50', prominence: 0.1 },
    ]);

    expect(catalog.length).toBeGreaterThanOrEqual(5);
    expect(selection.length).toBeGreaterThanOrEqual(4);
    expect(buildDefaultSelectionFromCatalog(catalog).length).toBeGreaterThan(0);
  });
});
