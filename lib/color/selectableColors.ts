import { normalizeHex } from './normalizeHex';

export type ColorGroupId = 'light-neutral' | 'bold' | 'dark-neutral';

export type SelectableColor = {
  id: string;
  name: string;
  hex: string;
  group: ColorGroupId;
  /** When true, the user-provided name is preserved instead of auto-generated. */
  customName?: boolean;
};
export const SELECTABLE_COLORS: SelectableColor[] = [
  { id: 'porcelain', name: 'Porcelain', hex: '#F7F7F5', group: 'light-neutral' },
  { id: 'chalk', name: 'Chalk', hex: '#EFEFE8', group: 'light-neutral' },
  { id: 'mist', name: 'Mist', hex: '#E8E6DF', group: 'light-neutral' },
  { id: 'pebble', name: 'Pebble', hex: '#D9D7D0', group: 'light-neutral' },
  { id: 'linen-frost', name: 'Linen Frost', hex: '#F3F0E6', group: 'light-neutral' },
  { id: 'pale-ash', name: 'Pale Ash', hex: '#E2E0DA', group: 'light-neutral' },
  { id: 'cloud', name: 'Cloud', hex: '#FAFAFA', group: 'light-neutral' },
  { id: 'shell', name: 'Shell', hex: '#F5F3EE', group: 'light-neutral' },
  { id: 'seaspray', name: 'Seaspray', hex: '#9ADBD6', group: 'bold' },
  { id: 'zest', name: 'Zest', hex: '#E8D44D', group: 'bold' },
  { id: 'nectar', name: 'Nectar', hex: '#F4A261', group: 'bold' },
  { id: 'breeze', name: 'Breeze', hex: '#7EC8E3', group: 'bold' },
  { id: 'lime', name: 'Lime', hex: '#B8E986', group: 'bold' },
  { id: 'blush', name: 'Blush', hex: '#F2A0A8', group: 'bold' },
  { id: 'coral-note', name: 'Coral Note', hex: '#E76F51', group: 'bold' },
  { id: 'meadow', name: 'Meadow', hex: '#6DB38B', group: 'bold' },
  { id: 'orchid', name: 'Orchid', hex: '#C9A0DC', group: 'bold' },
  { id: 'saffron', name: 'Saffron', hex: '#F4B942', group: 'bold' },
  { id: 'twilight', name: 'Twilight', hex: '#2C3E50', group: 'dark-neutral' },
  { id: 'grove', name: 'Grove', hex: '#1F3D2B', group: 'dark-neutral' },
  { id: 'ember', name: 'Ember', hex: '#3D2B1F', group: 'dark-neutral' },
  { id: 'slate', name: 'Slate', hex: '#3A3D40', group: 'dark-neutral' },
  { id: 'inkwell', name: 'Inkwell', hex: '#1A1C1E', group: 'dark-neutral' },
  { id: 'pine', name: 'Pine', hex: '#243B36', group: 'dark-neutral' },
  { id: 'dusk', name: 'Dusk', hex: '#4A3728', group: 'dark-neutral' },
  { id: 'graphite', name: 'Graphite', hex: '#2E3133', group: 'dark-neutral' },
];

const GROUP_ORDER: ColorGroupId[] = ['light-neutral', 'bold', 'dark-neutral'];

export const SELECTION_GUIDELINES = {
  lightNeutralMin: 1,
  boldMin: 2,
  boldMax: 4,
  darkNeutralMin: 1,
} as const;

export type SelectionValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export type SelectionSuggestionResult =
  | { ok: true; colors: SelectableColor[] }
  | { ok: false; error: string };

export function getColorsByGroup(group: ColorGroupId): SelectableColor[] {
  return SELECTABLE_COLORS.filter((color) => color.group === group);
}

export function createDefaultSelection(): SelectableColor[] {
  const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain');
  const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray');
  const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest');
  const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight');

  if (!porcelain || !seaspray || !zest || !twilight) {
    return [];
  }

  return [porcelain, seaspray, zest, twilight];
}

