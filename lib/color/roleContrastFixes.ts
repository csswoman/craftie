import { contrastRatio, hexToOklchChannels, oklchChannelsToHex } from '../utils/colorMath';
import { buildPreviewTokens, getRawPreviewPaintPairs } from './previewTokens';
import {
  getChromaticReadableTextChecks,
  getRolePaletteContrastChecks,
  previewPairRole,
} from './rolePaletteContrast';
import { PALETTE_ROLE_ORDER, type PaletteRoleId, type RolePalette } from './roleTypes';

export type RoleContrastFix = {
  role: PaletteRoleId;
  roleName: string;
  fromHex: string;
  toHex: string;
};

const LIGHTNESS_STEP = 0.005;
const AA_TARGET = 4.5;

/** Roles whose own hex is responsible for at least one pair below AA. */
export function getFailingContrastRoles(palette: RolePalette): Set<PaletteRoleId> {
  const roles = new Set<PaletteRoleId>();

  for (const check of getRolePaletteContrastChecks(palette)) {
    if (check.status === 'fail') roles.add('texto');
  }

  for (const check of getChromaticReadableTextChecks(palette)) {
    if (check.status === 'fail') roles.add(check.role);
  }

  for (const entry of buildPreviewTokens(palette).contrast) {
    if (entry.passesAa) continue;
    const role = previewPairRole(entry.id);
    if (role) roles.add(role);
  }

  return roles;
}

/** Whether every rendered pair driven by `role` reaches AA without readableOn correction. */
function roleRawPairsPass(palette: RolePalette, role: PaletteRoleId): boolean {
  return getRawPreviewPaintPairs(palette).every(
    (pair) =>
      previewPairRole(pair.id) !== role ||
      contrastRatio(pair.foreground, pair.background) >= AA_TARGET,
  );
}

function withRoleHex(palette: RolePalette, role: PaletteRoleId, hex: string): RolePalette {
  return { ...palette, [role]: { ...palette[role], hex } };
}

/**
 * Finds the closest OKLCH lightness for `role` (hue and chroma kept, gamut-clamped)
 * that clears every AA failure attributed to that role without breaking other roles.
 */
export function suggestRoleLightnessFix(
  palette: RolePalette,
  role: PaletteRoleId,
): string | null {
  const original = palette[role].hex;
  const { l, c, h } = hexToOklchChannels(original);
  const otherFailures = getFailingContrastRoles(palette);
  otherFailures.delete(role);

  const isAcceptable = (hex: string): boolean => {
    const candidate = withRoleHex(palette, role, hex);
    const failing = getFailingContrastRoles(candidate);
    if (failing.has(role) || !roleRawPairsPass(candidate, role)) return false;
    for (const other of failing) {
      if (!otherFailures.has(other)) return false;
    }
    return true;
  };

  for (let delta = LIGHTNESS_STEP; delta <= 1; delta += LIGHTNESS_STEP) {
    for (const candidateL of [l - delta, l + delta]) {
      if (candidateL < 0 || candidateL > 1) continue;
      const hex = oklchChannelsToHex(candidateL, c, h);
      if (hex !== original && isAcceptable(hex)) return hex;
    }
  }

  return null;
}

/** One lightness fix per failing role, in palette role order. */
export function suggestRoleContrastFixes(palette: RolePalette): RoleContrastFix[] {
  const failing = getFailingContrastRoles(palette);

  return PALETTE_ROLE_ORDER.flatMap((role) => {
    if (!failing.has(role)) return [];
    const toHex = suggestRoleLightnessFix(palette, role);
    if (!toHex) return [];
    return [{ role, roleName: palette[role].name, fromHex: palette[role].hex, toHex }];
  });
}
