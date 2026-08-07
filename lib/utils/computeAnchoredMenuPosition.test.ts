import { describe, expect, it } from 'vitest';

import { computeAnchoredMenuPosition } from './computeAnchoredMenuPosition';

function anchorRect(top: number, left = 200, width = 40, height = 40): DOMRect {
  return {
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('computeAnchoredMenuPosition', () => {
  it('places the menu below and right-aligned by default', () => {
    const anchor = anchorRect(120);
    const position = computeAnchoredMenuPosition(anchor, { width: 390, height: 844 }, {
      width: 176,
      height: 220,
    });

    expect(position.top).toBe(anchor.bottom + 4);
    expect(position.left).toBe(anchor.right - 176);
  });

  it('flips above when there is not enough space below', () => {
    const anchor = anchorRect(700);
    const menu = { width: 176, height: 220 };
    const position = computeAnchoredMenuPosition(anchor, { width: 390, height: 844 }, menu);

    expect(position.top).toBe(anchor.top - 4 - menu.height);
    expect(position.top + menu.height).toBeLessThanOrEqual(anchor.top);
  });

  it('keeps the menu inside the viewport horizontally', () => {
    const anchor = anchorRect(120, 10, 40, 40);
    const position = computeAnchoredMenuPosition(anchor, { width: 320, height: 640 }, {
      width: 176,
      height: 180,
    });

    expect(position.left).toBeGreaterThanOrEqual(8);
    expect(position.left + 176).toBeLessThanOrEqual(320 - 8);
  });
});
