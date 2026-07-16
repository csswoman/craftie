import {
  adjustLightnessForContrast,
  contrastRatio,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
} from '../utils/colorMath';
import { normalizeHex } from './normalizeHex';
import type { PaletteRoleId } from './roleTypes';

const AA_RATIO = 4.5;

export type RandomRoleColorContext = {
  fondoHex?: string;
  superficieHex?: string;
  textoHex?: string;
};

type RoleRange = {
  lMin: number;
  lMax: number;
  cMin: number;
  cMax: number;
};

const ROLE_RANGES: Record<PaletteRoleId, RoleRange> = {
  fondo: { lMin: 0.92, lMax: 0.98, cMin: 0, cMax: 0.03 },
  superficie: { lMin: 0.88, lMax: 0.96, cMin: 0, cMax: 0.04 },
  texto: { lMin: 0.18, lMax: 0.42, cMin: 0, cMax: 0.05 },
  primario: { lMin: 0.42, lMax: 0.68, cMin: 0.08, cMax: 0.2 },
  secundario: { lMin: 0.4, lMax: 0.7, cMin: 0.06, cMax: 0.18 },
  acento: { lMin: 0.45, lMax: 0.72, cMin: 0.1, cMax: 0.22 },
  borde: { lMin: 0.55, lMax: 0.78, cMin: 0, cMax: 0.04 },
};

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

function sampleInRange(range: RoleRange, random: () => number): { l: number; c: number; h: number } {
  const l = lerp(range.lMin, range.lMax, random());
  const h = random() * 360;
  const chromaCap = Math.max(0, maxOklchChromaForSrgb(l, h));
  const cMax = Math.min(range.cMax, chromaCap);
  const cMin = Math.min(range.cMin, cMax);
  const c = lerp(cMin, cMax, random());
  return { l, c, h };
}

function ensureTextAa(hex: string, backgrounds: string[]): string {
  let next = hex;

  for (const background of backgrounds) {
    next = adjustLightnessForContrast(next, background, AA_RATIO);
  }

  return next;
}

function ensureBackgroundAa(hex: string, textHex: string): string {
  return adjustLightnessForContrast(hex, textHex, AA_RATIO);
}

/**
 * Builds a random OKLCH color suited to a palette role. When contrast context is
 * provided, texto / fondo / superficie are nudged to AA with the paired roles.
 */
export function randomRoleColor(
  role: PaletteRoleId,
  context: RandomRoleColorContext = {},
  random: () => number = Math.random,
): string {
  const sample = sampleInRange(ROLE_RANGES[role], random);
  let hex = normalizeHex(oklchChannelsToHex(sample.l, sample.c, sample.h));

  if (role === 'texto') {
    const backgrounds = [context.fondoHex, context.superficieHex].filter(
      (value): value is string => Boolean(value),
    );
    if (backgrounds.length > 0) {
      hex = ensureTextAa(hex, backgrounds);
    }
  }

  if ((role === 'fondo' || role === 'superficie') && context.textoHex) {
    hex = ensureBackgroundAa(hex, context.textoHex);
  }

  // Guard: if AA still fails for texto with both surfaces, prefer fondo (primary reading surface).
  if (role === 'texto' && context.fondoHex && contrastRatio(hex, context.fondoHex) < AA_RATIO) {
    hex = adjustLightnessForContrast(hex, context.fondoHex, AA_RATIO);
  }

  return normalizeHex(hex);
}
