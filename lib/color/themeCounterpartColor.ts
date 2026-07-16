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

export type CounterpartContext = {
  fondoHex?: string;
  superficieHex?: string;
  textoHex?: string;
};

/** Target OKLCH lightness anchors per role and theme (hue/chroma come from the source). */
const TARGET_LIGHTNESS: Record<ThemeId, Record<PaletteRoleId, number>> = {
  light: {
    fondo: 0.98,
    superficie: 0.96,
    texto: 0.25,
    primario: 0.52,
    secundario: 0.55,
    acento: 0.58,
    borde: 0.88,
  },
  dark: {
    fondo: 0.15,
    superficie: 0.19,
    texto: 0.92,
    primario: 0.68,
    secundario: 0.7,
    acento: 0.72,
    borde: 0.32,
  },
};

const NEUTRAL_ROLES = new Set<PaletteRoleId>(['fondo', 'superficie', 'texto', 'borde']);

export function oppositeTheme(theme: ThemeId): ThemeId {
  return theme === 'light' ? 'dark' : 'light';
}

/**
 * Builds a same-hue counterpart of `hex` for `targetTheme`. Neutrals keep low chroma;
 * expressive fills keep chroma and shift lightness into the target theme band.
 * When contrast context is provided, texto / fondo / superficie are nudged to AA.
 */
export function counterpartRoleColorForTheme(
  hex: string,
  role: PaletteRoleId,
  targetTheme: ThemeId,
  context: CounterpartContext = {},
): string {
  const source = hexToOklchChannels(normalizeHex(hex));
  const targetL = TARGET_LIGHTNESS[targetTheme][role];
  const chromaCap = Math.max(0, maxOklchChromaForSrgb(targetL, source.h));
  const chroma = NEUTRAL_ROLES.has(role)
    ? Math.min(source.c, chromaCap, targetTheme === 'dark' ? 0.04 : 0.03)
    : Math.min(source.c, chromaCap);

  let next = normalizeHex(oklchChannelsToHex(targetL, chroma, source.h));

  if (role === 'texto') {
    const backgrounds = [context.fondoHex, context.superficieHex].filter(
      (value): value is string => Boolean(value),
    );
    for (const background of backgrounds) {
      next = adjustLightnessForContrast(next, background, AA_RATIO);
    }
    if (context.fondoHex && contrastRatio(next, context.fondoHex) < AA_RATIO) {
      next = adjustLightnessForContrast(next, context.fondoHex, AA_RATIO);
    }
  }

  if ((role === 'fondo' || role === 'superficie') && context.textoHex) {
    next = adjustLightnessForContrast(next, context.textoHex, AA_RATIO);
  }

  return normalizeHex(next);
}
