import { describe, expect, it } from 'vitest';

import { layoutThumbnailSwatches } from './thumbnailLayout';

describe('layoutThumbnailSwatches', () => {
  it('returns an empty array for no colors', () => {
    expect(layoutThumbnailSwatches([], { width: 120, height: 40 })).toEqual([]);
  });

  it('returns an empty array when the canvas has no area', () => {
    expect(layoutThumbnailSwatches(['#fff'], { width: 0, height: 40 })).toEqual([]);
    expect(layoutThumbnailSwatches(['#fff'], { width: 120, height: 0 })).toEqual([]);
  });

  it('spans the full width with no gaps for an even split', () => {
    const rects = layoutThumbnailSwatches(['#a', '#b', '#c', '#d'], {
      width: 120,
      height: 40,
    });

    expect(rects).toHaveLength(4);
    expect(rects[0].x).toBe(0);
    expect(rects[rects.length - 1].x + rects[rects.length - 1].width).toBe(120);
    const totalWidth = rects.reduce((sum, rect) => sum + rect.width, 0);
    expect(totalWidth).toBe(120);
  });

  it('absorbs rounding slack so an uneven split still spans the full width', () => {
    const rects = layoutThumbnailSwatches(['#a', '#b', '#c'], {
      width: 100,
      height: 40,
    });

    expect(rects).toHaveLength(3);
    const totalWidth = rects.reduce((sum, rect) => sum + rect.width, 0);
    expect(totalWidth).toBe(100);
    // Adjacent rects are flush: each start equals the previous end.
    for (let i = 1; i < rects.length; i += 1) {
      expect(rects[i].x).toBe(rects[i - 1].x + rects[i - 1].width);
    }
  });

  it('keeps every swatch full height and carries its hex', () => {
    const rects = layoutThumbnailSwatches(['#112233', '#445566'], {
      width: 80,
      height: 24,
    });

    expect(rects.every((rect) => rect.height === 24 && rect.y === 0)).toBe(true);
    expect(rects.map((rect) => rect.hex)).toEqual(['#112233', '#445566']);
  });
});
