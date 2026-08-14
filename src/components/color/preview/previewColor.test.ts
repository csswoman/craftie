import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '@lib/utils/colorMath';

import { onVividFill, readableInk, vividFill } from './previewColor';

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

describe('preview readable ink', () => {
  const lightLime = '#D2F25C';
  const lightSurface = '#F3F6F4';
  const forest = '#2F5644';

  it('darkens a light lime so it passes AA on a light surface', () => {
    const ink = readableInk(lightLime, lightSurface);

    expect(contrastRatio(ink, lightSurface)).toBeGreaterThanOrEqual(4.5);
    expect(ink).not.toBe(lightLime);
    expect(hueDistance(toOklch(ink)?.h ?? 0, toOklch(lightLime)?.h ?? 0)).toBeLessThanOrEqual(3);
  });

  it('keeps a dark fill that already passes as type', () => {
    expect(readableInk(forest, '#FFFFFF')).toBe('#2F5644');
  });
});
