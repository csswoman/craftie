import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  evaluateContrast,
  evaluatePalette,
  getContrastStatus,
  getWCAGLevel,
  relativeLuminance,
  suggestAccessibleForeground,
} from './contrast';
import { generatePalette } from './formulas';

describe('relativeLuminance', () => {
  it('returns 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });

  it('throws for invalid color input', () => {
    expect(() => relativeLuminance('')).toThrow(/Invalid color input/);
    expect(() => relativeLuminance('not-a-color')).toThrow(/Unable to parse color/);
  });

  it('throws for colors with alpha/transparency', () => {
    expect(() => relativeLuminance('#00000080')).toThrow(/Unsupported alpha\/transparency/);
    expect(() => relativeLuminance('rgba(0, 0, 0, 0.5)')).toThrow(
      /Unsupported alpha\/transparency/,
    );
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
  });

  it('returns 1 for identical colors', () => {
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
  });

  it('is symmetric regardless of color order', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(contrastRatio('#FFFFFF', '#000000'));
  });

  it('matches known reference pairs', () => {
    const pairs: Array<{ foreground: string; background: string; ratio: number }> = [
      { foreground: '#000000', background: '#FFFFFF', ratio: 21 },
      { foreground: '#FFFFFF', background: '#FFFFFF', ratio: 1 },
      { foreground: '#767676', background: '#FFFFFF', ratio: 4.54 },
      { foreground: '#595959', background: '#FFFFFF', ratio: 7 },
      { foreground: '#949494', background: '#FFFFFF', ratio: 3.03 },
    ];

    for (const { foreground, background, ratio } of pairs) {
      expect(contrastRatio(foreground, background)).toBeCloseTo(ratio, 1);
    }
  });

  it('throws for invalid color input', () => {
    expect(() => contrastRatio('invalid', '#FFFFFF')).toThrow(/Unable to parse color/);
    expect(() => contrastRatio('#000000', '')).toThrow(/Invalid color input/);
  });

  it('throws for colors with alpha/transparency', () => {
    expect(() => contrastRatio('#00000080', '#FFFFFF')).toThrow(
      /Unsupported alpha\/transparency/,
    );
    expect(() => contrastRatio('#000000', 'rgba(255, 255, 255, 0.9)')).toThrow(
      /Unsupported alpha\/transparency/,
    );
  });
});

describe('getWCAGLevel', () => {
  describe('normal text', () => {
    it('returns AAA at or above 7', () => {
      expect(getWCAGLevel(7, false)).toBe('AAA');
      expect(getWCAGLevel(10, false)).toBe('AAA');
    });

    it('returns AA between 4.5 and 7', () => {
      expect(getWCAGLevel(4.5, false)).toBe('AA');
      expect(getWCAGLevel(6.9, false)).toBe('AA');
    });

    it('returns fail below 4.5', () => {
      expect(getWCAGLevel(4.49, false)).toBe('fail');
      expect(getWCAGLevel(1, false)).toBe('fail');
    });
  });

  describe('large text', () => {
    it('returns AAA at or above 4.5', () => {
      expect(getWCAGLevel(4.5, true)).toBe('AAA');
      expect(getWCAGLevel(7, true)).toBe('AAA');
    });

    it('returns AA between 3 and 4.5', () => {
      expect(getWCAGLevel(3, true)).toBe('AA');
      expect(getWCAGLevel(4.49, true)).toBe('AA');
    });

    it('returns fail below 3', () => {
      expect(getWCAGLevel(2.99, true)).toBe('fail');
      expect(getWCAGLevel(1, true)).toBe('fail');
    });
  });
});

describe('evaluateContrast', () => {
  it('evaluates black on white as AAA for both text sizes', () => {
    expect(evaluateContrast('#000000', '#FFFFFF')).toEqual({
      ratio: 21,
      normalText: 'AAA',
      largeText: 'AAA',
    });
  });

  it('evaluates mid-gray on white for normal and large text thresholds', () => {
    const result = evaluateContrast('#767676', '#FFFFFF');

    expect(result.ratio).toBeCloseTo(4.54, 1);
    expect(result.normalText).toBe('AA');
    expect(result.largeText).toBe('AAA');
  });

  it('evaluates light gray on white as fail for normal text and AA for large text', () => {
    const result = evaluateContrast('#949494', '#FFFFFF');

    expect(result.ratio).toBeCloseTo(3.03, 1);
    expect(result.normalText).toBe('fail');
    expect(result.largeText).toBe('AA');
  });

  it('evaluates identical colors as fail for both text sizes', () => {
    expect(evaluateContrast('#FFFFFF', '#FFFFFF')).toEqual({
      ratio: 1,
      normalText: 'fail',
      largeText: 'fail',
    });
  });
});

