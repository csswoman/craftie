import { describe, expect, it } from 'vitest';

import {
  applyCustomFamilyToRole,
  createCustomFont,
  parseCustomFontsSession,
  upsertCustomFont,
} from './customFonts';
import type { AppliedTypography } from './typeState';

const baseApplied: AppliedTypography = {
  catalogPairId: 'pair-a',
  headingFamily: 'Lora',
  bodyFamily: 'Inter',
  headingWeight: 600,
  bodyWeight: 400,
  headingClassification: 'serif',
  bodyClassification: 'sans-serif',
};

describe('customFonts', () => {
  it('applies a custom family to heading and clears catalog id', () => {
    const next = applyCustomFamilyToRole(baseApplied, '  Space Grotesk ', 'heading');

    expect(next).toEqual({
      ...baseApplied,
      catalogPairId: null,
      headingFamily: 'Space Grotesk',
    });
  });

  it('applies a custom family to body only', () => {
    const next = applyCustomFamilyToRole(baseApplied, 'Work Sans', 'body');

    expect(next.bodyFamily).toBe('Work Sans');
    expect(next.headingFamily).toBe('Lora');
    expect(next.catalogPairId).toBeNull();
  });

  it('upserts custom fonts by id', () => {
    const first = createCustomFont({ family: 'Inter', source: 'google' });
    const second = createCustomFont({ family: 'Inter', source: 'google', fileName: 'skip' });
    const list = upsertCustomFont([first], second);

    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(first.id);
  });

  it('parses session payload and drops invalid entries', () => {
    const raw = JSON.stringify([
      { family: 'Cabin', source: 'google' },
      { family: '', source: 'google' },
      { family: 'LocalDisplay', source: 'local', fileName: 'x.woff2' },
      { nope: true },
    ]);

    expect(parseCustomFontsSession(raw)).toEqual([
      createCustomFont({ family: 'Cabin', source: 'google' }),
      createCustomFont({ family: 'LocalDisplay', source: 'local', fileName: 'x.woff2' }),
    ]);
  });
});
