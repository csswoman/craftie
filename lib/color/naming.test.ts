import { describe, expect, it } from 'vitest';

import { isGenericPaletteName, nameForHex, namePalette } from './naming';

describe('namePalette', () => {
  it('returns unique creative names for a palette', () => {
    const colors = [
      { hex: '#BEFEAB' },
      { hex: '#9ADBD6' },
      { hex: '#2C3E50' },
      { hex: '#F7F7F5' },
    ];

    const names = namePalette(colors, { style: 'creative' });
    const values = [...names.values()];

    expect(values).toHaveLength(4);
    expect(new Set(values).size).toBe(4);
    expect(values.every((name) => !isGenericPaletteName(name))).toBe(true);
  });

  it('is stable for the same palette', () => {
    const colors = [{ hex: '#BEFEAB' }, { hex: '#E8D44D' }, { hex: '#2C3E50' }];

    const first = namePalette(colors, { style: 'creative' });
    const second = namePalette(colors, { style: 'creative' });

    expect(first).toEqual(second);
  });

  it('names a single color without generic labels', () => {
    const name = nameForHex('#BEFEAB', [{ hex: '#BEFEAB' }], { style: 'creative' });

    expect(name).not.toMatch(/^(Claro|Intenso|Oscuro) \d+$/);
    expect(name.length).toBeGreaterThan(0);
  });

  it('uses blue-family names for muted blues instead of purple labels', () => {
    const palette = [
      { hex: '#6986B8' },
      { hex: '#B8D1E4' },
      { hex: '#D0C1FF' },
      { hex: '#4A473D' },
      { hex: '#EEC87E' },
      { hex: '#87F5B7' },
    ];

    const names = namePalette(palette, { style: 'creative' });

    expect(names.get('#6986B8')).toMatch(/Sky|Ocean|Azure|Lagoon|Periwinkle/i);
    expect(names.get('#6986B8')).not.toMatch(/Orchid|Fuchsia/i);
    expect(names.get('#D0C1FF')).toMatch(/Lilac|Orchid|Plum|Violet|Iris/i);
    expect(names.get('#D0C1FF')).not.toMatch(/Fuchsia/i);
  });
});
