import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import {
  sortSelectedColors,
  validateSelection,
  type ColorGroupId,
  type SelectableColor,
} from './selectableColors';

const toOklch = converter('oklch');

const LIGHT_NEUTRAL_L = 0.78;
const DARK_NEUTRAL_L = 0.38;
const BOLD_CHROMA_MIN = 0.045;
const NEUTRAL_CHROMA_MAX = 0.03;

const GROUP_ORDER: ColorGroupId[] = ['light-neutral', 'bold', 'dark-neutral'];

const GROUP_LABELS: Record<ColorGroupId, string> = {
  'light-neutral': 'Claro',
  bold: 'Intenso',
  'dark-neutral': 'Oscuro',
};

export type ImagePaletteBuildResult = {
  catalog: SelectableColor[];
  selection: SelectableColor[];
};

export function classifyHexToGroup(hex: string): ColorGroupId {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    return 'bold';
  }

  const lightness = color.l;
  const chroma = color.c;

  if (lightness >= LIGHT_NEUTRAL_L && chroma <= NEUTRAL_CHROMA_MAX) {
    return 'light-neutral';
  }

  if (lightness <= DARK_NEUTRAL_L) {
    return 'dark-neutral';
  }

  if (chroma >= BOLD_CHROMA_MIN) {
    return 'bold';
  }

  if (lightness >= LIGHT_NEUTRAL_L) {
    return 'light-neutral';
  }

  return 'dark-neutral';
}

function uniqueByHex(colors: ExtractedColor[]): ExtractedColor[] {
  const seen = new Set<string>();

  return colors.filter((color) => {
    if (seen.has(color.hex)) {
      return false;
    }

    seen.add(color.hex);
    return true;
  });
}

export function buildSelectableColorsFromExtracted(extracted: ExtractedColor[]): SelectableColor[] {
  const grouped: Record<ColorGroupId, ExtractedColor[]> = {
    'light-neutral': [],
    bold: [],
    'dark-neutral': [],
  };

  for (const color of uniqueByHex(extracted)) {
    const group = classifyHexToGroup(color.hex);
    grouped[group].push(color);
  }

  const catalog: SelectableColor[] = [];

  for (const group of GROUP_ORDER) {
    const sorted = [...grouped[group]].sort((left, right) => right.prominence - left.prominence);

    sorted.forEach((color, index) => {
      catalog.push({
        id: `image-${group}-${color.hex.slice(1)}`,
        name: `${GROUP_LABELS[group]} ${index + 1}`,
        hex: color.hex,
        group,
      });
    });
  }

  return catalog;
}

function uniqueSelectable(colors: SelectableColor[]): SelectableColor[] {
  const seen = new Set<string>();

  return colors.filter((color) => {
    if (seen.has(color.id)) {
      return false;
    }

    seen.add(color.id);
    return true;
  });
}

function countGroup(colors: SelectableColor[], group: ColorGroupId): number {
  return colors.filter((color) => color.group === group).length;
}

function pickFromCatalog(
  catalog: SelectableColor[],
  group: ColorGroupId,
  selected: SelectableColor[],
  limit: number,
): SelectableColor[] {
  return catalog
    .filter((color) => color.group === group)
    .filter((color) => !selected.some((entry) => entry.id === color.id))
    .slice(0, limit);
}

export function buildDefaultSelectionFromCatalog(catalog: SelectableColor[]): SelectableColor[] {
  if (catalog.length === 0) {
    return [];
  }

  let selection: SelectableColor[] = [];

  selection = [
    ...selection,
    ...pickFromCatalog(catalog, 'light-neutral', selection, 2),
    ...pickFromCatalog(catalog, 'bold', selection, 4),
    ...pickFromCatalog(catalog, 'dark-neutral', selection, 2),
  ];

  selection = uniqueSelectable(selection);

  while (!validateSelection(selection).ok) {
    const validation = validateSelection(selection);

    if (validation.ok) {
      break;
    }

    const beforeLength = selection.length;

    if (countGroup(selection, 'light-neutral') < 1) {
      const next = pickFromCatalog(catalog, 'light-neutral', selection, 1)[0];
      if (next) {
        selection = [...selection, next];
      }
    }

    if (countGroup(selection, 'bold') < 2) {
      const next = pickFromCatalog(catalog, 'bold', selection, 1)[0];
      if (next) {
        selection = [...selection, next];
      }
    }

    if (countGroup(selection, 'dark-neutral') < 1) {
      const next = pickFromCatalog(catalog, 'dark-neutral', selection, 1)[0];
      if (next) {
        selection = [...selection, next];
      }
    }

    selection = uniqueSelectable(selection);

    if (selection.length === beforeLength) {
      break;
    }
  }

  const boldColors = selection.filter((color) => color.group === 'bold');

  if (boldColors.length > 4) {
    const keepIds = new Set(boldColors.slice(0, 4).map((color) => color.id));
    selection = selection.filter((color) => color.group !== 'bold' || keepIds.has(color.id));
  }

  return sortSelectedColors(selection);
}

export function buildImagePalette(extracted: ExtractedColor[]): ImagePaletteBuildResult {
  const catalog = buildSelectableColorsFromExtracted(extracted);
  const selection = buildDefaultSelectionFromCatalog(catalog);

  return { catalog, selection };
}
