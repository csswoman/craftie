/**
 * Chooses the hue and chroma strength used to tint structural neutrals
 * (background, surface, text, border) from source colors.
 */

export type NeutralTintCandidate = {
  prominence: number;
  lightness: number;
  chroma: number;
  hue: number;
};

export type NeutralTint = {
  hue: number;
  /**
   * Multiplier applied to the fixed neutral ramp chroma: 1 keeps the calibrated
   * ramp, 0 renders pure gray for achromatic sources.
   */
  chromaScale: number;
  achromatic: boolean;
};

/** Below this OKLCH chroma a color carries no reliable hue. */
export const ACHROMATIC_CHROMA_MAX = 0.01;
/** Above this chroma a color is expressive, not a tinted neutral. */
const TINTED_NEUTRAL_CHROMA_MAX = 0.055;
/** Tinted neutrals only drive the ramp when they look like a background or ink. */
const TINTED_NEUTRAL_LIGHT_L_MIN = 0.8;
const TINTED_NEUTRAL_DARK_L_MAX = 0.3;
/** Share of the strongest source a tinted neutral needs to drive the ramp. */
const TINTED_NEUTRAL_MIN_SHARE = 0.3;
/**
 * Mean resultant length of the weighted hue vectors. Below this, source hues
 * point in opposing directions and their average is a hue nobody picked.
 */
const HUE_CONCENTRATION_MIN = 0.4;

function pickTintedNeutral(candidates: NeutralTintCandidate[]): NeutralTintCandidate | null {
  const strongest = Math.max(0, ...candidates.map((candidate) => candidate.prominence));
  const tinted = candidates
    .filter((candidate) =>
      candidate.chroma > ACHROMATIC_CHROMA_MAX &&
      candidate.chroma < TINTED_NEUTRAL_CHROMA_MAX &&
      (candidate.lightness >= TINTED_NEUTRAL_LIGHT_L_MIN ||
        candidate.lightness <= TINTED_NEUTRAL_DARK_L_MAX) &&
      candidate.prominence >= strongest * TINTED_NEUTRAL_MIN_SHARE,
    )
    .sort((left, right) => right.prominence - left.prominence);

  return tinted[0] ?? null;
}

function chromaticHue(chromatic: NeutralTintCandidate[]): number {
  const total = chromatic.reduce((sum, candidate) => sum + candidate.prominence, 0) || 1;
  const vector = chromatic.reduce(
    (sum, candidate) => {
      const radians = (candidate.hue * Math.PI) / 180;
      return {
        x: sum.x + Math.cos(radians) * candidate.prominence,
        y: sum.y + Math.sin(radians) * candidate.prominence,
      };
    },
    { x: 0, y: 0 },
  );
  const concentration = Math.hypot(vector.x, vector.y) / total;

  if (concentration >= HUE_CONCENTRATION_MIN) {
    return ((Math.atan2(vector.y, vector.x) * 180) / Math.PI + 360) % 360;
  }

  const dominant = [...chromatic].sort((left, right) => right.prominence - left.prominence)[0];

  return dominant?.hue ?? 0;
}

/**
 * Tint priority:
 * 1. A prominent tinted neutral in the source (cream paper, warm charcoal) keeps
 *    its own hue. Ramp chroma stays fixed because ramp lightness is calibrated
 *    for AA at that chroma.
 * 2. Chromatic sources that agree on a hue family use their weighted mean hue.
 * 3. Chromatic sources with opposing hues use the dominant source hue instead of
 *    an in-between hue.
 * 4. Achromatic sources stay pure gray.
 */
export function resolveNeutralTint(candidates: NeutralTintCandidate[]): NeutralTint {
  const tintedNeutral = pickTintedNeutral(candidates);

  if (tintedNeutral) {
    return { hue: tintedNeutral.hue, chromaScale: 1, achromatic: false };
  }

  const chromatic = candidates.filter((candidate) => candidate.chroma > ACHROMATIC_CHROMA_MAX);

  if (chromatic.length === 0) {
    return { hue: 0, chromaScale: 0, achromatic: true };
  }

  return { hue: chromaticHue(chromatic), chromaScale: 1, achromatic: false };
}
