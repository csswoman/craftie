import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { deriveOnTokenHexForFill } from './pairedOnToken';

describe('deriveOnTokenHexForFill', () => {
  it('returns dark text for a light fill', () => {
    const fill = '#61C7CD';
    const on = deriveOnTokenHexForFill(fill);

    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(4.5);
    expect(on.toUpperCase()).not.toBe('#FFFFFF');
  });

  it('returns light text for a dark fill', () => {
    const fill = '#1C4B8E';
    const on = deriveOnTokenHexForFill(fill);

    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(4.5);
    expect(on.toUpperCase()).not.toBe('#111111');
  });
});
