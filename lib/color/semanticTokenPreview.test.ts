import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import type { SemanticTokens } from './semanticTokens';
import { previewSemanticToken } from './semanticTokenPreview';

describe('previewSemanticToken', () => {
  it('overrides one token without mutating the current system', () => {
    const background = { hex: '#FFFFFF', source: 'derived' as const };
    const tokens = {
      background,
      'on-background': { hex: '#111111', source: 'derived' as const },
    } as SemanticTokens;

    const preview = previewSemanticToken(tokens, 'background', '#f0f0f0');

    expect(preview.background.hex).toBe('#F0F0F0');
    expect(preview['on-background']).not.toBe(tokens['on-background']);
    expect(tokens.background).toBe(background);
    expect(tokens.background.hex).toBe('#FFFFFF');
  });

  it('re-derives on-secondary when secondary fill is previewed lighter', () => {
    const tokens = {
      primary: { hex: '#2563EB', source: 'derived' as const },
      secondary: { hex: '#1C4B8E', source: 'derived' as const },
      'on-secondary': { hex: '#E8F1FF', source: 'derived' as const },
    } as SemanticTokens;

    const preview = previewSemanticToken(tokens, 'secondary', '#61C7CD');

    expect(preview.secondary.hex).toBe('#61C7CD');
    expect(preview['on-secondary'].hex).not.toBe('#E8F1FF');
    expect(contrastRatio(preview['on-secondary'].hex, preview.secondary.hex)).toBeGreaterThanOrEqual(4.5);
  });
});
