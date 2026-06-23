import { normalizeHex } from './normalizeHex';

export type ColorGroupId = 'light-neutral' | 'bold' | 'dark-neutral';

export type SelectableColor = {
  id: string;
  name: string;
  hex: string;
  group: ColorGroupId;
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

const BOLD_MIN = 2;
const BOLD_MAX = 4;

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

export function validateSelection(colors: SelectableColor[]): SelectionValidationResult {
  const lightCount = countByGroup(colors, 'light-neutral');
  const boldCount = countByGroup(colors, 'bold');
  const darkCount = countByGroup(colors, 'dark-neutral');

  if (lightCount < 1) {
    return { ok: false, error: 'Elige al menos un color neutro claro.' };
  }

  if (boldCount < BOLD_MIN) {
    return { ok: false, error: 'Elige al menos 2 colores intensos.' };
  }

  if (boldCount > BOLD_MAX) {
    return { ok: false, error: 'Puedes elegir hasta 4 colores intensos.' };
  }

  if (darkCount < 1) {
    return { ok: false, error: 'Elige al menos un color neutro oscuro.' };
  }

  return { ok: true };
}

export function canToggleColor(
  selected: SelectableColor[],
  color: SelectableColor,
): boolean {
  const isSelected = selected.some((entry) => entry.id === color.id);

  if (!isSelected) {
    if (color.group === 'bold' && countByGroup(selected, 'bold') >= BOLD_MAX) {
      return false;
    }

    return true;
  }

  const next = selected.filter((entry) => entry.id !== color.id);
  return validateSelection(next).ok;
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

  return [...bold, ...light, ...dark].slice(0, 3);
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
  let selection = uniqueColors(colors);
  const fallbackIds = ['porcelain', 'seaspray', 'zest', 'nectar', 'twilight'];

  for (const id of fallbackIds) {
    const validation = validateSelection(selection);

    if (validation.ok) {
      break;
    }

    const fallback = SELECTABLE_COLORS.find((color) => color.id === id);

    if (fallback && !selection.some((color) => color.id === fallback.id)) {
      selection = [...selection, fallback];
    }
  }

  const boldColors = selection.filter((color) => color.group === 'bold');

  if (boldColors.length > BOLD_MAX) {
    const keepIds = new Set(boldColors.slice(0, BOLD_MAX).map((color) => color.id));
    selection = selection.filter((color) => color.group !== 'bold' || keepIds.has(color.id));
  }

  return sortSelectedColors(selection);
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

  const selection = ensureMinimumSelection(matched.length > 0 ? matched : createDefaultSelection());
  const validation = validateSelection(selection);

  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return { ok: true, colors: selection };
}
