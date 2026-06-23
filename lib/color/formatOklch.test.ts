import { describe, expect, it } from 'vitest';

import { summarizeOklch } from './formatOklch';

describe('summarizeOklch', () => {
  it('formats a hex color as a compact OKLCH summary', () => {
    const summary = summarizeOklch('#2F5644');

    expect(summary).toMatch(/^L \d+\.\d{2} · C \d+\.\d{3} · H \d+°$/);
  });

  it('returns a placeholder for unparseable input', () => {
    expect(summarizeOklch('not-a-color')).toBe('—');
  });
});
