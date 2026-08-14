import { randomRoleColor } from './randomRoleColor';
import { deriveMutedTextHex } from './mutedText';
import type { ThemeId } from './themePalette';
import { PALETTE_ROLE_ORDER, type PaletteRoleId, type RolePalette } from './roleTypes';

/**
 * Builds hex updates for unlocked palette roles in the active theme band.
 * Locked roles keep their current hex and act as contrast context for unlocked
 * texto / fondo / superficie. The opposite theme is derived on apply via
 * theme counterparts (with a neutral refresh pass for AA).
 */
export function randomUnlockedRolePalette(
  palette: RolePalette,
  lockedRoles: readonly PaletteRoleId[],
  random: () => number = Math.random,
  theme: ThemeId = 'light',
): Partial<Record<PaletteRoleId, string>> {
  const locked = new Set(lockedRoles);
  const nextHex = Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [role, palette[role].hex]),
  ) as Record<PaletteRoleId, string>;

  const context = () => ({
    theme,
    fondoHex: nextHex.fondo,
    superficieHex: nextHex.superficie,
    textoHex: nextHex.texto,
  });

  for (const role of ['primario', 'secundario', 'acento', 'borde'] as const) {
    if (!locked.has(role)) {
      nextHex[role] = randomRoleColor(role, context(), random);
    }
  }

  for (const role of ['fondo', 'superficie'] as const) {
    if (!locked.has(role)) {
      nextHex[role] = randomRoleColor(role, context(), random);
    }
  }

  if (!locked.has('texto')) {
    nextHex.texto = randomRoleColor('texto', context(), random);
  }

  if (!locked.has('texto-secundario')) {
    nextHex['texto-secundario'] = deriveMutedTextHex(
      nextHex.texto,
      nextHex.superficie,
      3,
    );
  }

  const updates: Partial<Record<PaletteRoleId, string>> = {};
  for (const role of PALETTE_ROLE_ORDER) {
    if (!locked.has(role)) {
      updates[role] = nextHex[role];
    }
  }
  return updates;
}

export function hasUnlockedPaletteRoles(lockedRoles: readonly PaletteRoleId[]): boolean {
  const locked = new Set(lockedRoles);
  return PALETTE_ROLE_ORDER.some((role) => !locked.has(role));
}
