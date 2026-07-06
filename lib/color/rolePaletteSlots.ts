import { nameForHex, namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
  type RoleSlot,
} from './roleTypes';

export function buildPaletteInput(
  slots: Partial<Record<PaletteRoleId, string>>,
): { hex: string }[] {
  return PALETTE_ROLE_ORDER.map((role) => slots[role])
    .filter(Boolean)
    .map((hex) => ({ hex: hex! }));
}

export function createRoleSlot(
  role: PaletteRoleId,
  hex: string,
  source: ColorSource,
  paletteInput: { hex: string }[],
): RoleSlot {
  const normalized = normalizeHex(hex);

  return {
    role,
    hex: normalized,
    name: nameForHex(normalized, paletteInput, { style: 'creative' }),
    source,
  };
}

export function applyUniqueRoleNames(palette: RolePalette): RolePalette {
  const names = namePalette(
    PALETTE_ROLE_ORDER.map((role) => ({ hex: palette[role].hex })),
    { style: 'creative' },
  );

  const next = { ...palette };

  for (const role of PALETTE_ROLE_ORDER) {
    next[role] = {
      ...next[role],
      name: names.get(normalizeHex(next[role].hex)) ?? ROLE_LABELS[role],
    };
  }

  return next;
}
