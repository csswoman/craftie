import { describe, expect, it } from 'vitest';

import { PREVIEW_LAYOUT_WIDTH_CLASS } from './PreviewView';

describe('PreviewView layout sizing', () => {
  it('uses a shared responsive 1300px frame for every UI layout preview', () => {
    expect(PREVIEW_LAYOUT_WIDTH_CLASS).toBe('max-w-[1300px]');
  });
});
