import { describe, expect, it } from 'vitest';

import {
  getColorDetails,
  getColorHarmonies,
  getColorShades,
  getNamedColorShades,
  getSimilarNamedColors,
} from './colorDetails';

describe('colorDetails', () => {
  it('returns six harmony groups with expected offsets', () => {
    const harmonies = getColorHarmonies('#345B46');

    expect(harmonies).toHaveLength(6);
    expect(harmonies.find((entry) => entry.type === 'analogous')?.colors).toHaveLength(3);
    expect(harmonies.find((entry) => entry.type === 'complementary')?.colors).toHaveLength(2);
    expect(harmonies.find((entry) => entry.type === 'square')?.colors).toHaveLength(4);
  });

  it('builds a ten-step shade scale by default', () => {
    const shades = getColorShades('#345B46');

    expect(shades).toHaveLength(10);
    expect(new Set(shades).size).toBeGreaterThan(1);
  });

  it('returns up to five similar named colors sorted by distance', () => {
    const similar = getSimilarNamedColors('#345B46', 5);

    expect(similar.length).toBeLessThanOrEqual(5);
    expect(similar.every((entry) => entry.name.length > 0)).toBe(true);
    expect(similar.every((entry) => entry.distance >= 0)).toBe(true);

    for (let index = 1; index < similar.length; index += 1) {
      expect(similar[index]!.distance).toBeGreaterThanOrEqual(similar[index - 1]!.distance);
    }
  });

  it('returns named shade steps for overlay display', () => {
    const shades = getNamedColorShades('#345B46', 10);

    expect(shades).toHaveLength(10);
    expect(shades.every((shade) => shade.name.length > 0)).toBe(true);
    expect(new Set(shades.map((shade) => shade.name)).size).toBe(10);
  });

  it('combines all detail sections with a friendly name', () => {
    const details = getColorDetails('#345B46');

    expect(details.hex).toBe('#345B46');
    expect(details.name.length).toBeGreaterThan(0);
    expect(details.harmonies).toHaveLength(6);
    expect(details.shades).toHaveLength(10);
    expect(details.similarColors.length).toBeGreaterThan(0);
  });
});
