import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';
import { counterpartRoleColorForTheme, oppositeTheme } from './themeCounterpartColor';

describe('themeCounterpartColor', () => {
  it('maps light text to a light-on-dark counterpart', () => {
    const lightText = '#2A1F22';
    const darkText = counterpartRoleColorForTheme(lightText, 'texto', 'dark', {
      fondoHex: '#1A1520',
      superficieHex: '#221A28',
    });

    expect(hexToOklchChannels(darkText).l).toBeGreaterThan(0.7);
    expect(contrastRatio(darkText, '#1A1520')).toBeGreaterThanOrEqual(4.5);
  });

  it('maps light fondo to a dark fondo keeping hue', () => {
    const lightFondo = '#F9EFF2';
    const darkFondo = counterpartRoleColorForTheme(lightFondo, 'fondo', 'dark');
    const lightHue = hexToOklchChannels(lightFondo).h;
    const darkHue = hexToOklchChannels(darkFondo).h;

    expect(hexToOklchChannels(darkFondo).l).toBeLessThan(0.3);
    expect(Math.abs(lightHue - darkHue)).toBeLessThan(8);
  });

  it('maps a light secondary fill to a brighter dark-mode fill', () => {
    const lightFill = '#1C4B8E';
    const darkFill = counterpartRoleColorForTheme(lightFill, 'secundario', 'dark');

    expect(hexToOklchChannels(darkFill).l).toBeGreaterThan(hexToOklchChannels(lightFill).l);
    expect(hexToOklchChannels(darkFill).h).toBeCloseTo(hexToOklchChannels(lightFill).h, 0);
  });

  it('returns the opposite theme id', () => {
    expect(oppositeTheme('light')).toBe('dark');
    expect(oppositeTheme('dark')).toBe('light');
  });
});
