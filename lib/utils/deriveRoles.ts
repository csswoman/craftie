import { clampChroma, converter, formatHex } from 'culori';

import { normalizeHex } from '../color/normalizeHex';
import { bestTextOn, mixColors, relativeLuminance } from './colorMath';
import {
  deriveSeparatedHueSurface,
  SURFACE_TINT_MAX,
} from './surfaceFillSeparation';

export type Polarity = 'light' | 'dark';
export type ThemePolarity = Polarity;

const NAVBAR_TINT_AMOUNT = 0.035;
const BORDER_PRIMARIO_MIX = 0.03;
const BORDER_TEXTO_MIX = 0.12;
const SECONDARY_HUE_OFFSET = 120;
const LIGHT_FONDO_L = 0.98;
const DARK_FONDO_L = 0.15;
const FONDO_CHROMA = 0.012;
const MIN_BRAND_CHROMA = 0.014;
const LIGHT_ELEVATION_L_DELTA = 0.01;
const MAX_LIGHT_SURFACE_L = 0.992;
const DARK_ELEVATION_OVERLAY = 0.06;

const toOklch = converter('oklch');

const NEAR_WHITE = '#FFFFFF';
const NEAR_BLACK = '#000000';

function parseOklch(hex: string) {
  return toOklch(normalizeHex(hex));
}

function oklchToHex(lightness: number, chroma: number, hue: number | undefined): string {
  const clamped = clampChroma(
    { mode: 'oklch', l: lightness, c: chroma, h: hue },
    'oklch',
  );

  return normalizeHex(formatHex(clamped) ?? '#000000');
}

function deriveBrandTint(
  fondoHex: string,
  primarioHex: string,
  amount: number,
  theme: ThemePolarity,
): string {
  if (theme === 'light') {
    const elevated = deriveElevation(fondoHex, theme);

    return brandTintOklch(elevated, primarioHex, amount);
  }

  const tinted = brandTintOklch(fondoHex, primarioHex, amount);

  return deriveElevation(tinted, theme);
}

function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;

  return diff > 180 ? 360 - diff : diff;
}

/** Near-white or near-black canvas tinted with a reference hue at minimal chroma. */
export function deriveFondo(referenceHue: number, theme: ThemePolarity): string {
  const lightness = theme === 'light' ? LIGHT_FONDO_L : DARK_FONDO_L;

  return oklchToHex(lightness, FONDO_CHROMA, referenceHue);
}

export function polarityOf(hex: string): Polarity {
  return relativeLuminance(hex) >= 0.5 ? 'light' : 'dark';
}

/**
 * Lifts a surface one elevation step: lighter in light themes, subtle white overlay in dark.
 * Hue and chroma stay aligned with the base tone.
 */
export function deriveElevation(baseHex: string, theme: ThemePolarity): string {
  if (theme === 'light') {
    const base = parseOklch(baseHex);
    const lightness = Math.min(
      MAX_LIGHT_SURFACE_L,
      (base?.l ?? LIGHT_FONDO_L) + LIGHT_ELEVATION_L_DELTA,
    );

    return oklchToHex(lightness, base?.c ?? FONDO_CHROMA, base?.h);
  }

  return mixColors(baseHex, NEAR_WHITE, DARK_ELEVATION_OVERLAY);
}

function brandTintOklch(
  baseHex: string,
  primarioHex: string,
  amount: number,
): string {
  const base = parseOklch(baseHex);
  const brand = parseOklch(primarioHex);

  if (!base || !brand) {
    return mixColors(baseHex, primarioHex, amount);
  }

  const chroma = Math.max(
    MIN_BRAND_CHROMA,
    (base.c ?? 0) + (brand.c ?? 0) * amount * 0.35,
    MIN_BRAND_CHROMA + amount * 0.04,
  );
  const lightness = Math.min(MAX_LIGHT_SURFACE_L, base.l ?? 0);

  return oklchToHex(lightness, chroma, brand.h ?? base.h);
}

/** Card / panel surface: subtle fondo↔hue mix, separated from full fill intensity. */
export function deriveSuperficie(
  fondoHex: string,
  primarioHex: string,
  theme: ThemePolarity,
): string {
  return deriveSeparatedHueSurface(fondoHex, primarioHex, theme, {
    maxTint: SURFACE_TINT_MAX,
  });
}

/** Navbar strip: subtler brand tint at canvas level; cards carry elevation. */
export function deriveNavbar(
  fondoHex: string,
  primarioHex: string,
  theme: ThemePolarity,
): string {
  if (theme === 'light') {
    return brandTintOklch(fondoHex, primarioHex, NAVBAR_TINT_AMOUNT);
  }

  const tinted = brandTintOklch(fondoHex, primarioHex, NAVBAR_TINT_AMOUNT);

  return deriveElevation(tinted, theme);
}

/** @deprecated Use deriveSuperficie with primario + theme. */
export function deriveSurface(
  fondoHex: string,
  polarity: Polarity,
  primarioHex?: string,
): string {
  const seed = primarioHex ?? fondoHex;

  return deriveSuperficie(fondoHex, seed, polarity);
}

export function deriveText(fondoHex: string): string {
  return bestTextOn(fondoHex);
}

export function deriveBorder(
  fondoHex: string,
  textoHex: string,
  primarioHex: string,
): string {
  const brandEdge = brandTintOklch(fondoHex, primarioHex, BORDER_PRIMARIO_MIX);

  return mixColors(brandEdge, textoHex, BORDER_TEXTO_MIX);
}

/** Secondary brand tone: same family as primary with a harmonic hue shift. */
export function deriveSecondary(primarioHex: string): string {
  const seed = parseOklch(primarioHex);

  if (!seed || seed.mode !== 'oklch') {
    return primarioHex;
  }

  const hue = ((seed.h ?? 0) + SECONDARY_HUE_OFFSET) % 360;
  const chroma = Math.max(seed.c ?? 0.1, 0.08);
  const lightness = Math.min(Math.max(seed.l ?? 0.55, 0.45), 0.72);

  return oklchToHex(lightness, chroma, hue);
}

export function deriveNeutralRoles(
  fondoHex: string,
  primarioHex: string,
  theme: ThemePolarity = 'light',
): {
  texto: string;
  superficie: string;
  navbar: string;
  borde: string;
} {
  const texto = deriveText(fondoHex);
  const superficie = deriveSuperficie(fondoHex, primarioHex, theme);
  const navbar = deriveNavbar(fondoHex, primarioHex, theme);
  const borde = deriveBorder(fondoHex, texto, primarioHex);

  return { texto, superficie, navbar, borde };
}

export function sharesBrandHue(
  sampleHex: string,
  primarioHex: string,
  toleranceDegrees = 12,
): boolean {
  const sample = parseOklch(sampleHex);
  const primario = parseOklch(primarioHex);

  if (!sample || !primario) {
    return false;
  }

  if ((sample.c ?? 0) < 0.004) {
    return false;
  }

  return hueDistance(sample.h ?? 0, primario.h ?? 0) <= toleranceDegrees;
}
