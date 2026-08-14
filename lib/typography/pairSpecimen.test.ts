import { describe, expect, it } from 'vitest';

import { specimenForPair } from './pairSpecimen';

describe('specimenForPair', () => {
  it('uses editorial copy when the pair is editorial', () => {
    const specimen = specimenForPair({ character: ['editorial', 'elegant'] });
    expect(specimen.heading).toBe('Historia de marca');
    expect(specimen.body).toContain('titular');
  });

  it('uses technical copy when the pair is technical', () => {
    const specimen = specimenForPair({ character: ['technical'] });
    expect(specimen.heading).toBe('Sistema, no adorno');
  });

  it('prefers editorial over technical when both tags are present', () => {
    const specimen = specimenForPair({ character: ['technical', 'editorial'] });
    expect(specimen.heading).toBe('Historia de marca');
  });

  it('falls back to a shared default when no category matches', () => {
    const specimen = specimenForPair({ character: ['bold'] });
    expect(specimen.heading).toBe('Voz de marca');
  });
});
