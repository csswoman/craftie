import type { ExtractedColor } from './imageTypes';
import { normalizeHex } from './normalizeHex';

/**
 * Edits the source colors of an image palette when the user picks colors
 * from the photo. Each edit keeps the other colors, their order and weight,
 * so roles derived from the sources move as little as possible.
 */

/** Same cap as image extraction: more sources only add noise to roles. */
export const MAX_PICKED_SOURCE_COLORS = 12;

/** Replaces the color at `index`, keeping its prominence and rank. */
export function replaceSourceColor(
  colors: readonly ExtractedColor[],
  index: number,
  hex: string,
): ExtractedColor[] {
  const current = colors[index];
  if (!current) {
    return [...colors];
  }

  const next = [...colors];
  next[index] = { ...current, hex: normalizeHex(hex) };
  return next;
}

/**
 * Appends a picked color. It weighs a little less than the lightest source so
 * it does not displace the colors the image is mostly made of. Returns the
 * list unchanged at the cap.
 */
export function addSourceColor(colors: readonly ExtractedColor[], hex: string): ExtractedColor[] {
  if (colors.length >= MAX_PICKED_SOURCE_COLORS) {
    return [...colors];
  }

  const lightest = colors.reduce((min, color) => Math.min(min, color.prominence), 1);
  return [...colors, { hex: normalizeHex(hex), prominence: Math.max(0.01, lightest * 0.9) }];
}

/** Removes the color at `index`; the last remaining color cannot be removed. */
export function removeSourceColor(colors: readonly ExtractedColor[], index: number): ExtractedColor[] {
  if (colors.length <= 1 || index < 0 || index >= colors.length) {
    return [...colors];
  }

  return colors.filter((_, position) => position !== index);
}