describe('getContrastStatus', () => {
  it('returns pass when normal text meets the target', () => {
    expect(getContrastStatus({ normalText: 'AA', largeText: 'AAA' }, 'AA')).toBe('pass');
    expect(getContrastStatus({ normalText: 'AAA', largeText: 'AAA' }, 'AAA')).toBe('pass');
  });

  it('returns warning when only large text meets the target', () => {
    expect(getContrastStatus({ normalText: 'fail', largeText: 'AA' }, 'AA')).toBe('warning');
    expect(getContrastStatus({ normalText: 'AA', largeText: 'AAA' }, 'AAA')).toBe('warning');
  });

  it('returns fail when neither text size meets the target', () => {
    expect(getContrastStatus({ normalText: 'fail', largeText: 'fail' }, 'AA')).toBe('fail');
    expect(getContrastStatus({ normalText: 'fail', largeText: 'AA' }, 'AAA')).toBe('fail');
  });
});

describe('suggestAccessibleForeground', () => {
  it('returns the original color when it already meets the target', () => {
    const suggestion = suggestAccessibleForeground('#000000', '#FFFFFF', 'AA');

    expect(suggestion).toEqual({
      hex: '#000000',
      ratio: 21,
      normalText: 'AAA',
      deltaL: 0,
    });
  });

  it('darkens a light foreground on a light background for AA', () => {
    const suggestion = suggestAccessibleForeground('#949494', '#FFFFFF', 'AA');

    expect(suggestion).not.toBeNull();
    expect(suggestion!.ratio).toBeGreaterThanOrEqual(4.5);
    expect(suggestion!.hex).not.toBe('#949494');
    expect(suggestion!.normalText).not.toBe('fail');
    expect(Math.abs(suggestion!.deltaL)).toBeGreaterThan(0);
  });

  it('reaches AAA when requested', () => {
    const suggestion = suggestAccessibleForeground('#767676', '#FFFFFF', 'AAA');

    expect(suggestion).not.toBeNull();
    expect(suggestion!.ratio).toBeGreaterThanOrEqual(7);
    expect(suggestion!.normalText).toBe('AAA');
  });

  it('lightens a foreground that is too dark on a dark background', () => {
    const suggestion = suggestAccessibleForeground('#1A1A1A', '#141414', 'AA');

    expect(suggestion).not.toBeNull();
    expect(suggestion!.ratio).toBeGreaterThanOrEqual(4.5);
    expect(suggestion!.deltaL).toBeGreaterThan(0);
  });
});

describe('evaluatePalette', () => {
  const GREEN_SEED = '#2F5644';

  it('returns exactly five semantic pairs for a complete palette', () => {
    const palette = generatePalette([GREEN_SEED]);
    const results = evaluatePalette(palette);

    expect(results).toHaveLength(5);
    expect(results.map((result) => result.pairRole)).toEqual([
      'on-surface/surface',
      'primary/surface',
      'primary/neutral-light',
      'accent/surface',
      'accent/neutral-dark',
    ]);
  });

  it('includes foreground, background tokens, ratio, and WCAG levels per pair', () => {
    const palette = generatePalette([GREEN_SEED]);
    const [first] = evaluatePalette(palette);

    expect(first).toMatchObject({
      pairRole: 'on-surface/surface',
      foreground: { role: 'onSurface', hex: palette.onSurface },
      background: { role: 'surface', hex: palette.surface },
      ratio: expect.any(Number),
      normalText: expect.stringMatching(/^(fail|AA|AAA)$/),
      largeText: expect.stringMatching(/^(fail|AA|AAA)$/),
    });
  });

  it('skips pairs when required roles are missing', () => {
    const results = evaluatePalette({
      primary: '#2F5644',
      accent: '#3D6A8A',
      surface: '#FFFFFF',
      onSurface: '',
      neutralLight: '#F0F0F0',
      neutralDark: '#1A1A1A',
    });

    expect(results.map((result) => result.pairRole)).not.toContain('on-surface/surface');
    expect(results).toHaveLength(4);
  });
});
