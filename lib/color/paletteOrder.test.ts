import { describe, expect, it } from 'vitest';

import { addColorToPalette, renamePaletteColor, replacePaletteColor } from './paletteOrder';
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

describe('addColorToPalette', () => {
  it('adds a custom hex to catalog and selection', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest')!;
    const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected = [porcelain, seaspray, zest, twilight];

    const result = addColorToPalette(catalog, selected, '#EAE7E2');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.catalog.some((color) => color.hex === '#EAE7E2')).toBe(true);
      expect(result.selected.some((color) => color.hex === '#EAE7E2')).toBe(true);
    }
  });

  it('selects an existing catalog color instead of duplicating it', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected = [porcelain, seaspray, zest];

    const result = addColorToPalette(catalog, selected, porcelain.hex);

    expect(result.ok).toBe(false);
  });

  it('stores a custom name when provided', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest')!;
    const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected = [porcelain, seaspray, zest, twilight];

    const result = addColorToPalette(catalog, selected, '#6986B8', {
      customName: 'Azul acero',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const added = result.catalog.find((color) => color.hex === '#6986B8');
      expect(added?.name).toBe('Azul acero');
      expect(added?.customName).toBe(true);
    }
  });
});

describe('renamePaletteColor', () => {
  it('renames a selected color and preserves the custom label', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected = [porcelain, seaspray];

    const result = renamePaletteColor(catalog, selected, seaspray.id, 'Mi acento');

    expect(result).not.toBeNull();
    expect(result!.selected.find((color) => color.id === seaspray.id)?.name).toBe('Mi acento');
    expect(result!.selected.find((color) => color.id === seaspray.id)?.customName).toBe(true);
    expect(result!.catalog.find((color) => color.id === seaspray.id)?.name).toBe('Mi acento');
  });

  it('renames a catalog color that is not selected', () => {
    const chalk = SELECTABLE_COLORS.find((color) => color.id === 'chalk')!;
    const catalog = [...SELECTABLE_COLORS];
    const selected: typeof SELECTABLE_COLORS = [];

    const result = renamePaletteColor(catalog, selected, chalk.id, 'Crema suave');

    expect(result).not.toBeNull();
    expect(result!.catalog.find((color) => color.id === chalk.id)?.name).toBe('Crema suave');
    expect(result!.selected).toHaveLength(0);
  });
});
