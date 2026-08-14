import { describe, expect, it } from 'vitest';

import { normalizeHex } from './normalizeHex';
import { projectSemanticTokensToRolePalette } from './semanticRoleProjection';
import { deriveSemanticTokens } from './semanticTokens';
import { getColorForUsage } from './usageColor';

function createPalette(primary = '#3366CC') {
  const tokens = deriveSemanticTokens({
    extracted: [
      { hex: '#F7F7F5', prominence: 1 },
      { hex: primary, prominence: 0.9 },
      { hex: '#E8D44D', prominence: 0.8 },
      { hex: '#2C3E50', prominence: 0.7 },
    ],
    theme: 'light',
    synthesisStrategy: 'analogous',
    overrides: { primary },
  });

  return {
    tokens,
    palette: projectSemanticTokensToRolePalette(tokens),
  };
}

describe('getColorForUsage', () => {
  it('maps action to primario', () => {
    const { palette, tokens } = createPalette();

    expect(getColorForUsage(palette, tokens, 'action').fill.role).toBe('primario');
  });

  it('uses the action fill as text when the expressive color is text safe', () => {
    const { palette, tokens } = createPalette('#1B365D');
    expect(palette.primario.textSafe).toBe(true);

    const result = getColorForUsage(palette, tokens, 'action');

    expect(result.textSafe).toBe(true);
    expect(result.text).toBe(result.fill);
  });

  it('uses texto for active-state instead of an expressive text color', () => {
    const { palette, tokens } = createPalette();
    const result = getColorForUsage(palette, tokens, 'active-state');

    expect(result.fill.role).toBe('primario');
    expect(result.text.role).toBe('texto');
  });

  it('maps positive-trend to acento', () => {
    const { palette, tokens } = createPalette();

    expect(getColorForUsage(palette, tokens, 'positive-trend').fill.role).toBe('acento');
  });

  it('maps data-visualization to secundario', () => {
    const { palette, tokens } = createPalette();

    expect(getColorForUsage(palette, tokens, 'data-visualization').fill.role).toBe('secundario');
  });

  it('prefers primary-900 over on-background for an unsafe action color', () => {
    const { palette, tokens } = createPalette('#A8D5E5');
    expect(palette.primario.textSafe).toBe(false);

    const result = getColorForUsage(palette, tokens, 'action');

    expect(result.textSafe).toBe(false);
    expect(normalizeHex(result.text.hex)).toBe(normalizeHex(tokens['primary-900'].hex));
    expect(normalizeHex(result.text.hex)).not.toBe(normalizeHex(tokens['on-background'].hex));
  });
});
