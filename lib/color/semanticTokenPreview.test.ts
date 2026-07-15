import { describe, expect, it } from 'vitest';

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
    expect(preview['on-background']).toBe(tokens['on-background']);
    expect(tokens.background).toBe(background);
    expect(tokens.background.hex).toBe('#FFFFFF');
  });
});
