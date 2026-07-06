import { converter, formatHex } from 'culori';

import { normalizeHex } from '../color/normalizeHex';
import { mixColors } from './colorMath';
import type { ThemePolarity } from './deriveRoles';

const toOklch = converter('oklch');

export const SURFACE_TINT_MAX = 0.06;
export const SURFACE_TINT_MIN = 0.01;
export const SURFACE_TINT_STEP = 0.005;
export const MIN_SURFACE_FILL_INTENSITY_DELTA = 0.028;

const LIGHT_ELEVATION_L_DELTA = 0.01;
const MAX_LIGHT_SURFACE_L = 0.992;
const DARK_ELEVATION_OVERLAY = 0.06;
const FONDO_CHROMA = 0.012;
const NEAR_WHITE = '#FFFFFF';

function parseOklch(hex: string) {
  return toOklch(normalizeHex(hex));
}

function elevateForSurface(baseHex: string, theme: ThemePolarity): string {
  if (theme === 'light') {
    const base = parseOklch(baseHex);
    const lightness = Math.min(
      MAX_LIGHT_SURFACE_L,
      (base?.l ?? 0.98) + LIGHT_ELEVATION_L_DELTA,
    );
    const hex = formatHex({
      mode: 'oklch',
      l: lightness,
      c: base?.c ?? FONDO_CHROMA,
      h: base?.h,
    });

    return normalizeHex(hex ?? baseHex);
  }

  return mixColors(baseHex, NEAR_WHITE, DARK_ELEVATION_OVERLAY);
}

/** Perceptual gap between a subtle surface tint and a full-strength fill. */
export function intensityDelta(surfaceHex: string, fillHex: string): number {
  const surface = parseOklch(surfaceHex);
  const fill = parseOklch(fillHex);

  if (!surface || !fill) {
    return 0;
  }

  const chromaGap = Math.max(0, (fill.c ?? 0) - (surface.c ?? 0));
  const lightnessGap = Math.abs((fill.l ?? 0) - (surface.l ?? 0));

  return chromaGap + lightnessGap * 0.2;
}

function surfaceAtTint(
  fondoHex: string,
  fillHex: string,
  theme: ThemePolarity,
  tintAmount: number,
): string {
  const tinted = mixColors(fondoHex, fillHex, tintAmount);
  const elevated = elevateForSurface(tinted, theme);

  if (theme !== 'light') {
    return elevated;
  }

  const fondo = parseOklch(fondoHex);
  const surface = parseOklch(elevated);
  const minLightness = Math.min(
    MAX_LIGHT_SURFACE_L,
    (fondo?.l ?? 0.98) + LIGHT_ELEVATION_L_DELTA,
  );

  if ((surface?.l ?? 0) >= minLightness) {
    return elevated;
  }

  const hex = formatHex({
    mode: 'oklch',
    l: minLightness,
    c: surface?.c ?? FONDO_CHROMA,
    h: surface?.h,
  });

  return normalizeHex(hex ?? elevated);
}

/**
 * Surface tint for a hue also used as fill: mix(fondo, hue, ≤maxTint).
 * Reduces tint until intensity delta vs full fill meets the threshold.
 */
export function deriveSeparatedHueSurface(
  fondoHex: string,
  fillHex: string,
  theme: ThemePolarity,
  options?: {
    maxTint?: number;
    minIntensityDelta?: number;
  },
): string {
  const maxTint = options?.maxTint ?? SURFACE_TINT_MAX;
  const minDelta = options?.minIntensityDelta ?? MIN_SURFACE_FILL_INTENSITY_DELTA;
  const normalizedFill = normalizeHex(fillHex);

  let tint = maxTint;
  let surface = surfaceAtTint(fondoHex, normalizedFill, theme, tint);

  while (tint > SURFACE_TINT_MIN && intensityDelta(surface, normalizedFill) < minDelta) {
    tint = Math.max(SURFACE_TINT_MIN, tint - SURFACE_TINT_STEP);
    surface = surfaceAtTint(fondoHex, normalizedFill, theme, tint);
  }

  return surface;
}

export function hasAdequateSurfaceFillSeparation(
  surfaceHex: string,
  fillHex: string,
  minDelta = MIN_SURFACE_FILL_INTENSITY_DELTA,
): boolean {
  return intensityDelta(surfaceHex, fillHex) >= minDelta;
}
