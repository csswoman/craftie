import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
} from './colorGroupClassification';
import { nameForHex } from './naming';
import { normalizeHex } from './normalizeHex';
import { deriveChromatic, toOklch } from './oklchMath';
import { recomputeDerivedRoles } from './rolePaletteDerived';
import {
  applyUniqueRoleNames,
  createRoleSlot,
} from './rolePaletteSlots';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type PaletteRoleId,
  type RolePalette,
} from './roleTypes';
import type { ColorGroupId } from './selectableColors';
import {
  deriveFondo,
  deriveNeutralRoles,
  deriveSecondary,
} from '../utils/deriveRoles';

export function isPaletteRoleId(id: string): id is PaletteRoleId {
  return (PALETTE_ROLE_ORDER as string[]).includes(id);
}

export function replaceRoleHex(
  palette: RolePalette,
  role: PaletteRoleId,
  newHex: string,
  options?: {
    lockedRoles?: PaletteRoleId[];
    neutralHue?: number;
    theme?: 'light' | 'dark';
  },
): RolePalette {
  const normalized = normalizeHex(newHex);
  const paletteInput = PALETTE_ROLE_ORDER.map((entry) => ({
    hex: entry === role ? normalized : palette[entry].hex,
  }));

  const next = { ...palette };
  const slot = palette[role];

  next[role] = {
    ...slot,
    hex: normalized,
    source: 'extracted',
    name:
      slot.name && slot.name !== ROLE_LABELS[role] && !slot.name.match(/ \d+$/)
        ? slot.name
        : nameForHex(normalized, paletteInput, { style: 'creative' }),
  };

  const updated = applyUniqueRoleNames(next);

  if (role === 'fondo' || role === 'primario') {
    const neutralHue =
      options?.neutralHue ??
      (role === 'fondo' ? (toOklch(normalized)?.h ?? undefined) : undefined);

    return recomputeDerivedRoles(
      updated,
      options?.lockedRoles ?? [],
      neutralHue !== undefined ? { neutralHue } : undefined,
      options?.theme ?? 'light',
    );
  }

  return updated;
}

export function renameRoleSlot(
  palette: RolePalette,
  role: PaletteRoleId,
  newName: string,
): RolePalette | null {
  const trimmed = newName.trim();

  if (trimmed.length === 0 || trimmed.length > 40) {
    return null;
  }

  return {
    ...palette,
    [role]: {
      ...palette[role],
      name: trimmed,
    },
  };
}

const STRUCTURAL_DERIVED_ROLES = new Set<PaletteRoleId>(['superficie', 'borde']);

const GROUP_TO_ROLES: Record<ColorGroupId, PaletteRoleId[]> = {
  'light-neutral': ['fondo'],
  bold: ['primario', 'secundario', 'acento'],
  'dark-neutral': ['texto'],
};

function pickRoleForGroup(palette: RolePalette, group: ColorGroupId): PaletteRoleId {
  const roles = GROUP_TO_ROLES[group].filter(
    (role) => !STRUCTURAL_DERIVED_ROLES.has(role),
  );

  const derived = roles.find((role) => palette[role].source === 'derived');

  if (derived) {
    return derived;
  }

  return roles[0]!;
}

export function assignColorToRolePalette(
  palette: RolePalette,
  hex: string,
  preferredRole?: PaletteRoleId,
): RolePalette {
  const normalized = normalizeHex(hex);
  const group = classifyColorToGroup(normalized, DEFAULT_COLOR_GROUP_THRESHOLDS);
  const role = preferredRole ?? pickRoleForGroup(palette, group);

  return replaceRoleHex(palette, role, normalized);
}

function deriveSlotHex(
  role: PaletteRoleId,
  palette: RolePalette,
  neutralHue?: number,
  theme: 'light' | 'dark' = 'light',
): string {
  const fondoHex =
    neutralHue !== undefined ? deriveFondo(neutralHue, theme) : palette.fondo.hex;
  const neutrals = deriveNeutralRoles(fondoHex, palette.primario.hex, theme);

  switch (role) {
    case 'fondo':
      return neutralHue !== undefined
        ? deriveFondo(neutralHue, theme)
        : palette.fondo.hex;
    case 'superficie':
      return neutrals.superficie;
    case 'texto':
      return neutrals.texto;
    case 'borde':
      return neutrals.borde;
    case 'primario':
      return deriveChromatic(palette.primario.hex, 0);
    case 'secundario':
      return deriveSecondary(palette.primario.hex);
    case 'acento':
      return deriveChromatic(palette.primario.hex, 180);
  }
}

function setDerivedRoleSlot(palette: RolePalette, role: PaletteRoleId): RolePalette {
  const hex = deriveSlotHex(role, palette);
  const paletteInput = PALETTE_ROLE_ORDER.map((entry) => ({
    hex: entry === role ? hex : palette[entry].hex,
  }));

  return applyUniqueRoleNames({
    ...palette,
    [role]: createRoleSlot(role, hex, 'derived', paletteInput),
  });
}

export function toggleColorInRolePalette(
  palette: RolePalette,
  hex: string,
  preferredRole?: PaletteRoleId,
): RolePalette {
  const normalized = normalizeHex(hex);
  const matchingRole = PALETTE_ROLE_ORDER.find(
    (role) => normalizeHex(palette[role].hex) === normalized,
  );

  if (matchingRole) {
    return setDerivedRoleSlot(palette, matchingRole);
  }

  return assignColorToRolePalette(palette, hex, preferredRole);
}
