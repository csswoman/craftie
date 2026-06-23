import { describe, expect, it } from 'vitest';

import { replacePaletteColor } from './paletteOrder';
import { SELECTABLE_COLORS } from './selectableColors';

describe('replacePaletteColor', () => {
  it('updates catalog and selection when a shade is applied', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest')!;
    const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected = [porcelain, seaspray, zest, twilight];

    const result = replacePaletteColor(catalog, selected, porcelain.id, '#D8E8D2');

    expect(result).not.toBeNull();
    expect(result!.selected.find((color) => color.id === porcelain.id)?.hex).toBe('#D8E8D2');
    expect(result!.catalog.find((color) => color.id === porcelain.id)?.hex).toBe('#D8E8D2');
    expect(result!.catalog.find((color) => color.id === porcelain.id)?.name).not.toBe(porcelain.name);
  });

  it('syncs image catalog entries when the color id changes', () => {
    const catalog = [
      {
        id: 'image-bold-9ADBD6',
        name: 'Seaspray Mist',
        hex: '#9ADBD6',
        group: 'bold' as const,
      },
    ];
    const selected = [...catalog];

    const result = replacePaletteColor(catalog, selected, 'image-bold-9ADBD6', '#7EC8E3');

    expect(result).not.toBeNull();
    expect(result!.selected[0]?.hex).toBe('#7EC8E3');
    expect(result!.catalog.some((color) => color.id === 'image-bold-7EC8E3')).toBe(true);
    expect(result!.catalog.some((color) => color.id === 'image-bold-9ADBD6')).toBe(false);
  });
});
