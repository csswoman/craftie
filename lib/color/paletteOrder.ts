import {
  canToggleColor,
  toggleSelectedColor,
  type SelectableColor,
} from './selectableColors';
import { classifyHexToGroup } from './imagePalette';
import { nameForHex } from './naming';
import { normalizeHex, isValidOpaqueHex } from './normalizeHex';

export const CUSTOM_COLOR_NAME_MAX_LENGTH = 40;

const CUSTOM_NAME_MAX_LENGTH = CUSTOM_COLOR_NAME_MAX_LENGTH;

export function normalizeCustomColorName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length === 0 || trimmed.length > CUSTOM_NAME_MAX_LENGTH) {
    return null;
  }

  return trimmed;
}

export function moveSelectedColor(
  colors: SelectableColor[],
  fromIndex: number,
  toIndex: number,
): SelectableColor[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= colors.length ||
    toIndex >= colors.length ||
    fromIndex === toIndex
  ) {
    return colors;
  }

  const next = [...colors];
  const [moved] = next.splice(fromIndex, 1);

  if (!moved) {
    return colors;
  }

  next.splice(toIndex, 0, moved);
  return next;
}

export function insertSelectedColor(
  selected: SelectableColor[],
  index: number,
  color: SelectableColor,
): SelectableColor[] | null {
  if (selected.some((entry) => entry.id === color.id)) {
    return null;
  }

  if (!canToggleColor(selected, color)) {
    return null;
  }

  const next = [...selected];
  const safeIndex = Math.min(Math.max(index, 0), next.length);
  next.splice(safeIndex, 0, color);
  return next;
}

export function removeSelectedColor(
  selected: SelectableColor[],
  colorId: string,
): SelectableColor[] | null {
  const color = selected.find((entry) => entry.id === colorId);

  if (!color) {
    return null;
  }

  return toggleSelectedColor(selected, color);
}

export function getInsertableCatalogColors(
  catalog: SelectableColor[],
  selected: SelectableColor[],
): SelectableColor[] {
  const selectedIds = new Set(selected.map((color) => color.id));

  return catalog.filter(
    (color) => !selectedIds.has(color.id) && canToggleColor(selected, color),
  );
}

export function replaceSelectedColorHex(
  colors: SelectableColor[],
  colorId: string,
  newHex: string,
): SelectableColor[] | null {
  const target = colors.find((color) => color.id === colorId);

  if (!target) {
    return null;
  }

  const normalized = normalizeHex(newHex);
  const paletteInput = colors.map((color) => ({
    hex: color.id === colorId ? normalized : color.hex,
  }));

  return colors.map((color) => {
    if (color.id !== colorId) {
      return color;
    }

    const id = color.id.startsWith('image-')
      ? `image-${color.group}-${normalized.slice(1)}`
      : color.id;

    const nextColor = {
      ...color,
      id,
      hex: normalized,
    };

    if (color.customName) {
      return nextColor;
    }

    return {
      ...nextColor,
      name: nameForHex(normalized, paletteInput, { style: 'creative' }),
    };
  });
}

export function replacePaletteColor(
  catalog: SelectableColor[],
  selected: SelectableColor[],
  colorId: string,
  newHex: string,
): { catalog: SelectableColor[]; selected: SelectableColor[] } | null {
  const selectedIndex = selected.findIndex((color) => color.id === colorId);

  if (selectedIndex < 0) {
    return null;
  }

  const nextSelected = replaceSelectedColorHex(selected, colorId, newHex);

  if (!nextSelected) {
    return null;
  }

  const updated = nextSelected[selectedIndex];

  if (!updated) {
    return null;
  }

  const catalogIndex = catalog.findIndex((color) => color.id === colorId);
  let nextCatalog: SelectableColor[];

  if (catalogIndex >= 0) {
    nextCatalog = [...catalog];
    nextCatalog[catalogIndex] = updated;
  } else {
    nextCatalog = [...catalog, updated];
  }

  if (updated.id !== colorId) {
    const seen = new Set<string>();

    nextCatalog = nextCatalog.filter((color) => {
      if (color.id === colorId) {
        return false;
      }

      if (seen.has(color.id)) {
        return false;
      }

      seen.add(color.id);
      return true;
    });
  }

  return { catalog: nextCatalog, selected: nextSelected };
}

