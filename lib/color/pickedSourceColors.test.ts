import { describe, expect, it } from 'vitest';

import type { ExtractedColor } from './imageTypes';
import {
  addSourceColor,
  MAX_PICKED_SOURCE_COLORS,
  removeSourceColor,
  replaceSourceColor,
} from './pickedSourceColors';

const colors: ExtractedColor[] = [
  { hex: '#112233', prominence: 0.6, rank: 0 },
  { hex: '#AABBCC', prominence: 0.3 },
];

describe('replaceSourceColor', () => {
  it('swaps the hex and keeps weight and rank', () => {
    expect(replaceSourceColor(colors, 0, '#ff0000')).toEqual([
      { hex: '#FF0000', prominence: 0.6, rank: 0 },
      colors[1],
    ]);
  });

  it('ignores an index out of range', () => {
    expect(replaceSourceColor(colors, 5, '#ff0000')).toEqual(colors);
  });
});

describe('addSourceColor', () => {
  it('appends below the lightest source', () => {
    const next = addSourceColor(colors, '#00ff00');
    expect(next).toHaveLength(3);
    expect(next[2]).toEqual({ hex: '#00FF00', prominence: 0.27 });
  });

  it('stops at the cap', () => {
    const full = Array.from({ length: MAX_PICKED_SOURCE_COLORS }, () => colors[0]!);
    expect(addSourceColor(full, '#00ff00')).toHaveLength(MAX_PICKED_SOURCE_COLORS);
  });
});

describe('removeSourceColor', () => {
  it('removes the color at the index', () => {
    expect(removeSourceColor(colors, 0)).toEqual([colors[1]]);
  });

  it('keeps the last color', () => {
    expect(removeSourceColor([colors[0]!], 0)).toEqual([colors[0]]);
  });
});
