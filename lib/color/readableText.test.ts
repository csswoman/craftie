import { describe, expect, it } from 'vitest';

import { getReadableTextChoice, pickReadableTextColor } from './readableText';

describe('pickReadableTextColor', () => {
  it('uses dark text on light backgrounds', () => {
    expect(pickReadableTextColor('#FFFFFF')).toBe('#1A1C1E');
    expect(pickReadableTextColor('#FFE8D9')).toBe('#1A1C1E');
    expect(pickReadableTextColor('#F7F7F5')).toBe('#1A1C1E');
  });

  it('falls back to pure black on mid-tones where the soft dark text misses AA', () => {
    // Copper: white is 4.37:1, #1A1C1E is 4.24:1, black is above 5:1.
    expect(pickReadableTextColor('#C2653A')).toBe('#000000');
    expect(getReadableTextChoice('#C2653A').ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('uses light text on dark backgrounds', () => {
    expect(pickReadableTextColor('#121416')).toBe('#FFFFFF');
    expect(pickReadableTextColor('#195575')).toBe('#FFFFFF');
  });
});
