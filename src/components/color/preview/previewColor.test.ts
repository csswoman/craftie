import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@lib/utils/colorMath';

import { onVividFill, vividFill } from './previewColor';

const toOklch = converter('oklch');

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return distance > 180 ? 360 - distance : distance;
}

describe('preview expressive fills', () => {
  it('does not boost or otherwise mutate the source fill', () => {
    expect(vividFill('#A9E7EF', '#F8FAFC')).toBe('#A9E7EF');
  });

  it('derives a hue-related foreground that passes AA', () => {
    const fill = '#A9E7EF';
    const foreground = onVividFill(fill);

    expect(contrastRatio(foreground, fill)).toBeGreaterThanOrEqual(4.5);
    expect(hueDistance(toOklch(foreground)?.h ?? 0, toOklch(fill)?.h ?? 0)).toBeLessThanOrEqual(3);
  });
});
