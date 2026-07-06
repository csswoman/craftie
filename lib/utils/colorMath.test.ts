import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import {
  adjustLightnessForContrast,
  bestTextOn,
  contrastRatio,
  hexToOklchChannels,
  mix,
  mixColors,
  oklchChannelsToHex,
  readableOn,
  relativeLuminance,
} from './colorMath';

const toOklch = converter('oklch');

describe('colorMath', () => {
  it('computes WCAG relative luminance', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });

  it('computes symmetric contrast ratio', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
    expect(contrastRatio('#FFFFFF', '#000000')).toBe(21);
  });

  it('mixes colors in OKLCH space', () => {
    const midpoint = mixColors('#FFFFFF', '#000000', 0.5);
    expect(midpoint).toMatch(/^#[0-9A-F]{6}$/);
    expect(mix('#FFFFFF', '#000000', 0)).toBe('#FFFFFF');
    expect(mix('#FFFFFF', '#000000', 1)).toBe('#000000');
  });

  it('picks the higher-contrast near tone for text', () => {
    const onLight = bestTextOn('#F7F7F5');
    const onDark = bestTextOn('#1E1E1F');

    expect(contrastRatio(onLight, '#F7F7F5')).toBeGreaterThan(4.5);
    expect(contrastRatio(onDark, '#1E1E1F')).toBeGreaterThan(4.5);
    expect(relativeLuminance(onLight)).toBeLessThan(relativeLuminance('#F7F7F5'));
    expect(relativeLuminance(onDark)).toBeGreaterThan(relativeLuminance('#1E1E1F'));
  });

  it('adjusts OKLCH lightness to reach a target contrast ratio', () => {
    const adjusted = adjustLightnessForContrast('#BBBBBB', '#FFFFFF', 4.5);

    expect(contrastRatio(adjusted, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(adjusted).not.toBe('#BBBBBB');
  });

  it('readableOn preserves hue while meeting contrast on light backgrounds', () => {
    const readable = readableOn('#3366CC', '#F7F7F5');
    const original = toOklch('#3366CC');
    const adjusted = toOklch(readable);

    expect(contrastRatio(readable, '#F7F7F5')).toBeGreaterThanOrEqual(4.5);
    expect(adjusted?.h ?? 0).toBeCloseTo(original?.h ?? 0, 0);
  });

  it('round-trips hex through OKLCH channels within sRGB', () => {
    const channels = hexToOklchChannels('#2F5644');
    const recomposed = oklchChannelsToHex(channels.l, channels.c, channels.h);

    expect(recomposed).toMatch(/^#[0-9A-F]{6}$/);
    expect(recomposed).toBe('#2F5644');
  });

  it('clamps chroma when composing out-of-gamut OKLCH', () => {
    const hex = oklchChannelsToHex(0.7, 0.5, 145);

    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    expect(hexToOklchChannels(hex).c).toBeLessThan(0.5);
  });
});
