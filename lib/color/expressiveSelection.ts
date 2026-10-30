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
/** Primary and secondary must cover a visible part of the image. */
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

function selectRanked(pool: ExpressiveSourceColor[]): ExpressiveSelection {
  const ordered = [...pool].sort((left, right) => {
    const leftRank = left.rank ?? Number.POSITIVE_INFINITY;
    const rightRank = right.rank ?? Number.POSITIVE_INFINITY;

    return leftRank - rightRank || right.prominence - left.prominence;
  });

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
): ExpressiveSelection {
  const imageMax = Math.max(0, ...candidates.map((candidate) => candidate.prominence));
  const poolMax = Math.max(0, ...pool.map((candidate) => candidate.prominence)) || 1;
  const score = (candidate: FitnessColor) =>
    brandScore(candidate) + AREA_WEIGHT * (candidate.prominence / poolMax);
  const main = pool.filter((candidate) => candidate.prominence >= imageMax * MAIN_ROLE_AREA_SHARE_MIN);
  const primary = argmax(main, score);

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
 * Missing roles stay null; callers decide how to expose the gap.
 */
export function selectExpressiveRoles(
  candidates: ExpressiveSourceColor[],
  theme: 'light' | 'dark' = 'light',
): ExpressiveSelection {
  const pool = candidates.filter((candidate) => candidate.chroma >= EXPRESSIVE_SOURCE_CHROMA_MIN);

  if (pool.some((candidate) => candidate.rank !== undefined)) {
    return selectRanked(pool);
  }

  return selectFromImage(pool, candidates, theme);
}
