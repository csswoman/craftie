import {
  canToggleColor,
  toggleSelectedColor,
  type SelectableColor,
} from './selectableColors';
import { nameForHex } from './naming';
import { normalizeHex } from './normalizeHex';

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

    const name = nameForHex(normalized, paletteInput, { style: 'creative' });
    const id = color.id.startsWith('image-')
      ? `image-${color.group}-${normalized.slice(1)}`
      : color.id;

    return {
      ...color,
      id,
      hex: normalized,
      name,
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
