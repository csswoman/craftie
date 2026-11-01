import { describe, expect, it } from 'vitest';

import { deriveTonalScale } from './tonalScale';
import { findOutOfOrderSteps, stepContrast, withLightnessAndChroma } from './tonalScaleEdit';
import { hexToOklchChannels } from '../utils/colorMath';

describe('tonal scale editing helpers', () => {
  it('derived scales are always in order', () => {
    expect(findOutOfOrderSteps(deriveTonalScale('#1F6F54'))).toEqual([]);
    expect(findOutOfOrderSteps(deriveTonalScale('#C2653A'))).toEqual([]);
  });

  it('flags a step that is lighter than the one before it', () => {
    const scale = deriveTonalScale('#1F6F54');
    const broken = { ...scale, 400: scale[200] };
    expect(findOutOfOrderSteps(broken)).toContain(400);
  });

  it('reports contrast against a surface', () => {
    expect(stepContrast('#000000', '#FFFFFF')).toMatchObject({ passesAa: true, passesLarge: true });
    expect(stepContrast('#CCCCCC', '#FFFFFF').passesAa).toBe(false);
  });

  it('changes lightness and chroma but keeps the hue', () => {
    const base = '#1F6F54';
    const next = withLightnessAndChroma(base, 0.8, 0.05);
    expect(hexToOklchChannels(next).l).toBeGreaterThan(hexToOklchChannels(base).l);
    expect(Math.abs(hexToOklchChannels(next).h - hexToOklchChannels(base).h)).toBeLessThan(6);
  });
});
