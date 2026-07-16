import { describe, expect, it } from 'vitest';

import type { ColorFitness } from './colorFitness';
import { buildDataSeriesProfile } from './dataSeriesProfile';

const fitness: ColorFitness = {
  asText: { ok: false, ratio: 3.4 },
  asFill: { ok: true, ratio: 5.2 },
  asAccent: { ok: true },
  asSurface: { ok: false, ratio: 2.1 },
  asData: { ok: false, ratio: 3.4 },
  bestUse: 'fill',
};

describe('data series profile', () => {
  it('resolves axes, ratios and the verdict once in the color engine', () => {
    const profile = buildDataSeriesProfile({
      fitness,
      origin: 'source',
      hue: 189.6,
      separation: { minHue: 18, minLightness: 0.12 },
    });

    expect(profile.origin).toBe('fuente');
    expect(profile.hue).toBe(190);
    expect(profile.axes).toEqual({
      text: 'mid', fill: 'ok', accent: 'ok', surface: 'bad', data: 'mid',
    });
    expect(profile.verdict).toBe('fill');
    expect(profile.verdictLabel).toBe('Mejor: fill');
    expect(profile.separation.note).toContain('confundirse');
  });

  it('marks a data-safe candidate as the strong option', () => {
    const profile = buildDataSeriesProfile({
      fitness: { ...fitness, asData: { ok: true, ratio: 4.8 }, bestUse: 'data' },
      origin: 'derived',
      hue: 42,
      separation: { minHue: null, minLightness: null },
    });

    expect(profile.verdict).toBe('data');
    expect(profile.verdictLabel).toBe('Datos ✓');
    expect(profile.separation.deltaHue).toBe(0);
  });
});
