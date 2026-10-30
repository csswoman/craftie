import { normalizeHex } from './normalizeHex';
import { createSelectableColorFromHex } from './paletteOrder';
import {
  SELECTABLE_COLORS,
  sortSelectedColors,
  type SelectableColor,
} from './selectableColors';

/**
 * Builds the "source colors" catalog for a list of HEX values.
 *
 * HEX values that match a curated color reuse its curated name and group; any
 * other valid HEX (for example one typed by the user) becomes a custom source
 * color so it is never silently dropped. Invalid values are skipped.
 */
export function buildSourceCatalogFromHexes(hexes: readonly string[]): SelectableColor[] {
  const catalog: SelectableColor[] = [];
  const seenHexes = new Set<string>();

  for (const hex of hexes) {
    let normalized: string;
    try {
      normalized = normalizeHex(hex);
    } catch {
      continue;
    }
    if (seenHexes.has(normalized)) continue;
    seenHexes.add(normalized);

    const curated = SELECTABLE_COLORS.find((entry) => entry.hex === normalized);
    catalog.push(curated ?? createSelectableColorFromHex(normalized));
  }

  return sortSelectedColors(catalog);
}
