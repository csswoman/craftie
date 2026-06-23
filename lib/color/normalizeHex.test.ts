import { describe, expect, it } from 'vitest';

import { isStrictHex, isValidOpaqueHex, normalizeHex } from './normalizeHex';

describe('normalizeHex', () => {
  it('normalizes hex strings to uppercase #RRGGBB', () => {
    expect(normalizeHex('#2f5644')).toBe('#2F5644');
    expect(normalizeHex('  #abc  ')).toBe('#AABBCC');
  });

  it('normalizes named colors', () => {
    expect(normalizeHex('white')).toBe('#FFFFFF');
    expect(normalizeHex('black')).toBe('#000000');
  });

  it('throws for invalid input', () => {
    expect(() => normalizeHex('')).toThrow(/Invalid color input/);
    expect(() => normalizeHex('not-a-color')).toThrow(/Unable to parse/);
    expect(() => normalizeHex('#00000080')).toThrow(/Unsupported alpha/);
  });

  it('validates opaque hex via isValidOpaqueHex', () => {
    expect(isValidOpaqueHex('#2F5644')).toBe(true);
    expect(isValidOpaqueHex('rgba(0,0,0,0.5)')).toBe(false);
  });

  it('validates strict #RRGGBB via isStrictHex', () => {
    expect(isStrictHex('#2F5644')).toBe(true);
    expect(isStrictHex('#abc')).toBe(false);
    expect(isStrictHex('white')).toBe(false);
    expect(isStrictHex('#GGGGGG')).toBe(false);
  });
});
