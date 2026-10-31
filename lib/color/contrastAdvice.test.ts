import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { buildContrastAdvice } from './contrastAdvice';

describe('buildContrastAdvice', () => {
  it('returns no fixes when the pair already passes', () => {
    const advice = buildContrastAdvice('#111827', '#FFFFFF');

    expect(advice.fixes).toEqual([]);
    expect(advice.progress).toBe(1);
  });

  it('proposes fixes that reach AA for a failing pair', () => {
    const advice = buildContrastAdvice('#9CA3AF', '#E5E7EB');

    expect(advice.fixes.length).toBeGreaterThan(0);

    for (const fix of advice.fixes) {
      const [fg, bg] =
        fix.side === 'foreground' ? [fix.hex, '#E5E7EB'] : ['#9CA3AF', fix.hex];
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    }

    expect(advice.tips.length).toBeGreaterThan(0);
  });
});
