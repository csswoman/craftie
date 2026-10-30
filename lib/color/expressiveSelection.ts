import type { ExtractedColor } from './imageTypes';
import { normalizeHex } from './normalizeHex';
import { toOklch } from './oklchMath';
import { brandScore, type FitnessColor } from './roleFitness';

/**
 * Source color ready for expressive role selection. `rank` is set when the
 * user chose the order explicitly (typed HEX colors, curated seeds); ranked
 * sources keep that order instead of image scoring.
 */
export type ExpressiveSourceColor = FitnessColor & { rank?: number };

export type ExpressiveSelection = {
  primary: ExpressiveSourceColor | null;
  secondary: ExpressiveSourceColor | null;
  accent: ExpressiveSourceColor | null;
};

/** Below this OKLCH chroma a source only tints neutrals. */
export const EXPRESSIVE_SOURCE_CHROMA_MIN = 0.03;
/**
 * Primary and secondary need this share of the largest chromatic source.
 * Measured against chromatic sources, not the whole image, so a large gray or
 * white backdrop does not disqualify every real color.
 */
const MAIN_ROLE_AREA_SHARE_MIN = 0.12;
/** Accents are small by nature but must not be noise. */
const ACCENT_AREA_SHARE_MIN = 0.03;
const SECONDARY_MIN_HUE_DISTANCE = 24;
const SECONDARY_TONAL_LIGHTNESS_DISTANCE = 0.15;
const ACCENT_MIN_HUE_DISTANCE = 36;
/** Weight of image coverage against vividness when ranking image sources. */
const AREA_WEIGHT = 0.5;
const ACCENT_HUE_CONTRAST_WEIGHT = 0.3;
const ACCENT_LIGHTNESS_MAX = 0.88;
/** Candidates at or below this chroma count as neutral for fitness scoring. */
const NEUTRAL_CANDIDATE_CHROMA_MAX = 0.055;

export function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function minHueDistance(candidate: FitnessColor, others: FitnessColor[]): number {
  return others.reduce((min, other) => Math.min(min, hueDistance(candidate.hue, other.hue)), 180);
}

function argmax<T>(items: T[], score: (item: T) => number): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;

  for (const item of items) {
    const value = score(item);

    if (value > bestScore) {
      best = item;
      bestScore = value;
    }
  }

  return best;
}

function mainCandidates<T extends FitnessColor>(pool: T[]): T[] {
  // Muted sources only qualify when nothing vivid does, so an olive shadow
  // cannot outrank the purple petals next to it.
  const vivid = pool.filter((candidate) => !candidate.isNeutral);
  const eligible = vivid.length > 0 ? vivid : pool;
  const largest = Math.max(0, ...eligible.map((candidate) => candidate.prominence));

  return eligible.filter((candidate) => candidate.prominence >= largest * MAIN_ROLE_AREA_SHARE_MIN);
}

function selectRanked(pool: ExpressiveSourceColor[]): ExpressiveSelection {
  // Only ranked colors take roles: an empty ranked slot stays a gap instead of
  // silently promoting an unranked color.
  const ordered = pool
    .filter((candidate) => candidate.rank !== undefined)
    .sort((left, right) => left.rank! - right.rank! || right.prominence - left.prominence);

  return {
    primary: ordered[0] ?? null,
    secondary: ordered[1] ?? null,
    accent: ordered[2] ?? null,
  };
}

function selectFromImage(
  pool: ExpressiveSourceColor[],
  candidates: FitnessColor[],
  theme: 'light' | 'dark',
  variant: number,
): ExpressiveSelection {
  const imageMax = Math.max(0, ...candidates.map((candidate) => candidate.prominence));
  const poolMax = Math.max(0, ...pool.map((candidate) => candidate.prominence)) || 1;
  const score = (candidate: FitnessColor) =>
    brandScore(candidate) + AREA_WEIGHT * (candidate.prominence / poolMax);
  const main = mainCandidates(pool);
  const primaryOptions = [...main].sort((left, right) => score(right) - score(left));
  const primary = primaryOptions.length > 0
    ? primaryOptions[variant % primaryOptions.length]!
    : null;

  if (!primary) {
    return { primary: null, secondary: null, accent: null };
  }

  const rest = main.filter((candidate) => candidate !== primary);
  const secondary =
    argmax(
      rest.filter((candidate) => hueDistance(candidate.hue, primary.hue) >= SECONDARY_MIN_HUE_DISTANCE),
      score,
    ) ??
    argmax(
      rest.filter(
        (candidate) =>
          Math.abs(candidate.lightness - primary.lightness) >= SECONDARY_TONAL_LIGHTNESS_DISTANCE,
      ),
      score,
    );
  const used = secondary ? [primary, secondary] : [primary];
  const accentLightnessMin = theme === 'dark' ? 0.28 : 0.35;
  const accent = argmax(
    pool.filter(
      (candidate) =>
        !used.includes(candidate) &&
        candidate.prominence >= imageMax * ACCENT_AREA_SHARE_MIN &&
        candidate.lightness >= accentLightnessMin &&
        candidate.lightness <= ACCENT_LIGHTNESS_MAX &&
        minHueDistance(candidate, used) >= ACCENT_MIN_HUE_DISTANCE,
    ),
    (candidate) =>
      brandScore(candidate) + ACCENT_HUE_CONTRAST_WEIGHT * (minHueDistance(candidate, used) / 180),
  );

  return { primary, secondary, accent };
}

/**
 * Picks primary, secondary and accent from source colors.
 *
 * - Ranked sources (user order) map in order: 1st primary, 2nd secondary,
 *   3rd accent.
 * - Image sources balance vividness with coverage so a small saturated detail
 *   does not outrank the image's main color, and keep secondary/accent on
 *   distinct hues so the roles do not collapse into one color family.
 *
 * `variant` (image sources only) promotes the n-th best primary option, so
 * regenerating explores a different role combination of the same image.
 *
 * Missing roles stay null; callers decide how to expose the gap.
 */
export function selectExpressiveRoles(
  candidates: ExpressiveSourceColor[],
  theme: 'light' | 'dark' = 'light',
  variant = 0,
): ExpressiveSelection {
  const pool = candidates.filter((candidate) => candidate.chroma >= EXPRESSIVE_SOURCE_CHROMA_MIN);

  if (pool.some((candidate) => candidate.rank !== undefined)) {
    return selectRanked(pool);
  }

  return selectFromImage(pool, candidates, theme, Math.max(0, Math.floor(variant)));
}

/** Number of distinct primary options `variant` cycles through. */
export function countPrimaryOptions(candidates: ExpressiveSourceColor[]): number {
  return mainCandidates(
    candidates.filter((candidate) => candidate.chroma >= EXPRESSIVE_SOURCE_CHROMA_MIN),
  ).length;
}

/** Converts a source color to the OKLCH candidate shape used for selection. */
export function toExpressiveSource(color: ExtractedColor): ExpressiveSourceColor {
  const hex = normalizeHex(color.hex);
  const oklch = toOklch(hex);
  const chroma = oklch?.c ?? 0;

  return {
    hex,
    prominence: color.prominence,
    lightness: oklch?.l ?? 0,
    chroma,
    hue: oklch?.h ?? 0,
    isNeutral: chroma <= NEUTRAL_CANDIDATE_CHROMA_MAX,
    ...(color.rank === undefined ? {} : { rank: color.rank }),
  };
}
