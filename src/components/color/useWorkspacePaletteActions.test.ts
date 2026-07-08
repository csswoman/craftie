import { describe, expect, it, vi } from 'vitest';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { PaletteRoleId, RolePalette, RoleSlot } from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';

import { useWorkspacePaletteActions } from './useWorkspacePaletteActions';

function slot(role: PaletteRoleId, hex: string, name = role): RoleSlot {
  return { role, hex, name, source: 'extracted' };
}

function rolePalette(): RolePalette {
  return {
    fondo: slot('fondo', '#FFFFFF'),
    superficie: slot('superficie', '#F7F7F7'),
    texto: slot('texto', '#111111'),
    primario: slot('primario', '#3366FF'),
    secundario: slot('secundario', '#88AAFF'),
    acento: slot('acento', '#FFAA00'),
    borde: slot('borde', '#DDDDDD'),
  };
}

function color(overrides: Partial<SelectableColor> = {}): SelectableColor {
  return {
    id: 'custom-blue',
    name: 'Custom Blue',
    hex: '#3366FF',
    group: 'bold',
    ...overrides,
  };
}

function generatedPalette(): GeneratedPalette {
  return {
    primary: '#3366FF',
    accent: '#FFAA00',
    surface: '#FFFFFF',
    onSurface: '#111111',
    neutralLight: '#EEEEEE',
    neutralDark: '#222222',
  };
}

function useSetup(overrides: Partial<Parameters<typeof useWorkspacePaletteActions>[0]> = {}) {
  const options = {
    assignFromHexes: vi.fn(),
    generatedPalette: generatedPalette(),
    paletteCatalog: [] as SelectableColor[],
    replaceRole: vi.fn(),
    renameRole: vi.fn(),
    rolePalette: rolePalette(),
    setCatalogSource: vi.fn(),
    setError: vi.fn(),
    setGeneratedPalette: vi.fn(),
    setPaletteCatalog: vi.fn(),
    setRightPanelOpen: vi.fn(),
    ...overrides,
  };

  return { actions: useWorkspacePaletteActions(options), options };
}

describe('useWorkspacePaletteActions', () => {
  it('replaces generated palette roles with normalized hex values', () => {
    const { actions, options } = useSetup();

    expect(actions.handleReplacePreviewColor('primary', 'abc')).toBeNull();

    expect(options.setGeneratedPalette).toHaveBeenCalledWith({
      ...generatedPalette(),
      primary: '#AABBCC',
    });
  });

  it('feeds semantic derivation inputs when adding a custom color with an existing role palette', () => {
    const { actions, options } = useSetup();

    actions.handleAddColorByHex('#123456', 'Brand Blue');
    expect(options.setCatalogSource).toHaveBeenCalledWith('curated');
    expect(options.setPaletteCatalog).toHaveBeenCalled();
    expect(options.assignFromHexes).toHaveBeenCalledWith(
      expect.arrayContaining(['#123456']),
    );
    expect(options.setRightPanelOpen).toHaveBeenCalledWith(true);
    expect(options.setError).toHaveBeenCalledWith(null);
  });

  it('renames matching role slots when a catalog color is renamed', () => {
    const item = color();
    const { actions, options } = useSetup({ paletteCatalog: [item] });

    expect(actions.handleRenameColor(item, 'Electric Primary')).toBe(true);

    expect(options.setPaletteCatalog).toHaveBeenCalled();
    expect(options.renameRole).toHaveBeenCalledWith('primario', 'Electric Primary');
  });
});
