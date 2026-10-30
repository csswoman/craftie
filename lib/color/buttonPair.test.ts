import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { isUsableButtonPair, pickButtonPair, softFill } from './buttonPair';

describe('pickButtonPair', () => {
  const ink = { fill: '#1a1a1a', on: '#ffffff' };

  it('keeps the first pair that passes both checks', () => {
    const brand = { fill: '#1d4ed8', on: '#ffffff' };
    expect(pickButtonPair([brand], '#ffffff', ink)).toEqual(brand);
  });

  it('skips a fill that disappears into its surface', () => {
    // a primary button on a primary hero: same color, no boundary
    const onHero = { fill: '#1d4ed8', on: '#ffffff' };
    const inverse = { fill: '#ffffff', on: '#1d4ed8' };
    expect(pickButtonPair([onHero, inverse], '#1d4ed8', ink)).toEqual(inverse);
  });

  it('skips a pair whose label fails 4.5:1', () => {
    const weak = { fill: '#7dd3fc', on: '#ffffff' };
    expect(isUsableButtonPair(weak, '#ffffff')).toBe(false);
    expect(pickButtonPair([weak], '#ffffff', ink)).toEqual(ink);
  });
});

describe('softFill', () => {
  it('returns an opaque color between the surface and the color', () => {
    const tinted = softFill('#1d4ed8', '#ffffff', 0.12);
    expect(tinted).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrastRatio(tinted, '#ffffff')).toBeGreaterThan(1);
    expect(contrastRatio(tinted, '#ffffff')).toBeLessThan(contrastRatio('#1d4ed8', '#ffffff'));
  });
});
