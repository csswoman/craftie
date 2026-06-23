import type { GeneratedPalette } from './formulas';
import { GROUP_DISPLAY_LABELS, namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import type { SelectableColor } from './selectableColors';

export type PaletteColumnDisplay = {
  id: string;
  hex: string;
  name: string;
  roleLabel?: string;
};

const GENERATED_ROLE_LABELS: Record<keyof GeneratedPalette, string> = {
  primary: 'Primario',
  accent: 'Acento',
  surface: 'Superficie',
  onSurface: 'Sobre superficie',
  neutralLight: 'Neutro claro',
  neutralDark: 'Neutro oscuro',
};

const GENERATED_ROLE_ORDER: (keyof GeneratedPalette)[] = [
  'primary',
  'accent',
  'surface',
  'onSurface',
  'neutralLight',
  'neutralDark',
];

function buildNamedLookup(hexes: string[]): Map<string, string> {
  return namePalette(
    hexes.map((hex) => ({ hex })),
    { style: 'creative' },
  );
}

export function buildSelectionPaletteColumns(colors: SelectableColor[]): PaletteColumnDisplay[] {
  return colors.map((color) => ({
    id: color.id,
    hex: color.hex,
    name: color.name,
    roleLabel: GROUP_DISPLAY_LABELS[color.group],
  }));
}

export function buildGeneratedPaletteColumns(palette: GeneratedPalette): PaletteColumnDisplay[] {
  const hexes = GENERATED_ROLE_ORDER.map((role) => palette[role]);
  const names = buildNamedLookup(hexes);

  return GENERATED_ROLE_ORDER.map((role) => ({
    id: role,
    hex: palette[role],
    name: names.get(normalizeHex(palette[role])) ?? role,
    roleLabel: GENERATED_ROLE_LABELS[role],
  }));
}
