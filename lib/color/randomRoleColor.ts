import {
  adjustLightnessForContrast,
  contrastRatio,
  hexToOklchChannels,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
} from '../utils/colorMath';
import { normalizeHex } from './normalizeHex';
import type { ThemeId } from './themePalette';
import type { PaletteRoleId } from './roleTypes';

const AA_RATIO = 4.5;

export type RandomRoleColorContext = {
  fondoHex?: string;
  superficieHex?: string;
  textoHex?: string;
  /** Active theme band for sampling. Defaults to light. */
  theme?: ThemeId;
  /** OKLCH hue to use instead of a random one (harmony-driven palettes). */
  hue?: number;
};

type RoleRange = {
  lMin: number;
  lMax: number;
  cMin: number;
  cMax: number;
};

const ROLE_RANGES: Record<ThemeId, Record<PaletteRoleId, RoleRange>> = {
  light: {
    fondo: { lMin: 0.965, lMax: 0.99, cMin: 0, cMax: 0.012 },
    superficie: { lMin: 0.93, lMax: 0.96, cMin: 0, cMax: 0.016 },
    texto: { lMin: 0.18, lMax: 0.3, cMin: 0, cMax: 0.025 },
    'texto-secundario': { lMin: 0.45, lMax: 0.45, cMin: 0, cMax: 0.03 },
    primario: { lMin: 0.42, lMax: 0.68, cMin: 0.08, cMax: 0.2 },
    secundario: { lMin: 0.4, lMax: 0.7, cMin: 0.06, cMax: 0.18 },
    acento: { lMin: 0.45, lMax: 0.72, cMin: 0.1, cMax: 0.22 },
    borde: { lMin: 0.84, lMax: 0.89, cMin: 0, cMax: 0.02 },
  },
  dark: {
    fondo: { lMin: 0.15, lMax: 0.2, cMin: 0, cMax: 0.02 },
    superficie: { lMin: 0.18, lMax: 0.24, cMin: 0, cMax: 0.024 },
    texto: { lMin: 0.9, lMax: 0.96, cMin: 0, cMax: 0.02 },
    'texto-secundario': { lMin: 0.72, lMax: 0.72, cMin: 0, cMax: 0.03 },
    primario: { lMin: 0.58, lMax: 0.78, cMin: 0.08, cMax: 0.2 },
    secundario: { lMin: 0.56, lMax: 0.8, cMin: 0.06, cMax: 0.18 },
    acento: { lMin: 0.58, lMax: 0.82, cMin: 0.1, cMax: 0.22 },
    borde: { lMin: 0.3, lMax: 0.37, cMin: 0, cMax: 0.025 },
  },
};

/**
 * Foundations are layers of one neutral: superficie sits a small lightness
 * step from fondo and borde a larger step from superficie, both on fondo's
 * hue with at most a trace more chroma. Sampling them independently gave
 * tinted cards on gray pages and borders as dark as mid-gray.
 */
const LAYER_STEPS: Record<ThemeId, { superficie: [number, number]; borde: [number, number] }> = {
  // Light: cards a touch darker than the page, borders clearly but softly darker.
  light: { superficie: [-0.045, -0.025], borde: [-0.11, -0.075] },
  dark: { superficie: [0.035, 0.06], borde: [0.11, 0.16] },
};
const LAYER_EXTRA_CHROMA = 0.006;
const LAYER_CHROMA_MAX = 0.025;

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

function sampleInRange(
  range: RoleRange,
  random: () => number,
  hue?: number,
): { l: number; c: number; h: number } {
  const l = lerp(range.lMin, range.lMax, random());
  const h = hue === undefined ? random() * 360 : ((hue % 360) + 360) % 360;
  const chromaCap = Math.max(0, maxOklchChromaForSrgb(l, h));
  const cMax = Math.min(range.cMax, chromaCap);
  const cMin = Math.min(range.cMin, cMax);
  const c = lerp(cMin, cMax, random());
  return { l, c, h };
}

function layeredNeutral(
  baseHex: string,
  step: [number, number],
  random: () => number,
): string | null {
  const base = hexToOklchChannels(baseHex);

  if (!Number.isFinite(base.l)) {
    return null;
  }

  const lightness = Math.min(0.995, Math.max(0.05, base.l + lerp(step[0], step[1], random())));
  const chroma = Math.min(LAYER_CHROMA_MAX, base.c + LAYER_EXTRA_CHROMA * random());

  return oklchChannelsToHex(lightness, chroma, base.h || 0);
}

function sampleRole(
  role: PaletteRoleId,
  context: RandomRoleColorContext,
  random: () => number,
): string {
  const theme = context.theme ?? 'light';
  const layered =
    role === 'superficie' && context.fondoHex
      ? layeredNeutral(context.fondoHex, LAYER_STEPS[theme].superficie, random)
      : role === 'borde' && context.superficieHex
        ? layeredNeutral(context.superficieHex, LAYER_STEPS[theme].borde, random)
        : null;

  if (layered) {
    return layered;
  }

  const sample = sampleInRange(ROLE_RANGES[theme][role], random, context.hue);
  return oklchChannelsToHex(sample.l, sample.c, sample.h);
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
 * Builds a random OKLCH color suited to a palette role and theme band.
 * superficie and borde are layered on the given fondo / superficie when
 * known. When contrast context is provided, texto / fondo / superficie are
 * nudged to AA with the paired roles.
 */
export function randomRoleColor(
  role: PaletteRoleId,
  context: RandomRoleColorContext = {},
  random: () => number = Math.random,
): string {
  let hex = normalizeHex(sampleRole(role, context, random));

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
