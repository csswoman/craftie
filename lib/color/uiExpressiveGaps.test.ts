import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from './semanticTokens';
import { resolveUiExpressiveGaps } from './uiExpressiveGaps';

describe('UI expressive gaps', () => {
  it('does not expose an auto-derived neutral as accent', () => {
    const raw = deriveSemanticTokens({
      extracted: [{ hex: '#E8D8C8', prominence: 1 }],
      paletteType: 'pastel',
    });
    const resolved = resolveUiExpressiveGaps(raw);

    expect(resolved.accent.gap).toBeTruthy();
    expect(resolved.accent.hex).toBe(resolved.primary.hex);
    expect(resolved.accent.hex).not.toBe(raw.surface.hex);
  });

  it('keeps explicit overrides assigned', () => {
    const raw = deriveSemanticTokens({
      extracted: [{ hex: '#E8D8C8', prominence: 1 }],
      overrides: { accent: '#B64020' },
      paletteType: 'pastel',
    });
    expect(resolveUiExpressiveGaps(raw).accent).toMatchObject({ hex: '#B64020', source: 'override' });
  });

  it('auto-assigns accent by accent or fill fitness instead of text fitness', () => {
    const source = { hex: '#B8AAA2', prominence: 1 };
    const raw = deriveSemanticTokens({ extracted: [source], paletteType: 'pastel' });
    const resolved = resolveUiExpressiveGaps(raw, [source]);

    expect(resolved.accent).toMatchObject({ hex: '#B8AAA2', source: 'extracted' });
    expect(resolved.accent.gap).toBeUndefined();
  });

  it('turns weak automatic source colors into gaps while allowing explicit choice', () => {
    const weak = deriveSemanticTokens({
      extracted: [{ hex: '#C9A98C', prominence: 1 }],
      paletteType: 'pastel',
    });
    expect(resolveUiExpressiveGaps(weak).primary.gap).toBeTruthy();
  });
});
