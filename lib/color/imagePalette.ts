import type { ExtractedColor } from './imageExtractor';
import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
} from './colorGroupClassification';
import { namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import { assignRolesFromExtracted, type RolePalette } from './rolePalette';
import {
  type ColorGroupId,
  type SelectableColor,
} from './selectableColors';

export {
  DARK_NEUTRAL_LIGHTNESS_MAX,
  INTENSE_CHROMA_MIN,
  LIGHT_NEUTRAL_LIGHTNESS_MIN,
  NEUTRAL_CHROMA_MAX,
} from './colorGroupClassification';

const GROUP_ORDER: ColorGroupId[] = ['light-neutral', 'bold', 'dark-neutral'];

const GROUP_LABELS: Record<ColorGroupId, string> = {
  'light-neutral': 'Claro',
  bold: 'Intenso',
  'dark-neutral': 'Oscuro',
};

export const DEFAULT_IMAGE_LIGHT_NEUTRAL_HEX = '#FFFFFF';

export function createDefaultLightNeutralColor(): SelectableColor {
  return {
    id: 'image-light-neutral-FFFFFF',
    name: 'Blanco',
    hex: DEFAULT_IMAGE_LIGHT_NEUTRAL_HEX,
    group: 'light-neutral',
  };
}

function ensureLightNeutralInCatalog(catalog: SelectableColor[]): SelectableColor[] {
  if (catalog.some((color) => color.group === 'light-neutral')) {
    return catalog;
  }

  return [createDefaultLightNeutralColor(), ...catalog];
}

export type ImagePaletteBuildResult = {
  catalog: SelectableColor[];
  extracted: ExtractedColor[];
  rolePalette: RolePalette;
};

export function classifyHexToGroup(hex: string): ColorGroupId {
  return classifyColorToGroup(hex, DEFAULT_COLOR_GROUP_THRESHOLDS);
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

    sorted.forEach((color) => {
      catalog.push({
        id: `image-${group}-${color.hex.slice(1)}`,
        name: '',
        hex: color.hex,
        group,
      });
    });
  }

  const names = namePalette(
    catalog.map((color) => ({ hex: color.hex })),
    { style: 'creative' },
  );

  return catalog.map((color) => ({
    ...color,
    name: names.get(normalizeHex(color.hex)) ?? GROUP_LABELS[color.group],
  }));
}

export function buildImagePalette(extracted: ExtractedColor[]): ImagePaletteBuildResult {
  const catalog = ensureLightNeutralInCatalog(buildSelectableColorsFromExtracted(extracted));
  const rolePalette = assignRolesFromExtracted(extracted);

  return { catalog, extracted, rolePalette };
}
