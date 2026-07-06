import { clampChroma, converter, displayable, formatHex, interpolate, parse } from 'culori';
import type { Oklch, Rgb } from 'culori';

import { normalizeHex } from '../color/normalizeHex';

const toRgb = converter('rgb');
const toOklch = converter('oklch');

const LIGHTNESS_SEARCH_EPSILON = 0.002;
const NEAR_WHITE_L = 0.98;
const NEAR_BLACK_L = 0.15;
const TEXT_TINT_CHROMA = 0.025;

function assertValidColorInput(hex: string): void {
  if (typeof hex !== 'string' || hex.trim() === '') {
    throw new Error(
      `Invalid color input: expected a non-empty hex string, received ${String(hex)}`,
    );
  }
}

function hasTransparency(color: { alpha?: number; mode?: string }): boolean {
  if (color.mode === 'transparent') {
    return true;
  }

  return typeof color.alpha === 'number' && color.alpha < 1;
}

function parseOpaqueColor(hex: string): Rgb {
  assertValidColorInput(hex);

  const trimmed = hex.trim();
  const parsed = parse(trimmed);

  if (parsed === undefined) {
    throw new Error(`Unable to parse color: "${trimmed}"`);
  }

  if (hasTransparency(parsed)) {
    throw new Error(`Unsupported alpha/transparency in color: "${trimmed}"`);
  }

  const rgb = toRgb(parsed);

  if (rgb === undefined) {
    throw new Error(`Unable to convert color to RGB: "${trimmed}"`);
  }

  if (hasTransparency(rgb)) {
    throw new Error(`Unsupported alpha/transparency in color: "${trimmed}"`);
  }

  return rgb;
}

function parseOklch(hex: string): Oklch {
  const normalized = normalizeHex(hex);
  const oklch = toOklch(normalized);

  if (!oklch || oklch.mode !== 'oklch') {
    throw new Error(`Unable to convert color to OKLCH: "${normalized}"`);
  }

  return oklch;
}

function channelToLinear(channel: number): number {
  if (channel <= 0.03928) {
    return channel / 12.92;
  }

  return ((channel + 0.055) / 1.055) ** 2.4;
}

function oklchToHex(l: number, c: number, h: number | undefined): string {
  const clamped = clampChroma(
    {
      mode: 'oklch',
      l: Math.min(1, Math.max(0, l)),
      c: Math.max(0, c),
      h,
    },
    'oklch',
  );

  const hex = formatHex(clamped);

  if (hex === undefined) {
    throw new Error('Unable to convert OKLCH color to hex');
  }

  return normalizeHex(hex);
}

/**
 * WCAG 2.2 relative luminance for an sRGB color.
 * Contrast evaluation uses sRGB luminance; color manipulation stays in OKLCH.
 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseOpaqueColor(hex);

  const linearR = channelToLinear(r);
  const linearG = channelToLinear(g);
  const linearB = channelToLinear(b);

  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

/** WCAG 2.2 contrast ratio between two sRGB colors. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

/** Interpolates two colors in OKLCH space. Amount 0 = a, 1 = b. */
export function mixColors(hexA: string, hexB: string, amount: number): string {
  const normalizedA = normalizeHex(hexA);
  const normalizedB = normalizeHex(hexB);
  const t = Math.min(1, Math.max(0, amount));
  const blended = interpolate([normalizedA, normalizedB], 'oklch')(t);

  if (!blended) {
    throw new Error('Unable to mix colors in OKLCH');
  }

  const hex = formatHex(blended);

  if (!hex) {
    throw new Error('Unable to format mixed OKLCH color as hex');
  }

  return normalizeHex(hex);
}

function tintedNearTone(backgroundHex: string, lightness: number): string {
  const bg = parseOklch(backgroundHex);
  const chroma = Math.min(TEXT_TINT_CHROMA, Math.max(0.01, (bg.c ?? 0) * 0.35));

  return oklchToHex(lightness, chroma, bg.h);
}

/**
 * Returns the near-black or near-white tone tinted toward the background hue
 * that maximizes WCAG contrast against the background.
 */
export function bestTextOn(backgroundHex: string): string {
  const nearWhite = tintedNearTone(backgroundHex, NEAR_WHITE_L);
  const nearBlack = tintedNearTone(backgroundHex, NEAR_BLACK_L);
  const whiteContrast = contrastRatio(nearWhite, backgroundHex);
  const blackContrast = contrastRatio(nearBlack, backgroundHex);

  return whiteContrast >= blackContrast ? nearWhite : nearBlack;
}

