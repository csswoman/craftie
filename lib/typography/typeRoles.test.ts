import { describe, expect, it } from 'vitest';

import { buildGoogleFontsUrl } from './googleFonts';
import { buildTypeScaleReadout } from './typeScale';
import {
  collectRoleWeights,
  parseTypeRoleOverrides,
  patchTypeRoleOverrides,
  resolveTypeRole,
  resolveTypeRoles,
  typeRoleCssVariables,
  validateTypeRoles,
  withRoleWeights,
  type TypeRoleContext,
} from './typeRoles';
import { FONT_PAIRS } from './pairings';

const context: TypeRoleContext = {
  headingWeight: 700,
  bodyWeight: 400,
  sizes: buildTypeScaleReadout(16, 1.25),
  spacing: { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
};

describe('resolveTypeRole defaults', () => {
  it('reproduces the original preview type roles', () => {
    expect(resolveTypeRole('hero', context)).toMatchObject({ weight: 700, size: 31, lineHeight: 1.04, letterSpacing: -0.02 });
    expect(resolveTypeRole('display', context)).toMatchObject({ size: 25, lineHeight: 1.05, letterSpacing: -0.01 });
    expect(resolveTypeRole('heading', context)).toMatchObject({ size: 20, lineHeight: 1.2, letterSpacing: -0.006 });
    expect(resolveTypeRole('body', context)).toMatchObject({ weight: 400, size: 16, lineHeight: 1.55, letterSpacing: 0 });
    expect(resolveTypeRole('title', context)).toMatchObject({ lineHeight: 1.35 });
    expect(resolveTypeRole('caption', context)).toMatchObject({ size: 13, lineHeight: 1.45 });
    expect(resolveTypeRole('eyebrow', context)).toMatchObject({ lineHeight: 1.3, letterSpacing: 0.06, uppercase: true });
  });

  it('gives each role its own weight from the two pair weights', () => {
    const weight = (id: Parameters<typeof resolveTypeRole>[0]) => resolveTypeRole(id, context).weight;
    expect([weight('hero'), weight('display'), weight('heading')]).toEqual([700, 700, 600]);
    expect([weight('body'), weight('caption'), weight('title'), weight('label'), weight('button')]).toEqual([400, 400, 500, 500, 600]);
  });

  it('sets the brand role in the heading font at body size', () => {
    expect(resolveTypeRole('brand', context)).toMatchObject({
      family: 'heading',
      weight: 600,
      size: 16,
      lineHeight: 1.25,
      letterSpacing: 0,
    });
  });

  it('follows the spacing sliders and fine-tuned scale sizes', () => {
    const resolved = resolveTypeRole('body', {
      ...context,
      spacing: { ...context.spacing, bodyLineHeight: 1.7 },
      sizeOverrides: { body: 18 },
    });
    expect(resolved.lineHeight).toBe(1.75);
    expect(resolved.size).toBe(18);
  });

  it('lets a per-role override win and reports it', () => {
    const resolved = resolveTypeRole('label', {
      ...context,
      overrides: { label: { weight: 600, size: 14 } },
    });
    expect(resolved).toMatchObject({ weight: 600, size: 14 });
    expect(resolved.overridden).toEqual({ weight: true, size: true, lineHeight: false, letterSpacing: false });
  });
});

describe('patchTypeRoleOverrides', () => {
  it('clamps values and snaps weights to hundreds', () => {
    const next = patchTypeRoleOverrides({}, 'body', { weight: 560, size: 400, lineHeight: 0.1 });
    expect(next.body).toEqual({ weight: 600, size: 120, lineHeight: 0.8 });
  });

  it('clears fields with undefined and drops empty roles', () => {
    const withValue = patchTypeRoleOverrides({}, 'body', { weight: 500 });
    expect(patchTypeRoleOverrides(withValue, 'body', { weight: undefined })).toEqual({});
  });
});

describe('parseTypeRoleOverrides', () => {
  it('ignores unknown roles, non-numbers and non-objects', () => {
    expect(parseTypeRoleOverrides(null)).toEqual({});
    expect(parseTypeRoleOverrides([])).toEqual({});
    expect(
      parseTypeRoleOverrides({ nope: { weight: 500 }, body: { weight: '500', size: 18, extra: 1 } }),
    ).toEqual({ body: { size: 18 } });
  });
});

describe('weights and loading', () => {
  it('collects the distinct weights per family', () => {
    const roles = resolveTypeRoles({ ...context, overrides: { label: { weight: 600 }, caption: { weight: 600 } } });
    expect(collectRoleWeights(roles)).toEqual({ heading: [600, 700], body: [400, 500, 600] });
  });

  it('requests role weights from Google Fonts', () => {
    const pair = withRoleWeights(FONT_PAIRS[0]!, { heading: [800], body: [300] });
    const url = buildGoogleFontsUrl([pair]);
    expect(decodeURIComponent(url)).toContain('800');
    expect(decodeURIComponent(url)).toContain('300');
  });
});

describe('validateTypeRoles', () => {
  it('passes the defaults', () => {
    expect(validateTypeRoles(resolveTypeRoles(context))).toEqual([]);
  });

  it('flags unreadable sizes, leading, tracking and too many weights', () => {
    const roles = resolveTypeRoles({
      ...context,
      overrides: {
        caption: { size: 10 },
        body: { lineHeight: 1.1 },
        heading: { letterSpacing: -0.05 },
        title: { weight: 500 },
        label: { weight: 600 },
        eyebrow: { weight: 300 },
      },
    });
    const codes = validateTypeRoles(roles).map((warning) => warning.code);
    expect(codes).toEqual(expect.arrayContaining(['size-small', 'tight-leading', 'tight-tracking', 'many-weights']));
  });
});

describe('typeRoleCssVariables', () => {
  it('exposes weight, size, leading and tracking per role', () => {
    const variables = typeRoleCssVariables(resolveTypeRoles(context));
    expect(variables['--role-body-weight']).toBe('400');
    expect(variables['--role-hero-size']).toBe('31px');
    expect(variables['--role-title-lh']).toBe('1.35');
    expect(variables['--role-eyebrow-ls']).toBe('0.06em');
  });
});
