import { toOklch } from './oklchMath';
import { randomRoleColor } from './randomRoleColor';
import { deriveMutedTextHex } from './mutedText';
import type { ThemeId } from './themePalette';
import { PALETTE_ROLE_ORDER, type PaletteRoleId, type RolePalette } from './roleTypes';

/**
 * Hue offsets from the base hue for [primario, secundario, acento]. Each
 * scheme keeps one color family and gives the accent a clear hue contrast.
 */
const HARMONY_SCHEMES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 34, 180], // analogous secondary, complementary accent
  [0, 180, 34], // complementary secondary, analogous accent
  [0, 120, 240], // triadic
  [0, 150, 210], // split complementary
  [0, -34, 34], // analogous
];

const CHROMATIC_ROLES = ['primario', 'secundario', 'acento'] as const;
/** Below this chroma a locked color carries no reliable hue. */
const LOCKED_HUE_CHROMA_MIN = 0.03;

function hueOf(hex: string): number | null {
  const channels = toOklch(hex);
  return channels && (channels.c ?? 0) >= LOCKED_HUE_CHROMA_MIN ? (channels.h ?? 0) : null;
}

/**
 * Base hue for the harmony: a locked chromatic role anchors it (adjusted by
 * that role's scheme offset); otherwise it is random.
 */
function resolveBaseHue(
  palette: RolePalette,
  locked: ReadonlySet<PaletteRoleId>,
  offsets: readonly [number, number, number],
  random: () => number,
): number {
  for (const [index, role] of CHROMATIC_ROLES.entries()) {
    const hue = locked.has(role) ? hueOf(palette[role].hex) : null;

    if (hue !== null) {
      return (hue - offsets[index]! + 360) % 360;
    }
  }

  return random() * 360;
}

/**
 * Builds hex updates for unlocked palette roles in the active theme band.
 * Chromatic roles follow a random harmony scheme around one base hue, and
 * neutrals are tinted with that hue, so the result reads as one palette.
 *
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
  const offsets = HARMONY_SCHEMES[Math.floor(random() * HARMONY_SCHEMES.length) % HARMONY_SCHEMES.length]!;
  const baseHue = resolveBaseHue(palette, locked, offsets, random);
  const hueFor = (role: PaletteRoleId): number => {
    const index = (CHROMATIC_ROLES as readonly PaletteRoleId[]).indexOf(role);
    return (baseHue + (index === -1 ? 0 : offsets[index]!) + 360) % 360;
  };
  const nextHex = Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [role, palette[role].hex]),
  ) as Record<PaletteRoleId, string>;

  const context = (role: PaletteRoleId) => ({
    theme,
    hue: hueFor(role),
    fondoHex: nextHex.fondo,
    superficieHex: nextHex.superficie,
    // An unlocked texto is regenerated after the surfaces and adapts to them;
    // anchoring surfaces to the outgoing texto would drag them to mid-gray.
    textoHex: locked.has('texto') ? nextHex.texto : undefined,
  });

  for (const role of CHROMATIC_ROLES) {
    if (!locked.has(role)) {
      nextHex[role] = randomRoleColor(role, context(role), random);
    }
  }

  // Foundations in layer order: superficie builds on fondo, borde on superficie.
  for (const role of ['fondo', 'superficie', 'borde'] as const) {
    if (!locked.has(role)) {
      nextHex[role] = randomRoleColor(role, context(role), random);
    }
  }

  if (!locked.has('texto')) {
    nextHex.texto = randomRoleColor('texto', context('texto'), random);
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
