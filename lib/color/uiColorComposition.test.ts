import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from './semanticTokens';
import { resolveUiExpressiveGaps } from './uiExpressiveGaps';
import { assessUiColorLoad, chromaLoadPercent, colorLoadVerdict, UI_COMPOSITION_SEGMENTS } from './uiColorComposition';

describe('UI color composition', () => {
  it('uses the agreed area estimates', () => {
    expect(UI_COMPOSITION_SEGMENTS.map(({ token, area }) => [token, area])).toEqual([
      ['background', 0.55],
      ['surface', 0.25],
      ['on-background', 0.08],
      ['border', 0.03],
      ['primary', 0.05],
      ['accent', 0.015],
    ]);
  });

  it('covers quiet, balanced and saturated verdicts', () => {
    expect(colorLoadVerdict(7).level).toBe('quiet');
    expect(colorLoadVerdict(8).level).toBe('balanced');
    expect(colorLoadVerdict(28).level).toBe('balanced');
    expect(colorLoadVerdict(29).level).toBe('saturated');
    expect(chromaLoadPercent(0.18)).toBe(100);
  });

  it('treats an almost-neutral system with expressive gaps as quiet', () => {
    const tokens = resolveUiExpressiveGaps(deriveSemanticTokens({
      extracted: [{ hex: '#E8D8C8', prominence: 1 }],
      paletteType: 'neutral',
    }));
    expect(colorLoadVerdict(chromaLoadPercent(assessUiColorLoad(tokens))).level).toBe('quiet');
  });
});