export function createSelectableColorFromHex(hex: string, customName?: string): SelectableColor {
  const normalized = normalizeHex(hex);
  const group = classifyHexToGroup(normalized);
  const trimmedName = customName ? normalizeCustomColorName(customName) : null;
  const name =
    trimmedName ?? nameForHex(normalized, [{ hex: normalized }], { style: 'creative' });

  return {
    id: `custom-${group}-${normalized.slice(1)}`,
    name,
    hex: normalized,
    group,
    customName: trimmedName !== null,
  };
}

export type AddColorToPaletteResult =
  | { ok: true; catalog: SelectableColor[]; selected: SelectableColor[]; message?: string }
  | { ok: false; error: string };

export type AddColorToPaletteOptions = {
  customName?: string;
};

export function addColorToPalette(
  catalog: SelectableColor[],
  selected: SelectableColor[],
  hex: string,
  options: AddColorToPaletteOptions = {},
): AddColorToPaletteResult {
  if (!isValidOpaqueHex(hex)) {
    return { ok: false, error: 'Introduce un código HEX válido (#RRGGBB).' };
  }

  let normalized: string;

  try {
    normalized = normalizeHex(hex);
  } catch {
    return { ok: false, error: 'Introduce un código HEX válido (#RRGGBB).' };
  }

  const existing = catalog.find((color) => normalizeHex(color.hex) === normalized);

  if (existing) {
    if (selected.some((color) => color.id === existing.id)) {
      return { ok: false, error: 'Este color ya está en tu selección.' };
    }

    const nextSelected = insertSelectedColor(selected, selected.length, existing);

    if (!nextSelected) {
      return {
        ok: false,
        error: 'No puedes añadir más colores de este grupo. Ajusta la selección primero.',
      };
    }

    return { ok: true, catalog, selected: nextSelected };
  }

  const color = createSelectableColorFromHex(normalized, options.customName);
  const nextCatalog = [...catalog, color];

  if (!canToggleColor(selected, color)) {
    return {
      ok: true,
      catalog: nextCatalog,
      selected,
      message: 'Color añadido al catálogo. Libera un hueco en su grupo para seleccionarlo.',
    };
  }

  const nextSelected = insertSelectedColor(selected, selected.length, color);

  if (!nextSelected) {
    return {
      ok: true,
      catalog: nextCatalog,
      selected,
      message: 'Color añadido al catálogo. Libera un hueco en su grupo para seleccionarlo.',
    };
  }

  return { ok: true, catalog: nextCatalog, selected: nextSelected };
}

export function renamePaletteColor(
  catalog: SelectableColor[],
  selected: SelectableColor[],
  colorId: string,
  newName: string,
): { catalog: SelectableColor[]; selected: SelectableColor[] } | null {
  const normalizedName = normalizeCustomColorName(newName);

  if (!normalizedName) {
    return null;
  }

  const inCatalog = catalog.some((color) => color.id === colorId);
  const inSelected = selected.some((color) => color.id === colorId);

  if (!inCatalog && !inSelected) {
    return null;
  }

  const applyRename = (color: SelectableColor): SelectableColor =>
    color.id === colorId
      ? { ...color, name: normalizedName, customName: true }
      : color;

  return {
    catalog: inCatalog ? catalog.map(applyRename) : catalog,
    selected: inSelected ? selected.map(applyRename) : selected,
  };
}

export async function copyHexToClipboard(hex: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(normalizeHex(hex));
    return true;
  } catch {
    return false;
  }
}
