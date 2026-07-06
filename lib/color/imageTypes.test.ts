import { describe, expect, it } from 'vitest';

import { resolveImageExtractionOptions } from './imageTypes';

describe('resolveImageExtractionOptions', () => {
  it('fills defaults for omitted options', () => {
    expect(resolveImageExtractionOptions()).toEqual({
      count: 3,
      maxFileSizeMB: 5,
      sampleStep: 10,
    });
  });

  it('respects maxCount when validating count', () => {
    expect(() => resolveImageExtractionOptions({ count: 6 })).toThrow(/between 2 and 5/i);
    expect(resolveImageExtractionOptions({ count: 6, maxCount: 12 }).count).toBe(6);
  });
});
