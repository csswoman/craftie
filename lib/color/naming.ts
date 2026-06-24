import { converter } from 'culori';

import { normalizeHex } from './normalizeHex';
import type { ColorGroupId } from './selectableColors';

const toOklch = converter('oklch');

export type NamingStyle = 'creative' | 'descriptive';

export type PaletteColorInput = {
  hex: string;
};

export type NamePaletteOptions = {
  style?: NamingStyle;
};

export const GROUP_DISPLAY_LABELS: Record<ColorGroupId, string> = {
  'light-neutral': 'Neutro claro',
  bold: 'Intenso',
  'dark-neutral': 'Neutro oscuro',
};

const NEUTRAL_CHROMA_MAX = 0.03;

const NEUTRAL_LIGHT = ['Porcelain', 'Chalk', 'Cloud', 'Shell', 'Linen', 'Mist', 'Frost', 'Pearl'];
const NEUTRAL_MID = ['Ash', 'Stone', 'Pebble', 'Dust', 'Fog', 'Drift'];
const NEUTRAL_DARK = ['Slate', 'Graphite', 'Inkwell', 'Pine', 'Grove', 'Twilight', 'Dusk', 'Ember'];

const HUE_NOUNS: { min: number; max: number; nouns: string[] }[] = [
  { min: 0, max: 25, nouns: ['Rose', 'Blush', 'Coral', 'Ember'] },
  { min: 25, max: 55, nouns: ['Amber', 'Honey', 'Saffron', 'Nectar'] },
  { min: 55, max: 95, nouns: ['Zest', 'Lime', 'Meadow', 'Sage'] },
  { min: 95, max: 145, nouns: ['Moss', 'Grove', 'Leaf', 'Fern'] },
  { min: 145, max: 195, nouns: ['Seaspray', 'Mint', 'Aqua', 'Breeze'] },
  { min: 195, max: 272, nouns: ['Sky', 'Ocean', 'Azure', 'Lagoon', 'Periwinkle'] },
  { min: 272, max: 310, nouns: ['Lilac', 'Orchid', 'Plum', 'Violet', 'Iris'] },
  { min: 310, max: 360, nouns: ['Berry', 'Mulberry', 'Magenta', 'Fuchsia'] },
];

const LIGHT_MODIFIERS = ['Mist', 'Frost', 'Pale', 'Soft', 'Cloud', 'Linen'];
const MID_MODIFIERS = ['Calm', 'Warm', 'Bright', 'Clear'];
const DARK_MODIFIERS = ['Deep', 'Rich', 'Shadow', 'Midnight'];

const DEDUP_SUFFIXES = ['Haze', 'Glow', 'Note', 'Tone', 'Veil', 'Wash', 'Dew', 'Air'];

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickFrom<T>(items: T[], seed: string, offset = 0): T {
  const index = (hashString(seed) + offset) % items.length;
  return items[index]!;
}

function hueBucket(hue: number): string[] {
  const normalized = ((hue % 360) + 360) % 360;

  for (const bucket of HUE_NOUNS) {
    if (normalized >= bucket.min && normalized < bucket.max) {
      return bucket.nouns;
    }
  }

  return HUE_NOUNS[0]!.nouns;
}

function composeCreativeName(noun: string, modifier: string | null): string {
  if (!modifier || modifier === noun) {
    return noun;
  }

  return `${noun} ${modifier}`;
}

function baseCreativeName(hex: string, offset = 0): string {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    return pickFrom(NEUTRAL_MID, hex, offset);
  }

  const lightness = color.l;
  const chroma = color.c;
  const hue = color.h ?? 0;
  const seed = `${hex}:${offset}`;

  if (chroma <= NEUTRAL_CHROMA_MAX) {
    if (lightness >= 0.82) {
      return pickFrom(NEUTRAL_LIGHT, seed, offset);
    }

    if (lightness <= 0.38) {
      return pickFrom(NEUTRAL_DARK, seed, offset);
    }

    return pickFrom(NEUTRAL_MID, seed, offset);
  }

  const noun = pickFrom(hueBucket(hue), seed, offset);

  if (lightness >= 0.78) {
    return composeCreativeName(noun, pickFrom(LIGHT_MODIFIERS, seed, offset + 1));
  }

  if (lightness <= 0.38) {
    return composeCreativeName(noun, pickFrom(DARK_MODIFIERS, seed, offset + 1));
  }

  if (chroma >= 0.12) {
    return composeCreativeName(noun, pickFrom(MID_MODIFIERS, seed, offset + 1));
  }

  return noun;
}

function descriptiveName(hex: string): string {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    return 'Color';
  }

  const hue = color.h ?? 0;
  const noun = pickFrom(hueBucket(hue), hex, 0);

  if (color.l >= 0.82) {
    return `Light ${noun}`;
  }

  if (color.l <= 0.38) {
    return `Dark ${noun}`;
  }

  return noun;
}

function resolveUniqueName(
  hex: string,
  style: NamingStyle,
  usedNames: Set<string>,
): string {
  let attempt = 0;

  while (attempt < 32) {
    const candidate =
      style === 'creative' ? baseCreativeName(hex, attempt) : descriptiveName(hex);
    const name =
      attempt === 0 || !usedNames.has(candidate)
        ? candidate
        : style === 'creative'
          ? composeCreativeName(
              baseCreativeName(hex, attempt),
              pickFrom(DEDUP_SUFFIXES, hex, attempt),
            )
          : `${descriptiveName(hex)} ${attempt + 1}`;

    if (!usedNames.has(name)) {
      return name;
    }

    attempt += 1;
  }

  return `${baseCreativeName(hex, attempt)} ${hex.slice(1, 4).toUpperCase()}`;
}

/**
 * Assigns stable, unique friendly names to a palette of colors.
 */
export function namePalette(
  colors: PaletteColorInput[],
  options: NamePaletteOptions = {},
): Map<string, string> {
  const style = options.style ?? 'creative';
  const uniqueHexes = [...new Set(colors.map((color) => normalizeHex(color.hex)))].sort();
  const usedNames = new Set<string>();
  const names = new Map<string, string>();

  for (const hex of uniqueHexes) {
    const name = resolveUniqueName(hex, style, usedNames);
    usedNames.add(name);
    names.set(hex, name);
  }

  return names;
}

export function nameForHex(
  hex: string,
  palette: PaletteColorInput[],
  options: NamePaletteOptions = {},
): string {
  return namePalette(palette, options).get(normalizeHex(hex)) ?? baseCreativeName(hex);
}

export function isGenericPaletteName(name: string): boolean {
  return /^(Claro|Intenso|Oscuro) \d+$/.test(name);
}
