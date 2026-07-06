import { contrastRatio } from './contrast';
import { NEUTRAL_CHROMA_MAX } from './colorGroupClassification';

export type FitnessColor = {
  hex: string;
  prominence: number;
  lightness: number;
  chroma: number;
  hue: number;
  isNeutral: boolean;
};

export type ChromaticRoleId = 'primario' | 'secundario' | 'acento';

const ACCENT_CHROMA_MIN = 0.055;
const ACCENT_LIGHTNESS_MIN = 0.32;
const ACCENT_LIGHTNESS_MAX = 0.92;
const BORDER_CHROMA_MAX = 0.07;
const BORDER_CONTRAST_MIN = 1.04;
const BORDER_CONTRAST_MAX = 2.1;
const BORDER_CONTRAST_IDEAL = 1.28;
const BRAND_LIGHTNESS_IDEAL = 0.56;
const BRAND_LIGHTNESS_SPREAD = 0.38;
const BRAND_CHROMA_CAP = 0.16;

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** Grayness penalty: 1 for achromatic, near 0 for vivid hues. */
export function grayness(candidate: Pick<FitnessColor, 'chroma' | 'isNeutral'>): number {
  if (candidate.isNeutral) {
    return 1;
  }

  return Math.max(0, 1 - candidate.chroma / 0.09);
}

/**
 * Vivacity score for brand seeds: vivid chroma + mid lightness − grayness.
 * Coverage / prominence is intentionally excluded.
 */
export function brandScore(candidate: FitnessColor): number {
  const chromaComponent = Math.min(candidate.chroma / BRAND_CHROMA_CAP, 1);
  const lightnessComponent = Math.max(
    0,
    1 - Math.abs(candidate.lightness - BRAND_LIGHTNESS_IDEAL) / BRAND_LIGHTNESS_SPREAD,
  );
  const grayPenalty = grayness(candidate);

  return chromaComponent * 0.55 + lightnessComponent * 0.35 - grayPenalty * 0.45;
}

export function chromaticRoleFitness(
  candidate: FitnessColor,
  role: ChromaticRoleId,
): number {
  if (candidate.isNeutral || candidate.chroma < ACCENT_CHROMA_MIN) {
    return -1;
  }

  if (candidate.lightness < ACCENT_LIGHTNESS_MIN || candidate.lightness > ACCENT_LIGHTNESS_MAX) {
    return -1;
  }

  const score = brandScore(candidate);
  const lightnessCenter = role === 'primario' ? BRAND_LIGHTNESS_IDEAL : 0.52;
  const roleLightnessFit = 1 - Math.abs(candidate.lightness - lightnessCenter) / BRAND_LIGHTNESS_SPREAD;

  return score + Math.max(0, roleLightnessFit) * 0.08;
}

export function borderRoleFitness(candidate: FitnessColor, superficieHex: string): number {
  if (candidate.chroma > BORDER_CHROMA_MAX) {
    return -1;
  }

  const ratio = contrastRatio(candidate.hex, superficieHex);

  if (ratio < BORDER_CONTRAST_MIN || ratio > BORDER_CONTRAST_MAX) {
    return -1;
  }

  const contrastScore = 1 - Math.abs(ratio - BORDER_CONTRAST_IDEAL) / BORDER_CONTRAST_IDEAL;

  return contrastScore + (candidate.isNeutral ? 0.25 : 0.1);
}

export function pickBestChromaticRole(
  pool: FitnessColor[],
  used: Set<string>,
  anchors: FitnessColor[],
  role: ChromaticRoleId,
): FitnessColor | null {
  let best: FitnessColor | null = null;
  let bestScore = -Infinity;

  for (const candidate of pool) {
    if (used.has(candidate.hex)) {
      continue;
    }

    const fitness = chromaticRoleFitness(candidate, role);

    if (fitness < 0) {
      continue;
    }

    const hueScore =
      anchors.length === 0
        ? 0.5
        : anchors.reduce(
            (min, anchor) => Math.min(min, hueDistance(candidate.hue, anchor.hue)),
            360,
          ) / 180;

    const hueWeight = role === 'primario' ? 0.12 : 0.55;
    const total = fitness + hueScore * hueWeight;

    if (total > bestScore) {
      bestScore = total;
      best = candidate;
    }
  }

  return best;
}

export function pickBestBorderRole(
  pool: FitnessColor[],
  used: Set<string>,
  superficieHex: string,
): FitnessColor | null {
  let best: FitnessColor | null = null;
  let bestScore = -Infinity;

  for (const candidate of pool) {
    if (used.has(candidate.hex)) {
      continue;
    }

    const fitness = borderRoleFitness(candidate, superficieHex);

    if (fitness > bestScore) {
      bestScore = fitness;
      best = candidate;
    }
  }

  return bestScore > 0 ? best : null;
}

export function isUsableChromatic(candidate: FitnessColor): boolean {
  return chromaticRoleFitness(candidate, 'secundario') >= 0;
}

export { NEUTRAL_CHROMA_MAX };
