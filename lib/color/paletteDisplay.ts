import type { GeneratedPalette } from './formulas';
import type { ContrastStatus, WCAGLevel } from './contrast';
import { GROUP_DISPLAY_LABELS, namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type RolePalette,
} from './rolePalette';
import type { SelectableColor } from './selectableColors';

export type PaletteColumnDisplay = {
  id: string;
  hex: string;
  name: string;
  roleLabel?: string;
  contrastBadges?: Array<{
    label: string;
    ratio: number;
    level: WCAGLevel;
    status: ContrastStatus;
  }>;
};

const GENERATED_ROLE_LABELS: Record<keyof GeneratedPalette, string> = {
  primary: 'Primario',
  accent: 'Acento',
  surface: 'Superficie',
  onSurface: 'Sobre superficie',
  neutralLight: 'Neutro claro',
  neutralDark: 'Neutro oscuro',
};

export const GENERATED_PALETTE_ROLE_ORDER: (keyof GeneratedPalette)[] = [
  'primary',
  'accent',
  'surface',
  'onSurface',
  'neutralLight',
  'neutralDark',
];

export function isGeneratedPaletteRole(id: string): id is keyof GeneratedPalette {
  return (GENERATED_PALETTE_ROLE_ORDER as string[]).includes(id);
}

function buildNamedLookup(hexes: string[]): Map<string, string> {
  return namePalette(
    hexes.map((hex) => ({ hex })),
    { style: 'creative' },
  );
}

export function resolvePaletteDisplayNames(colors: SelectableColor[]): Map<string, string> {
  const autoNames = namePalette(
    colors.map((color) => ({ hex: color.hex })),
    { style: 'creative' },
  );

  return new Map(
    colors.map((color) => [
      color.id,
      color.customName
        ? color.name
        : autoNames.get(normalizeHex(color.hex)) ?? color.name,
    ]),
  );
}

export function buildRolePaletteColumns(palette: RolePalette): PaletteColumnDisplay[] {
  return PALETTE_ROLE_ORDER.map((role) => {
    const slot = palette[role];

    return {
      id: role,
      hex: slot.hex,
      name: slot.name,
      roleLabel:
        slot.source === 'derived'
          ? `${ROLE_LABELS[role]} · derivado`
          : ROLE_LABELS[role],
    };
  });
}

export function buildSelectionPaletteColumns(colors: SelectableColor[]): PaletteColumnDisplay[] {
  const displayNames = resolvePaletteDisplayNames(colors);

  return colors.map((color) => ({
    id: color.id,
    hex: color.hex,
    name: displayNames.get(color.id) ?? color.name,
    roleLabel: GROUP_DISPLAY_LABELS[color.group],
  }));
}

export function buildGeneratedPaletteColumns(palette: GeneratedPalette): PaletteColumnDisplay[] {
  const hexes = GENERATED_PALETTE_ROLE_ORDER.map((role) => palette[role]);
  const names = buildNamedLookup(hexes);

  return GENERATED_PALETTE_ROLE_ORDER.map((role) => ({
    id: role,
    hex: palette[role],
    name: names.get(normalizeHex(palette[role])) ?? role,
    roleLabel: GENERATED_ROLE_LABELS[role],
  }));
}

export function buildSelectionAwarePaletteColumns(
  palette: GeneratedPalette,
  selectedColors: SelectableColor[],
): PaletteColumnDisplay[] {
  const roleByHex = new Map<string, string>();

  for (const role of GENERATED_PALETTE_ROLE_ORDER) {
    roleByHex.set(normalizeHex(palette[role]), GENERATED_ROLE_LABELS[role]);
  }

  const selectedColumns = buildSelectionPaletteColumns(selectedColors);
  const columns: PaletteColumnDisplay[] = [];
  const seen = new Set<string>();

  for (const column of selectedColumns) {
    const hex = normalizeHex(column.hex);

    if (seen.has(hex)) {
      continue;
    }

    seen.add(hex);
    columns.push({
      ...column,
      roleLabel: roleByHex.get(hex) ?? column.roleLabel,
    });
  }

  for (const role of GENERATED_PALETTE_ROLE_ORDER) {
    const hex = normalizeHex(palette[role]);

    if (seen.has(hex)) {
      continue;
    }

    seen.add(hex);
    const names = buildNamedLookup([palette[role]]);

    columns.push({
      id: role,
      hex: palette[role],
      name: names.get(hex) ?? role,
      roleLabel: `${GENERATED_ROLE_LABELS[role]} · derivado`,
    });
  }

  return columns;
}
