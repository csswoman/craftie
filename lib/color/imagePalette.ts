import type { ExtractedColor } from './imageExtractor';
import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
} from './colorGroupClassification';
import { namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import { assignRolesFromExtracted, type RolePalette } from './rolePalette';
import { classifyPalette, type PaletteClassification, type PaletteType } from './paletteClassification';
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

export type ImageExtractionMode = 'paint' | 'ui';

export type PaintPaletteBuildResult = {
  mode: 'paint';
  catalog: SelectableColor[];
  extracted: ExtractedColor[];
  classification: PaletteClassification;
};

export type UiPaletteBuildResult = {
  mode: 'ui';
  catalog: SelectableColor[];
  extracted: ExtractedColor[];
  rolePalette: RolePalette;
  classification: PaletteClassification;
};

export type ImagePaletteBuildResult = PaintPaletteBuildResult | UiPaletteBuildResult;

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
        prominence: color.prominence,
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

export function buildImagePalette(extracted: ExtractedColor[]): UiPaletteBuildResult;
export function buildImagePalette(
  extracted: ExtractedColor[],
  options: { mode: 'paint'; paletteType?: PaletteType },
): PaintPaletteBuildResult;
export function buildImagePalette(
  extracted: ExtractedColor[],
  options: { mode?: 'ui'; paletteType?: PaletteType },
): UiPaletteBuildResult;
export function buildImagePalette(
  extracted: ExtractedColor[],
  options: { mode: ImageExtractionMode; paletteType?: PaletteType },
): ImagePaletteBuildResult;
export function buildImagePalette(
  extracted: ExtractedColor[],
  options: { mode?: ImageExtractionMode; paletteType?: PaletteType } = {},
): ImagePaletteBuildResult {
  const mode = options.mode ?? 'ui';
  const catalog = buildSelectableColorsFromExtracted(extracted);
  const detected = classifyPalette(extracted);
  const classification = options.paletteType ? { ...detected, type: options.paletteType } : detected;

  if (mode === 'paint') {
    return { mode, catalog, extracted, classification };
  }

  const rolePalette = assignRolesFromExtracted(extracted, 'light', classification.type);

  return { mode, catalog, extracted, rolePalette, classification };
}
