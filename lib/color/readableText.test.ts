import { describe, expect, it } from 'vitest';

import { pickReadableTextColor } from './readableText';

describe('pickReadableTextColor', () => {
  it('uses dark text on light backgrounds', () => {
    expect(pickReadableTextColor('#FFFFFF')).toBe('#1A1C1E');
    expect(pickReadableTextColor('#FFE8D9')).toBe('#1A1C1E');
    expect(pickReadableTextColor('#F7F7F5')).toBe('#1A1C1E');
  });

  it('uses light text on dark backgrounds', () => {
    expect(pickReadableTextColor('#121416')).toBe('#FFFFFF');
    expect(pickReadableTextColor('#195575')).toBe('#FFFFFF');
  });
});
