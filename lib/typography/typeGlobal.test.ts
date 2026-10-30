import { describe, expect, it } from 'vitest';

import { globalPatchForLevel, globalPatchForRole } from './typeGlobal';
import { buildTypeScaleReadout } from './typeScale';

const sizes = buildTypeScaleReadout(16, 1.25);

describe('globalPatchForRole', () => {
  it('maps weight to the family of the role', () => {
    expect(globalPatchForRole('hero', { weight: 800 }, sizes)).toEqual({ headingWeight: 800 });
    // label sits 100 above the body weight: a 500 label means a 400 body
    expect(globalPatchForRole('label', { weight: 500 }, sizes)).toEqual({ bodyWeight: 400 });
    expect(globalPatchForRole('heading', { weight: 600 }, sizes)).toEqual({ headingWeight: 700 });
  });

  it('removes the role offset so the role lands on the value that was typed', () => {
    // body role has +0.05 leading: typing 1.75 means the slider value is 1.7
    expect(globalPatchForRole('body', { lineHeight: 1.75 }, sizes).spacing).toEqual({ bodyLineHeight: 1.7 });
    // hero has -0.16: typing 1.04 returns the default heading leading
    expect(globalPatchForRole('hero', { lineHeight: 1.04 }, sizes).spacing).toEqual({ headingLineHeight: 1.2 });
    expect(globalPatchForRole('display', { letterSpacing: -0.02 }, sizes).spacing).toEqual({ headingLetterSpacing: -0.03 });
  });

  it('keeps the slider value inside its range', () => {
    expect(globalPatchForRole('heading', { lineHeight: 2.2 }, sizes).spacing).toEqual({ headingLineHeight: 1.8 });
  });

  it('writes sizes to the scale level and clears them when they match the scale', () => {
    expect(globalPatchForRole('body', { size: 18 }, sizes).size).toEqual({ levelId: 'body', value: 18 });
    expect(globalPatchForRole('body', { size: 16 }, sizes).size).toEqual({ levelId: 'body', value: null });
    expect(globalPatchForRole('eyebrow', { size: 12 }, sizes).size).toEqual({ levelId: 'small', value: 12 });
  });
});

describe('globalPatchForLevel', () => {
  it('maps level edits straight to the applied values', () => {
    expect(globalPatchForLevel('h2', true, 25, { weight: 600, lineHeight: 1.3, size: 30 })).toEqual({
      headingWeight: 600,
      spacing: { headingLineHeight: 1.3 },
      size: { levelId: 'h2', value: 30 },
    });
  });
});