function maxInGamutChroma(l: number, h: number | undefined, cap: number): number {
  if (cap <= 0) {
    return 0;
  }

  const probe = (chroma: number): boolean =>
    displayable({ mode: 'oklch', l, c: chroma, h });

  if (!probe(0)) {
    return 0;
  }

  if (probe(cap)) {
    return cap;
  }

  let lo = 0;
  let hi = cap;
  let best = 0;

  while (hi - lo > 0.001) {
    const mid = (lo + hi) / 2;

    if (probe(mid)) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return best;
}

function maximizeChromaForContrast(
  lightness: number,
  h: number | undefined,
  chromaCap: number,
  backgroundHex: string,
  targetRatio: number,
): string {
  const passes = (chroma: number): boolean =>
    contrastRatio(oklchToHex(lightness, chroma, h), backgroundHex) >= targetRatio;

  if (!passes(0)) {
    return oklchToHex(lightness, 0, h);
  }

  let lo = 0;
  let hi = chromaCap;
  let bestChroma = 0;

  while (hi - lo > 0.001) {
    const mid = (lo + hi) / 2;

    if (passes(mid)) {
      bestChroma = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return oklchToHex(lightness, bestChroma, h);
}

function readableAtLightness(
  lightness: number,
  chroma: number,
  h: number | undefined,
  backgroundHex: string,
  targetRatio: number,
): string {
  const maxChroma = maxInGamutChroma(lightness, h, chroma);
  return maximizeChromaForContrast(lightness, h, maxChroma, backgroundHex, targetRatio);
}
function findLightnessBound(
  ratioAt: (lightness: number) => number,
  targetRatio: number,
  low: number,
  high: number,
  preferHigher: boolean,
): number | null {
  const anchor = preferHigher ? low : high;

  if (ratioAt(anchor) < targetRatio) {
    return null;
  }

  let bound = preferHigher ? high : low;
  let lo = low;
  let hi = high;

  while (hi - lo > LIGHTNESS_SEARCH_EPSILON) {
    const mid = (lo + hi) / 2;

    if (ratioAt(mid) >= targetRatio) {
      bound = mid;

      if (preferHigher) {
        lo = mid;
      } else {
        hi = mid;
      }
    } else if (preferHigher) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return bound;
}

/**
 * Adjusts only OKLCH lightness so `foregroundHex` meets `targetRatio` on `backgroundHex`.
 * Darkens on light backgrounds, lightens on dark backgrounds; hue and chroma stay intact.
 */
export function readableOn(
  foregroundHex: string,
  backgroundHex: string,
  targetRatio = 4.5,
): string {
  const normalized = normalizeHex(foregroundHex);

  if (contrastRatio(normalized, backgroundHex) >= targetRatio) {
    return normalized;
  }

  const oklch = parseOklch(normalized);
  const { c, h } = oklch;
  const originalL = oklch.l ?? 0;
  const isLightBackground = relativeLuminance(backgroundHex) >= 0.5;

  const ratioAt = (lightness: number): number =>
    contrastRatio(readableAtLightness(lightness, c, h, backgroundHex, targetRatio), backgroundHex);

  const preferred = isLightBackground
    ? findLightnessBound(ratioAt, targetRatio, 0, originalL, true)
    : findLightnessBound(ratioAt, targetRatio, originalL, 1, false);

  if (preferred !== null) {
    return readableAtLightness(preferred, c, h, backgroundHex, targetRatio);
  }

  const alternate = isLightBackground
    ? findLightnessBound(ratioAt, targetRatio, originalL, 1, false)
    : findLightnessBound(ratioAt, targetRatio, 0, originalL, true);

  if (alternate !== null) {
    return readableAtLightness(alternate, c, h, backgroundHex, targetRatio);
  }

  return adjustLightnessForContrast(normalized, backgroundHex, targetRatio);
}

/**
 * Adjusts OKLCH lightness until contrast against `against` meets `targetRatio`.
 * Keeps hue and chroma intact; picks the smallest lightness delta when both directions work.
 */
export function adjustLightnessForContrast(
  colorHex: string,
  againstHex: string,
  targetRatio: number,
): string {
  const normalized = normalizeHex(colorHex);
  const currentRatio = contrastRatio(normalized, againstHex);

  if (currentRatio >= targetRatio) {
    return normalized;
  }

  const oklch = parseOklch(normalized);
  const { c, h } = oklch;
  const originalL = oklch.l ?? 0;

  const ratioAt = (lightness: number): number =>
    contrastRatio(oklchToHex(lightness, c, h), againstHex);

  const darkerCandidate = findLightnessBound(ratioAt, targetRatio, 0, originalL, true);
  const lighterCandidate = findLightnessBound(ratioAt, targetRatio, originalL, 1, false);

  const candidates: Array<{ l: number; deltaL: number }> = [];

  if (darkerCandidate !== null) {
    candidates.push({ l: darkerCandidate, deltaL: darkerCandidate - originalL });
  }

  if (lighterCandidate !== null) {
    candidates.push({ l: lighterCandidate, deltaL: lighterCandidate - originalL });
  }

  if (candidates.length === 0) {
    return normalized;
  }

  const best = candidates.reduce((closest, candidate) =>
    Math.abs(candidate.deltaL) < Math.abs(closest.deltaL) ? candidate : closest,
  );

  return oklchToHex(best.l, c, h);
}

/** @alias mixColors */
export { mixColors as mix };

export type OklchChannels = {
  l: number;
  c: number;
  h: number;
};

/** Parses a hex color into OKLCH channels for UI sliders (hue defaults to 0 when absent). */
export function hexToOklchChannels(hex: string): OklchChannels {
  const oklch = parseOklch(hex);

  return {
    l: oklch.l ?? 0,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
  };
}

/** Composes OKLCH channels into an sRGB-safe hex via clampChroma. */
export function oklchChannelsToHex(l: number, c: number, h: number): string {
  return oklchToHex(l, c, c <= 0 ? undefined : h);
}

/** Maximum chroma displayable in sRGB for the given lightness and hue. */
export function maxOklchChromaForSrgb(l: number, h: number): number {
  return maxInGamutChroma(Math.min(1, Math.max(0, l)), h, 0.4);
}
