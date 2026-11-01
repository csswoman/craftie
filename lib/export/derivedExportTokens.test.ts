import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from '../color/semanticTokens';
import { EXPORT_DERIVED_TOKEN_NAMES, pickExportDerivedTokens } from './derivedExportTokens';

const extracted = [
  { hex: '#1F6F54', prominence: 1 },
  { hex: '#C2653A', prominence: 0.8 },
  { hex: '#D99A28', prominence: 0.6 },
  { hex: '#FAF7F2', prominence: 0.4 },
  { hex: '#2B2724', prominence: 0.3 },
];

describe('pickExportDerivedTokens', () => {
  it('exports the 50–900 ramp for each expressive color', () => {
    const picked = pickExportDerivedTokens(deriveSemanticTokens({ extracted, theme: 'light' }));
    for (const base of ['primary', 'secondary', 'accent']) {
      for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(picked[`${base}-${step}` as keyof typeof picked], `${base}-${step}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('includes paired on-* colors and both themes differ for the background', () => {
    const light = pickExportDerivedTokens(deriveSemanticTokens({ extracted, theme: 'light' }));
    const dark = pickExportDerivedTokens(deriveSemanticTokens({ extracted, theme: 'dark' }));
    expect(light['on-primary']).toBeDefined();
    expect(light.background).not.toBe(dark.background);
  });

  it('has no duplicate names', () => {
    expect(new Set(EXPORT_DERIVED_TOKEN_NAMES).size).toBe(EXPORT_DERIVED_TOKEN_NAMES.length);
  });
});