function countByGroup(colors: SelectableColor[], group: ColorGroupId): number {
  return colors.filter((color) => color.group === group).length;
}

export function getSelectionSuggestions(colors: SelectableColor[]): string[] {
  const suggestions: string[] = [];
  const lightCount = countByGroup(colors, 'light-neutral');
  const boldCount = countByGroup(colors, 'bold');
  const darkCount = countByGroup(colors, 'dark-neutral');

  if (lightCount < SELECTION_GUIDELINES.lightNeutralMin) {
    suggestions.push('Sugerencia: elige al menos un neutro claro para superficies.');
  }

  if (boldCount < SELECTION_GUIDELINES.boldMin) {
    suggestions.push('Sugerencia: elige 2–4 colores intensos para primario y acento.');
  } else if (boldCount > SELECTION_GUIDELINES.boldMax) {
    suggestions.push('Sugerencia: 2–4 colores intensos suelen dar mejor balance.');
  }

  if (darkCount < SELECTION_GUIDELINES.darkNeutralMin) {
    suggestions.push('Sugerencia: elige al menos un neutro oscuro para texto.');
  }

  return suggestions;
}

export function validateSelection(colors: SelectableColor[]): SelectionValidationResult {
  if (colors.length < 1) {
    return { ok: false, error: 'Selecciona al menos un color para generar.' };
  }

  return { ok: true };
}

export function canToggleColor(
  selected: SelectableColor[],
  color: SelectableColor,
): boolean {
  const isSelected = selected.some((entry) => entry.id === color.id);

  if (isSelected) {
    return true;
  }

  return true;
}

export function toggleSelectedColor(
  selected: SelectableColor[],
  color: SelectableColor,
): SelectableColor[] | null {
  if (!canToggleColor(selected, color)) {
    return null;
  }

  const isSelected = selected.some((entry) => entry.id === color.id);

  if (isSelected) {
    return selected.filter((entry) => entry.id !== color.id);
  }

  return [...selected, color];
}

export function sortSelectedColors(colors: SelectableColor[]): SelectableColor[] {
  return [...colors].sort((left, right) => {
    const groupDelta = GROUP_ORDER.indexOf(left.group) - GROUP_ORDER.indexOf(right.group);

    if (groupDelta !== 0) {
      return groupDelta;
    }

    return left.name.localeCompare(right.name, 'es');
  });
}

export function mapSelectedColorsToSeeds(colors: SelectableColor[]): string[] {
  const sorted = sortSelectedColors(colors);
  const bold = sorted.filter((color) => color.group === 'bold').map((color) => color.hex);
  const light = sorted
    .filter((color) => color.group === 'light-neutral')
    .map((color) => color.hex);
  const dark = sorted.filter((color) => color.group === 'dark-neutral').map((color) => color.hex);

  const combined = [...bold, ...light, ...dark];
  const seen = new Set<string>();

  return combined.filter((hex) => {
    const normalized = normalizeHex(hex);

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function uniqueColors(colors: SelectableColor[]): SelectableColor[] {
  const seen = new Set<string>();

  return colors.filter((color) => {
    if (seen.has(color.id)) {
      return false;
    }

    seen.add(color.id);
    return true;
  });
}

function ensureMinimumSelection(colors: SelectableColor[]): SelectableColor[] {
  const selection = uniqueColors(colors);

  if (selection.length > 0) {
    return sortSelectedColors(selection);
  }

  return createDefaultSelection();
}

/**
 * Maps seed HEX values to curated selectable colors and fills gaps to satisfy group rules.
 */
export function suggestSelectionFromHexes(hexes: string[]): SelectionSuggestionResult {
  const matched: SelectableColor[] = [];

  for (const hex of hexes) {
    try {
      const normalized = normalizeHex(hex);
      const color = SELECTABLE_COLORS.find((entry) => entry.hex === normalized);

      if (color && !matched.some((entry) => entry.id === color.id)) {
        matched.push(color);
      }
    } catch {
      continue;
    }
  }

  const selection = ensureMinimumSelection(matched);

  return { ok: true, colors: selection };
}
