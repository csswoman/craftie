/**
 * Pure layout math for palette thumbnails. Computes the rectangle for each
 * swatch in a horizontal strip so the browser canvas adapter only has to draw
 * the fills. Kept framework- and browser-agnostic (no canvas / DOM) so it can
 * be unit-tested in isolation; the actual drawing lives in
 * `src/lib/browser/paletteThumbnail.ts`.
 */

export type ThumbnailRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  hex: string;
};

export type ThumbnailLayoutOptions = {
  width: number;
  height: number;
};

/**
 * Lay out swatch rectangles across the full thumbnail width. Each swatch gets
 * an equal share; rounding slack is folded into the last rect so the strip
 * always spans the whole width with no sub-pixel gap. Returns an empty array
 * when there are no colors or the canvas has no area.
 */
export function layoutThumbnailSwatches(
  hexes: string[],
  { width, height }: ThumbnailLayoutOptions,
): ThumbnailRect[] {
  if (hexes.length === 0) return [];
  if (width <= 0 || height <= 0) return [];

  const count = hexes.length;

  return hexes.map((hex, index) => {
    const start = Math.round((index * width) / count);
    const end = Math.round(((index + 1) * width) / count);

    return {
      x: start,
      y: 0,
      width: end - start,
      height,
      hex,
    };
  });
}
