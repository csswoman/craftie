/**
 * Browser adapter that renders a small palette thumbnail to a canvas and
 * returns a PNG data URL. All canvas access lives here; the rectangle layout
 * math is the pure, tested helper in `@lib/studio/thumbnailLayout`. Returns
 * `null` (never throws) when there are no colors or the canvas is unavailable,
 * so callers can fall back to a plain placeholder.
 */

import { layoutThumbnailSwatches } from '@lib/studio/thumbnailLayout';

const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 48;

/**
 * Draw a horizontal strip of swatches for the given hex colors and return the
 * result as a data URL. `hexes` is typically the snapshot's extracted colors.
 */
export function renderPaletteThumbnail(hexes: string[]): string | null {
  if (hexes.length === 0) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const rects = layoutThumbnailSwatches(hexes, {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
    });

    for (const rect of rects) {
      ctx.fillStyle = rect.hex;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
