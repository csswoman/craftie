import { describe, expect, it } from 'vitest';

import { lookupNtcColorName } from './ntcNaming';
import { isGenericPaletteName, nameForHex, namePalette } from './naming';

describe('lookupNtcColorName', () => {
  it('uses Name That Color labels instead of hue-bucket creative names', () => {
    expect(lookupNtcColorName('#D4C197')).toBe('Pavlova');
    expect(lookupNtcColorName('#F6D27C')).toBe('Golden Sand');
    expect(lookupNtcColorName('#D4C197')).not.toMatch(/Lime/i);
    expect(lookupNtcColorName('#F6D27C')).not.toMatch(/Sage/i);
  });
});

describe('namePalette', () => {
  it('returns unique names for a palette', () => {
    const colors = [
      { hex: '#BEFEAB' },
      { hex: '#9ADBD6' },
      { hex: '#2C3E50' },
      { hex: '#F7F7F5' },
    ];

    const names = namePalette(colors);
    const values = [...names.values()];

    expect(values).toHaveLength(4);
    expect(new Set(values).size).toBe(4);
    expect(values.every((name) => !isGenericPaletteName(name))).toBe(true);
  });

  it('is stable for the same palette', () => {
    const colors = [{ hex: '#BEFEAB' }, { hex: '#E8D44D' }, { hex: '#2C3E50' }];

    const first = namePalette(colors);
    const second = namePalette(colors);

    expect(first).toEqual(second);
  });

  it('deduplicates when two colors share the same NTC label', () => {
    const colors = [{ hex: '#6402BF' }, { hex: '#7E03B3' }];

    const names = namePalette(colors);
    const values = [...names.values()];

    expect(new Set(values).size).toBe(2);
    expect(values.some((name) => /^Purple( \d+)?$/.test(name))).toBe(true);
  });

  it('names a single color without generic labels', () => {
    const name = nameForHex('#BEFEAB', [{ hex: '#BEFEAB' }]);

    expect(name).not.toMatch(/^(Claro|Intenso|Oscuro) \d+$/);
    expect(name.length).toBeGreaterThan(0);
  });

  it('does not assign duplicate bare names within one palette', () => {
    const palette = [
      { hex: '#87A96B' },
      { hex: '#9CAF88' },
      { hex: '#8A9A5B' },
      { hex: '#78866B' },
    ];

    const names = namePalette(palette);
    const values = [...names.values()];

    expect(new Set(values).size).toBe(values.length);
    expect(values.filter((name) => name === 'Sage')).toHaveLength(0);
  });
});
