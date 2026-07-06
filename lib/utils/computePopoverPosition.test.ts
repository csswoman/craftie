import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computePopoverPosition } from './computePopoverPosition';

function anchorRect(top: number, left = 100, width = 80, height = 40): DOMRect {
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

describe('computePopoverPosition', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      innerWidth: 1024,
      innerHeight: 768,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('places the popover below the anchor by default', () => {
    const anchor = anchorRect(100);
    const position = computePopoverPosition(anchor);

    expect(position.top).toBe(anchor.bottom + 8);
    expect(position.left).toBeGreaterThanOrEqual(8);
  });

  it('flips above when there is not enough space below', () => {
    const anchor = anchorRect(700);
    const position = computePopoverPosition(anchor);

    expect(position.top).toBeLessThan(anchor.top);
  });
});
