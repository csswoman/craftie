import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { classifyPalette } from './paletteClassification';
import { deriveForegroundForBackground } from './pairedForeground';

const toOklch = converter('oklch');

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return distance > 180 ? 360 - distance : distance;
}

describe('palette classification and paired foregrounds', () => {
  it('recognizes a weighted pastel image palette', () => {
    const result = classifyPalette([
      { hex: '#B6E4E6', prominence: 0.4 },
      { hex: '#EDC3DB', prominence: 0.3 },
      { hex: '#D0C4F4', prominence: 0.2 },
      { hex: '#89DFE7', prominence: 0.1 },
    ]);

    expect(result.type).toBe('pastel');
    expect(result.averageLightness).toBeGreaterThan(0.8);
  });

  it('changes only foreground lightness and keeps a cyan hue trace', () => {
    const background = '#B6E4E6';
    const foreground = deriveForegroundForBackground(background);
    const backgroundChannels = toOklch(background)!;
    const foregroundChannels = toOklch(foreground.hex)!;

    expect(contrastRatio(foreground.hex, background)).toBeGreaterThanOrEqual(4.5);
    expect(hueDistance(foregroundChannels.h ?? 0, backgroundChannels.h ?? 0)).toBeLessThanOrEqual(3);
    expect(foregroundChannels.c ?? 0).toBeGreaterThanOrEqual(0.018);
    expect(foreground.hex).not.toBe('#111111');
  });
});
