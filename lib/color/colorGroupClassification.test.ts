import { describe, expect, it } from 'vitest';

import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
} from './colorGroupClassification';

describe('classifyColorToGroup', () => {
  it('classifies high-lightness low-chroma colors as light neutrals', () => {
    expect(classifyColorToGroup('#F7F7F5', DEFAULT_COLOR_GROUP_THRESHOLDS)).toBe('light-neutral');
  });

  it('classifies saturated colors as bold', () => {
    expect(classifyColorToGroup('#9ADBD6', DEFAULT_COLOR_GROUP_THRESHOLDS)).toBe('bold');
  });

  it('classifies low-lightness muted colors as dark neutrals', () => {
    expect(classifyColorToGroup('#2C3E50', DEFAULT_COLOR_GROUP_THRESHOLDS)).toBe('dark-neutral');
  });

  it('treats warm light tans as light neutrals instead of bold', () => {
    expect(classifyColorToGroup('#D4C197', DEFAULT_COLOR_GROUP_THRESHOLDS)).toBe('light-neutral');
  });

  it('treats dark browns as dark neutrals instead of bold', () => {
    expect(classifyColorToGroup('#523F27', DEFAULT_COLOR_GROUP_THRESHOLDS)).toBe('dark-neutral');
  });
});
