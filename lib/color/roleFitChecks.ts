import { NEUTRAL_CHROMA_MAX } from './colorGroupClassification';
import { contrastRatio } from './contrast';
import { normalizeHex } from './normalizeHex';
import { toOklch } from './oklchMath';
import { borderRoleFitness, surfaceRoleFitness, type FitnessColor } from './roleFitness';

const TEXT_AA_RATIO = 4.5;

function toFitnessColor(hex: string): FitnessColor {
  const normalized = normalizeHex(hex);
  const oklch = toOklch(normalized);
  const chroma = oklch?.c ?? 0;

  return {
    hex: normalized,
    prominence: 1,
    lightness: oklch?.l ?? 0,
    chroma,
    hue: oklch?.h ?? 0,
    isNeutral: chroma <= NEUTRAL_CHROMA_MAX,
  };
}

/** Whether a hex still works as card surface against the given fondo. */
export function fitsSurfaceOn(hex: string, fondoHex: string): boolean {
  return surfaceRoleFitness(toFitnessColor(hex), fondoHex) > 0;
}

/** Whether a hex still works as a subtle border against the given superficie. */
export function fitsBorderOn(hex: string, superficieHex: string): boolean {
  return borderRoleFitness(toFitnessColor(hex), superficieHex) > 0;
}

/** Whether a hex passes AA as body text over both fondo and superficie. */
export function passesTextOn(hex: string, fondoHex: string, superficieHex: string): boolean {
  return (
    contrastRatio(hex, fondoHex) >= TEXT_AA_RATIO &&
    contrastRatio(hex, superficieHex) >= TEXT_AA_RATIO
  );
}
