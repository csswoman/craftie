import { describe, expect, it } from 'vitest';

import {
  colorVisionFilterMatrix,
  remainsDistinctWithColorVisionDeficiency,
  simulateColorVision,
} from './colorVision';

describe('color vision simulation', () => {
  it('simulates both supported red-green deficiencies', () => {
    expect(simulateColorVision('#E53935', 'protanopia')).not.toBe('#E53935');
    expect(simulateColorVision('#43A047', 'deuteranopia')).not.toBe('#43A047');
  });

  it('keeps strongly separated lightness categories distinguishable', () => {
    expect(remainsDistinctWithColorVisionDeficiency('#173F5F', '#F6C85F')).toBe(true);
  });
});

describe('extended color vision modes', () => {
  it('turns grays into themselves and colors into a single luminance', () => {
    expect(simulateColorVision('#808080', 'achromatopsia')).toBe('#808080');
    const gray = simulateColorVision('#E53935', 'achromatopsia');
    expect(gray.slice(1, 3)).toBe(gray.slice(3, 5));
    expect(gray.slice(3, 5)).toBe(gray.slice(5, 7));
  });

  it('simulates tritanopia without changing pure grays', () => {
    expect(simulateColorVision('#2563EB', 'tritanopia')).not.toBe('#2563EB');
    expect(simulateColorVision('#808080', 'tritanopia')).toBe('#808080');
  });

  it('builds a feColorMatrix with 20 values, or null when off', () => {
    expect(colorVisionFilterMatrix('none')).toBeNull();
    const values = colorVisionFilterMatrix('protanopia')!.split(' ');
    expect(values).toHaveLength(20);
    expect(values.slice(15)).toEqual(['0', '0', '0', '1', '0']);
  });
});
