import { describe, expect, it } from 'vitest';

import { parseTypeLevelOverrides, patchTypeLevelOverrides } from './typeLevels';
import { buildSpecimenLevels } from './typeScalePreview';

describe('type level overrides', () => {
  it('patches, clamps and clears', () => {
    const next = patchTypeLevelOverrides({}, 'h1', { weight: 640, lineHeight: 5 });
    expect(next.h1).toEqual({ weight: 600, lineHeight: 2.2 });
    expect(patchTypeLevelOverrides(next, 'h1', { weight: undefined, lineHeight: undefined })).toEqual({});
  });

  it('drops unsafe ids, sizes and non-numbers when parsing', () => {
    expect(
      parseTypeLevelOverrides({ h1: { weight: 500, size: 40 }, '__proto__': { weight: 500 }, 'Bad Id': { weight: 500 }, h2: { weight: 'x' } }),
    ).toEqual({ h1: { weight: 500 } });
  });

  it('feeds the specimen levels', () => {
    const levels = buildSpecimenLevels({
      base: 16,
      ratio: 1.25,
      largerSteps: 0,
      smallerSteps: 0,
      overrides: {},
      levelOverrides: { body: { lineHeight: 1.8, weight: 500 } },
      headingWeight: 700,
      bodyWeight: 400,
      spacing: { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
    });
    const body = levels.find((level) => level.id === 'body')!;
    expect(body).toMatchObject({ lineHeight: 1.8, weight: 500 });
    expect(body.overridden).toEqual({ size: false, weight: true, lineHeight: true, letterSpacing: false });
  });
});
