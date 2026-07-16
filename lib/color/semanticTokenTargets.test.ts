import { describe, expect, it } from 'vitest';

import { getPairedOnTokenForFill } from './semanticTokenTargets';

describe('getPairedOnTokenForFill', () => {
  it('maps expressive fills to on tokens', () => {
    expect(getPairedOnTokenForFill('secondary')).toBe('on-secondary');
    expect(getPairedOnTokenForFill('primary-500')).toBe('on-primary-500');
  });

  it('returns null for tokens without an on pair', () => {
    expect(getPairedOnTokenForFill('border')).toBeNull();
    expect(getPairedOnTokenForFill('on-primary')).toBeNull();
  });
});
