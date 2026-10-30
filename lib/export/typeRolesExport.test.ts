import { describe, expect, it } from 'vitest';

import { buildTypeScaleReadout } from '../typography/typeScale';
import { resolveTypeRoles } from '../typography/typeRoles';
import { buildExportTokenSet } from './exportTokenSet';
import { generateDesignMd } from './generateDesignMd';
import { toCss, toTokensStudio, toW3cJson } from './serializeExportTokens';
import { FONT_PAIRS } from '../typography/pairings';

const roles = resolveTypeRoles({
  headingWeight: 700,
  bodyWeight: 400,
  sizes: buildTypeScaleReadout(16, 1.25),
  spacing: { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
  overrides: { label: { weight: 600, size: 14 } },
});

const set = buildExportTokenSet({
  rolePalette: null,
  tokenOverridesByTheme: { light: { primary: '#3366FF' }, dark: {} },
  pairing: FONT_PAIRS[0]!,
  typeRoles: roles,
});

describe('type roles in exports', () => {
  it('keeps the set unchanged when no roles are given', () => {
    const plain = buildExportTokenSet({
      rolePalette: null,
      tokenOverridesByTheme: { light: {}, dark: {} },
      pairing: FONT_PAIRS[0]!,
    });
    expect(plain.typography?.roles).toBeUndefined();
  });

  it('writes per-role custom properties to CSS', () => {
    const css = toCss(set);
    expect(css).toContain('--type-label-weight: 600;');
    expect(css).toContain('--type-label-size: 0.875rem;');
    expect(css).toContain('--type-hero-family: var(--font-heading);');
    expect(css).toContain('--type-body-line-height: 1.55;');
  });

  it('writes typography tokens to the W3C and Tokens Studio JSON', () => {
    const w3c = JSON.parse(toW3cJson(set));
    expect(w3c.typography.label.$value).toMatchObject({ fontWeight: 600, fontSize: '14px' });
    const studio = JSON.parse(toTokensStudio(set));
    expect(studio.light.typography.label.value).toMatchObject({ fontWeight: '600', fontSize: '14' });
  });

  it('lists every role in DESIGN.md', () => {
    const md = generateDesignMd(set);
    expect(md).toContain('  label:\n    fontFamily:');
    expect(md).toContain('    fontWeight: 600');
    expect(md).toContain('| Rol | Familia | Peso |');
  });
});
