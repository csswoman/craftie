import { describe, expect, it } from 'vitest';

import {
  TYPE_SCALE_RATIO_OPTIONS,
  buildTypeScaleReadout,
  typeScaleSize,
} from './typeScale';

describe('typeScaleSize', () => {
  it('computes major third steps for default 16 / 1.25', () => {
    expect(typeScaleSize(16, 1.25, 3)).toBe(31);
    expect(typeScaleSize(16, 1.25, 2)).toBe(25);
    expect(typeScaleSize(16, 1.25, 1)).toBe(20);
    expect(typeScaleSize(16, 1.25, 0)).toBe(16);
    expect(typeScaleSize(16, 1.25, -1)).toBe(13);
  });
});

describe('buildTypeScaleReadout', () => {
  it('returns the five product tokens for defaults', () => {
    expect(buildTypeScaleReadout(16, 1.25)).toEqual({
      h1: 31,
      h2: 25,
      h3: 20,
      body: 16,
      small: 13,
    });
  });
});

describe('TYPE_SCALE_RATIO_OPTIONS', () => {
  it('uses human-readable modular-scale names', () => {
    expect(TYPE_SCALE_RATIO_OPTIONS.map((option) => option.label)).toEqual([
      'Menor',
      'Mayor',
      'Cuarta',
    ]);
  });
});
