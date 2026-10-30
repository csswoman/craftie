import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';

import {
  buildSpecimenLevels,
  buildTypeScalePalette,
  buildTypeScaleRowTone,
  typeScaleIndexProgress,
  typeScaleRowPaddingY,
  typeScaleSizeProgress,
} from './typeScalePreview';

const PALETTE = {
  fondo: '#F4FBFB',
  superficie: '#B7E4E2',
  texto: '#1A2F38',
  borde: '#8FBFBC',
};

describe('typeScaleSizeProgress', () => {
  it('maps the largest size to the start of the ramp', () => {
    expect(typeScaleSizeProgress(49, 13, 49)).toBe(0);
  });

  it('maps the smallest size to the end of the ramp', () => {
    expect(typeScaleSizeProgress(13, 13, 49)).toBe(1);
  });
});

describe('typeScaleIndexProgress', () => {
  it('keeps display at the heavy end of the ramp', () => {
    expect(typeScaleIndexProgress(0, 10)).toBe(0);
  });

  it('separates h1 from display more than a linear first step', () => {
    const linear = 1 / 9;
    const curved = typeScaleIndexProgress(1, 10);

    expect(curved).toBeGreaterThan(linear);
    expect(curved).toBeGreaterThan(0.22);
    expect(curved).toBeLessThan(0.45);
  });

  it('reaches the light end on the last row', () => {
    expect(typeScaleIndexProgress(9, 10)).toBe(1);
  });
});

describe('typeScaleRowPaddingY', () => {
  it('gives display more vertical padding than small', () => {
    expect(typeScaleRowPaddingY(0)).toBe(32);
    expect(typeScaleRowPaddingY(1)).toBe(16);
    expect(typeScaleRowPaddingY(0)).toBeGreaterThan(typeScaleRowPaddingY(0.5));
  });
});

describe('buildTypeScaleRowTone', () => {
  const top = buildTypeScaleRowTone({
    ...PALETTE,
    progress: 0,
    specimenIsLarge: true,
  });
  const mid = buildTypeScaleRowTone({
    ...PALETTE,
    progress: typeScaleIndexProgress(1, 10),
    specimenIsLarge: true,
  });
  const bottom = buildTypeScaleRowTone({
    ...PALETTE,
    progress: 1,
    specimenIsLarge: false,
  });

  it('makes the top row darker than the bottom row', () => {
    expect(hexToOklchChannels(top.background).l).toBeLessThan(hexToOklchChannels(bottom.background).l);
    expect(hexToOklchChannels(top.ink).l).toBeLessThan(hexToOklchChannels(bottom.ink).l);
  });

  it('separates display ink from h1 ink', () => {
    expect(top.ink).not.toBe(mid.ink);
    expect(hexToOklchChannels(top.ink).l).toBeLessThan(hexToOklchChannels(mid.ink).l);
  });

  it('keeps specimen and muted copy above WCAG floors', () => {
    expect(contrastRatio(top.ink, top.background)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(bottom.ink, bottom.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(top.muted, top.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(bottom.muted, bottom.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('buildTypeScalePalette', () => {
  it('keeps ink and muted text readable on the page background', () => {
    for (const [fondo, texto] of [['#ffffff', '#222222'], ['#10141a', '#e8e8e8'], ['#f4efe6', '#8a8a8a']] as const) {
      const palette = buildTypeScalePalette({ fondo, texto, borde: '#cccccc' });
      expect(palette.background).toBe(fondo);
      expect(contrastRatio(palette.ink, fondo)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(palette.muted, fondo)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('buildSpecimenLevels', () => {
  const input = {
    base: 16,
    ratio: 1.25,
    largerSteps: 1,
    smallerSteps: 1,
    overrides: { h1: 40, body: null },
    headingWeight: 700,
    bodyWeight: 400,
    spacing: { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
  };

  it('applies overrides, weights and spacing per role', () => {
    const levels = buildSpecimenLevels(input);
    const byId = Object.fromEntries(levels.map((level) => [level.id, level]));
    expect(byId.h1).toMatchObject({ size: 40, weight: 700, lineHeight: 1.2, letterSpacing: -0.02 });
    expect(byId.body).toMatchObject({ size: 16, weight: 400, lineHeight: 1.5, isHeading: false });
  });

  it('includes the extra larger and smaller steps', () => {
    const ids = buildSpecimenLevels(input).map((level) => level.id);
    expect(ids[0]).toBe('display-2');
    expect(ids.at(-1)).toBe('micro-1');
  });
});
