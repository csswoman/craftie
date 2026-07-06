import { lookupNtcColorName } from './ntcNaming';
import { normalizeHex } from './normalizeHex';
import type { ColorGroupId } from './selectableColors';

export type NamingStyle = 'creative' | 'descriptive';

export type PaletteColorInput = {
  hex: string;
};

export type NamePaletteOptions = {
  /** Kept for API compatibility; naming always uses Name That Color. */
  style?: NamingStyle;
};

export const GROUP_DISPLAY_LABELS: Record<ColorGroupId, string> = {
  'light-neutral': 'Neutro claro',
  bold: 'Intenso',
  'dark-neutral': 'Neutro oscuro',
};

function resolveUniqueName(hex: string, usedNames: Set<string>): string {
  const base = lookupNtcColorName(hex);

  if (!usedNames.has(base)) {
    return base;
  }

  for (let attempt = 2; attempt < 100; attempt += 1) {
    const candidate = `${base} ${attempt}`;

    if (!usedNames.has(candidate)) {
      return candidate;
    }
  }

  return `${base} ${hex.slice(1, 4).toUpperCase()}`;
}

/**
 * Assigns stable, unique friendly names to a palette of colors via Name That Color.
 */
export function namePalette(
  colors: PaletteColorInput[],
  _options: NamePaletteOptions = {},
): Map<string, string> {
  const uniqueHexes = [...new Set(colors.map((color) => normalizeHex(color.hex)))].sort();
  const usedNames = new Set<string>();
  const names = new Map<string, string>();

  for (const hex of uniqueHexes) {
    const name = resolveUniqueName(hex, usedNames);
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
  return namePalette(palette, options).get(normalizeHex(hex)) ?? lookupNtcColorName(hex);
}

export function isGenericPaletteName(name: string): boolean {
  return /^(Claro|Intenso|Oscuro) \d+$/.test(name);
}
