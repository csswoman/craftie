import { converter, differenceEuclidean, formatHex } from 'culori';

import { nameForHex, namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import { SELECTABLE_COLORS } from './selectableColors';

const toOklch = converter('oklch');
const oklchDifference = differenceEuclidean('oklch');

export type HarmonyType =
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'square';

export type ColorHarmony = {
  type: HarmonyType;
  colors: string[];
};

export type SimilarNamedColor = {
  name: string;
  hex: string;
  distance: number;
};

export type NamedColorShade = {
  hex: string;
  name: string;
};

export type ColorDetails = {
  hex: string;
  name: string;
  harmonies: ColorHarmony[];
  shades: string[];
  similarColors: SimilarNamedColor[];
};

type OklchValues = {
  l: number;
  c: number;
  h: number | undefined;
};

const HARMONY_OFFSETS: Record<HarmonyType, number[]> = {
  analogous: [-30, 0, 30],
  complementary: [0, 180],
  'split-complementary': [0, 150, 210],
  triadic: [0, 120, 240],
  tetradic: [0, 60, 180, 240],
  square: [0, 90, 180, 270],
};

const HARMONY_ORDER: HarmonyType[] = [
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
  'square',
];

function hexToOklch(hex: string): OklchValues {
  const color = toOklch(normalizeHex(hex));

  if (!color || color.mode !== 'oklch') {
    throw new Error(`Unable to convert color to OKLCH: "${hex}"`);
  }

  return {
    l: color.l ?? 0,
    c: color.c ?? 0,
    h: color.h,
  };
}

function oklchToDisplayHex(l: number, c: number, h: number | undefined): string {
  const hex = formatHex({
    mode: 'oklch',
    l: Math.min(0.99, Math.max(0.01, l)),
    c: Math.max(0, c),
    h,
  });

  if (!hex) {
    throw new Error('Unable to format OKLCH color as hex');
  }

  return normalizeHex(hex);
}

function rotateHue(hex: string, degrees: number): string {
  const { l, c, h } = hexToOklch(hex);
  const baseHue = h ?? 145;
  const nextHue = (baseHue + degrees + 360) % 360;

  return oklchToDisplayHex(l, c, nextHue);
}

function withHueOffsets(hex: string, offsets: number[]): string[] {
  const base = normalizeHex(hex);
  const { c, h } = hexToOklch(base);
  const seeded =
    h === undefined ? oklchToDisplayHex(hexToOklch(base).l, Math.max(c, 0.08), 145) : base;

  return offsets.map((offset) => (offset === 0 ? seeded : rotateHue(seeded, offset)));
}

function shadeChroma(baseChroma: number, lightness: number): number {
  const cappedBase = Math.min(baseChroma, 0.22);

  if (lightness >= 0.9) {
    return cappedBase * 0.35;
  }

  if (lightness <= 0.18) {
    return cappedBase * 0.5;
  }

  return cappedBase;
}

function perceptualDistance(leftHex: string, rightHex: string): number {
  const left = toOklch(normalizeHex(leftHex));
  const right = toOklch(normalizeHex(rightHex));

  if (!left || !right || left.mode !== 'oklch' || right.mode !== 'oklch') {
    return Number.POSITIVE_INFINITY;
  }

  return oklchDifference(left, right);
}

function namedReferencePool(): SimilarNamedColor[] {
  const paletteInput = SELECTABLE_COLORS.map((color) => ({ hex: color.hex }));

  return SELECTABLE_COLORS.map((color) => ({
    hex: normalizeHex(color.hex),
    name:
      color.name ||
      nameForHex(color.hex, paletteInput, { style: 'creative' }),
    distance: 0,
  }));
}

export function getColorHarmonies(hex: string): ColorHarmony[] {
  const base = normalizeHex(hex);

  return HARMONY_ORDER.map((type) => ({
    type,
    colors: withHueOffsets(base, HARMONY_OFFSETS[type]),
  }));
}

export function getColorShades(hex: string, count = 10): string[] {
  const base = normalizeHex(hex);
  const { c, h } = hexToOklch(base);
  const start = 0.95;
  const end = 0.12;
  const shades: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0 : index / (count - 1);
    const lightness = start + (end - start) * t;

    shades.push(oklchToDisplayHex(lightness, shadeChroma(c, lightness), h));
  }

  return shades;
}

export function getNamedColorShades(hex: string, count = 10): NamedColorShade[] {
  const shades = getColorShades(hex, count);
  const names = namePalette(
    shades.map((shadeHex) => ({ hex: shadeHex })),
    { style: 'creative' },
  );

  return shades.map((shadeHex) => ({
    hex: shadeHex,
    name: names.get(normalizeHex(shadeHex)) ?? nameForHex(shadeHex, [{ hex: shadeHex }]),
  }));
}

export function getSimilarNamedColors(hex: string, limit = 5): SimilarNamedColor[] {
  const target = normalizeHex(hex);

  return namedReferencePool()
    .filter((entry) => entry.hex !== target)
    .map((entry) => ({
      ...entry,
      distance: perceptualDistance(target, entry.hex),
    }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, limit);
}

export function getColorDetails(hex: string): ColorDetails {
  const normalized = normalizeHex(hex);

  return {
    hex: normalized,
    name: nameForHex(normalized, [{ hex: normalized }], { style: 'creative' }),
    harmonies: getColorHarmonies(normalized),
    shades: getColorShades(normalized),
    similarColors: getSimilarNamedColors(normalized),
  };
}

export const HARMONY_TYPE_LABELS: Record<HarmonyType, string> = {
  analogous: 'Análoga',
  complementary: 'Complementaria',
  'split-complementary': 'Split complementaria',
  triadic: 'Tríada',
  tetradic: 'Tetrádica',
  square: 'Square',
};
