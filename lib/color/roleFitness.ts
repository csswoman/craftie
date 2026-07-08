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

export const ACCENT_CHROMA_MIN = 0.055;
export const ACCENT_LIGHTNESS_MIN = 0.32;
export const ACCENT_LIGHTNESS_MAX = 0.92;
const BORDER_CHROMA_MAX = 0.07;
export const BORDER_CONTRAST_MIN = 1.04;
export const BORDER_CONTRAST_MAX = 2.1;
const BORDER_CONTRAST_IDEAL = 1.28;
const FONDO_LIGHT_LIGHTNESS_MIN = 0.93;
const FONDO_DARK_LIGHTNESS_MAX = 0.25;
const FONDO_CHROMA_MAX = 0.04;
const SURFACE_CONTRAST_MIN = 1.01;
const SURFACE_CONTRAST_MAX = 1.4;
const SURFACE_CONTRAST_IDEAL = 1.12;
const SURFACE_CHROMA_MAX = 0.06;
const TEXT_AA_RATIO = 4.5;
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

/** Fitness of a source color as canvas background for the given polarity. */
export function fondoRoleFitness(
  candidate: FitnessColor,
  theme: 'light' | 'dark',
): number {
  if (candidate.chroma > FONDO_CHROMA_MAX) {
    return -1;
  }

  if (theme === 'light') {
    if (candidate.lightness < FONDO_LIGHT_LIGHTNESS_MIN) {
      return -1;
    }

    return candidate.lightness - candidate.chroma * 2;
  }

  if (candidate.lightness > FONDO_DARK_LIGHTNESS_MAX) {
    return -1;
  }

  return 1 - candidate.lightness - candidate.chroma * 2;
}

/** Fitness of a source neutral as card surface: close to fondo but distinguishable. */
export function surfaceRoleFitness(candidate: FitnessColor, fondoHex: string): number {
  if (candidate.chroma > SURFACE_CHROMA_MAX) {
    return -1;
  }

  const ratio = contrastRatio(candidate.hex, fondoHex);

  if (ratio < SURFACE_CONTRAST_MIN || ratio > SURFACE_CONTRAST_MAX) {
    return -1;
  }

  const contrastScore = 1 - Math.abs(ratio - SURFACE_CONTRAST_IDEAL) / SURFACE_CONTRAST_IDEAL;

  return contrastScore + (candidate.isNeutral ? 0.25 : 0);
}

/** Fitness of a source color as body text: must pass AA against fondo and superficie. */
export function textRoleFitness(
  candidate: FitnessColor,
  fondoHex: string,
  superficieHex: string,
): number {
  const fondoRatio = contrastRatio(candidate.hex, fondoHex);
  const superficieRatio = contrastRatio(candidate.hex, superficieHex);

  if (fondoRatio < TEXT_AA_RATIO || superficieRatio < TEXT_AA_RATIO) {
    return -1;
  }

  const chromaPenalty = Math.max(0, candidate.chroma - NEUTRAL_CHROMA_MAX) * 4;

  return Math.min(fondoRatio, superficieRatio) / 21 + 0.3 - chromaPenalty;
}

export function pickBestScored(
  pool: FitnessColor[],
  used: Set<string>,
  fitness: (candidate: FitnessColor) => number,
): FitnessColor | null {
  let best: FitnessColor | null = null;
  let bestScore = 0;

  for (const candidate of pool) {
    if (used.has(candidate.hex)) {
      continue;
    }

    const score = fitness(candidate);

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

export { NEUTRAL_CHROMA_MAX };
