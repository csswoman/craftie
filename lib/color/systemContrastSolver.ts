import { contrastRatio, hexToOklchChannels, oklchChannelsToHex } from '../utils/colorMath';
import { getRawPreviewPaintPairs } from './previewTokens';
import {
  getFailingContrastRoles,
  suggestRoleLightnessFix,
  type RoleContrastFix,
} from './roleContrastFixes';
import { previewPairRole } from './rolePaletteContrast';
import { PALETTE_ROLE_ORDER, type PaletteRoleId, type RolePalette } from './roleTypes';

/**
 * Whole-system contrast repair. A single-role fix can be blocked or overshoot
 * because roles share pairs (text sits on background and surface, buttons
 * reuse the primary, links reuse the accent). This solver treats the palette
 * as one problem:
 *
 * 1. Greedy: while unlocked roles fail AA, apply the single-role lightness fix
 *    with the smallest perceptual change (ΔE in OKLab), then re-evaluate, so a
 *    fix that was blocked earlier can become possible.
 * 2. Relaxation: move every changed role back toward its original lightness
 *    (bisection) as far as the whole system keeps passing, so each change
 *    ends up as small as the final palette allows.
 *
 * Hue and chroma are preserved (gamut-clamped) and locked roles never move.
 */

export type SystemContrastChange = RoleContrastFix & {
  /** Perceptual distance between `fromHex` and `toHex` (Euclidean OKLab, 0-1 scale). */
  deltaE: number;
};

export type SystemContrastSolution = {
  palette: RolePalette;
  /** Final change per role, in palette role order. Empty when nothing could improve. */
  changes: SystemContrastChange[];
  /** Roles that still fail AA after solving (locked or with no lightness fix). */
  unresolved: PaletteRoleId[];
  totalDeltaE: number;
};

export type SolveSystemContrastOptions = {
  lockedRoles?: readonly PaletteRoleId[];
  /** Safety cap on greedy passes; each pass fixes at least one role. */
  maxPasses?: number;
};

const AA_TARGET = 4.5;
const RELAX_ITERATIONS = 12;

function toOklab(hex: string): [number, number, number] {
  const { l, c, h } = hexToOklchChannels(hex);
  const radians = (h * Math.PI) / 180;
  return [l, c * Math.cos(radians), c * Math.sin(radians)];
}

/** Euclidean distance in OKLab (ΔEOK). 0.02 is roughly a just-noticeable difference. */
export function deltaEOK(hexA: string, hexB: string): number {
  const [l1, a1, b1] = toOklab(hexA);
  const [l2, a2, b2] = toOklab(hexB);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function withRoleHex(palette: RolePalette, role: PaletteRoleId, hex: string): RolePalette {
  return { ...palette, [role]: { ...palette[role], hex } };
}

function rawPairsPass(palette: RolePalette, role: PaletteRoleId): boolean {
  return getRawPreviewPaintPairs(palette).every(
    (pair) =>
      previewPairRole(pair.id) !== role ||
      contrastRatio(pair.foreground, pair.background) >= AA_TARGET,
  );
}

function isSubset(a: Set<PaletteRoleId>, b: Set<PaletteRoleId>): boolean {
  for (const role of a) if (!b.has(role)) return false;
  return true;
}

function greedyPass(
  palette: RolePalette,
  locked: Set<PaletteRoleId>,
  maxPasses: number,
): RolePalette {
  let current = palette;

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const failing = [...getFailingContrastRoles(current)].filter((role) => !locked.has(role));
    let best: { role: PaletteRoleId; hex: string; cost: number } | null = null;

    for (const role of failing) {
      const hex = suggestRoleLightnessFix(current, role);
      if (!hex) continue;
      const cost = deltaEOK(current[role].hex, hex);
      if (!best || cost < best.cost) best = { role, hex, cost };
    }

    if (!best) break;
    current = withRoleHex(current, best.role, best.hex);
  }

  return current;
}

/** Pulls `role` back toward `originalHex` while the system stays as good as `solved`. */
function relaxRole(
  solved: RolePalette,
  role: PaletteRoleId,
  originalHex: string,
): RolePalette {
  const allowedFailures = getFailingContrastRoles(solved);
  const roleWasFixed = !allowedFailures.has(role);
  const original = hexToOklchChannels(originalHex);
  const target = hexToOklchChannels(solved[role].hex);

  const acceptable = (candidate: RolePalette): boolean =>
    isSubset(getFailingContrastRoles(candidate), allowedFailures) &&
    (!roleWasFixed || rawPairsPass(candidate, role));

  // t = 0 is the original lightness, t = 1 the solved one (known acceptable).
  let low = 0;
  let high = 1;
  let bestHex = solved[role].hex;

  for (let i = 0; i < RELAX_ITERATIONS; i += 1) {
    const mid = (low + high) / 2;
    const l = original.l + (target.l - original.l) * mid;
    const hex = oklchChannelsToHex(l, original.c, original.h);
    if (acceptable(withRoleHex(solved, role, hex))) {
      high = mid;
      bestHex = hex;
    } else {
      low = mid;
    }
  }

  return withRoleHex(solved, role, bestHex);
}

/** Repairs every AA failure it can across the palette with the smallest total change. */
export function solveSystemContrast(
  palette: RolePalette,
  { lockedRoles = [], maxPasses = PALETTE_ROLE_ORDER.length * 2 }: SolveSystemContrastOptions = {},
): SystemContrastSolution {
  const locked = new Set(lockedRoles);
  let solved = greedyPass(palette, locked, maxPasses);

  for (const role of PALETTE_ROLE_ORDER) {
    if (solved[role].hex !== palette[role].hex) {
      solved = relaxRole(solved, role, palette[role].hex);
    }
  }

  const changes: SystemContrastChange[] = PALETTE_ROLE_ORDER.flatMap((role) => {
    const fromHex = palette[role].hex;
    const toHex = solved[role].hex;
    if (fromHex === toHex) return [];
    return [{ role, roleName: palette[role].name, fromHex, toHex, deltaE: deltaEOK(fromHex, toHex) }];
  });

  const stillFailing = getFailingContrastRoles(solved);

  return {
    palette: solved,
    changes,
    unresolved: PALETTE_ROLE_ORDER.filter((role) => stillFailing.has(role)),
    totalDeltaE: changes.reduce((sum, change) => sum + change.deltaE, 0),
  };
}
