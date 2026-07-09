import { describe, expect, it } from 'vitest';

import { DEFAULT_FONT_PAIR, resolveActiveFontPair } from './activePairing';
import type { FontPair } from './pairings';

function pair(id: string): FontPair {
  return {
    ...DEFAULT_FONT_PAIR,
    id,
    displayName: id,
  };
}

describe('activePairing', () => {
  it('uses the selected pair before recommendations or defaults', () => {
    const selected = pair('selected');
    const recommended = pair('recommended');

    expect(resolveActiveFontPair(selected, [recommended])).toBe(selected);
  });

  it('falls back to the first recommended pair and then the Craftie default', () => {
    const recommended = pair('recommended');

    expect(resolveActiveFontPair(null, [recommended])).toBe(recommended);
    expect(resolveActiveFontPair(null, [])).toBe(DEFAULT_FONT_PAIR);
  });
});
