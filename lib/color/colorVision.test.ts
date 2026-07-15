import { describe, expect, it } from 'vitest';

import { remainsDistinctWithColorVisionDeficiency, simulateColorVision } from './colorVision';

describe('color vision simulation', () => {
  it('simulates both supported red-green deficiencies', () => {
    expect(simulateColorVision('#E53935', 'protanopia')).not.toBe('#E53935');
    expect(simulateColorVision('#43A047', 'deuteranopia')).not.toBe('#43A047');
  });

  it('keeps strongly separated lightness categories distinguishable', () => {
    expect(remainsDistinctWithColorVisionDeficiency('#173F5F', '#F6C85F')).toBe(true);
  });
});
