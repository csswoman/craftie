import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import {
  deriveTonalScale,
  TONAL_SCALE_STEPS,
  TONAL_SCALE_TEXT_SAFETY,
  TONAL_TEXT_CARRIER_STEPS,
} from './tonalScale';

describe('deriveTonalScale', () => {
  it('varies lightness from light to dark across named steps', () => {
    const scale = deriveTonalScale('#C03A2B');
    const lightness = TONAL_SCALE_STEPS.map((step) => hexToOklchChannels(scale[step]).l);

    expect(lightness[0]).toBeGreaterThan(0.9);
    expect(lightness.at(-1)).toBeLessThan(0.25);

    for (let index = 1; index < lightness.length; index += 1) {
      expect(lightness[index]).toBeLessThan(lightness[index - 1]!);
    }
  });

  it('reduces chroma toward the extremes', () => {
    const scale = deriveTonalScale('#C03A2B');
    const chroma50 = hexToOklchChannels(scale[50]).c;
    const chroma500 = hexToOklchChannels(scale[500]).c;
    const chroma900 = hexToOklchChannels(scale[900]).c;

    expect(chroma50).toBeLessThan(chroma500);
    expect(chroma900).toBeLessThan(chroma500);
  });

  it('documents conservative text-safe bands for light and dark surfaces', () => {
    const scale = deriveTonalScale('#2468C8');

    for (const step of TONAL_SCALE_TEXT_SAFETY.lightSurface) {
      expect(contrastRatio(scale[step], '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    }

    for (const step of TONAL_SCALE_TEXT_SAFETY.darkSurface) {
      expect(contrastRatio(scale[step], '#151515')).toBeGreaterThanOrEqual(4.5);
    }

    expect(TONAL_TEXT_CARRIER_STEPS).toEqual([500, 600]);
  });
});
