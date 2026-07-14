import { describe, expect, it } from 'vitest';

import type { SelectableColor } from './selectableColors';
import { deriveSemanticTokens } from './semanticTokens';
import { autoFillDataGaps, buildDataCandidates, buildExpressiveCandidates } from './uiColorCandidates';

const sourceColors: SelectableColor[] = [
  { id: 'orange', name: 'Orange', hex: '#C85A22', group: 'bold' },
  { id: 'cream', name: 'Cream', hex: '#F8F0EA', group: 'light-neutral' },
  { id: 'pale-orange', name: 'Pale Orange', hex: '#F5CFA8', group: 'bold' },
  { id: 'brown', name: 'Brown', hex: '#75402B', group: 'dark-neutral' },
];

function tokensWithGaps() {
  const tokens = deriveSemanticTokens({
    extracted: [
      { hex: '#C85A22', prominence: 0.7 },
      { hex: '#2456A6', prominence: 0.3 },
    ],
    paletteType: 'vivid',
  });

  return {
    ...tokens,
    'data-1': { hex: '#2456A6', source: 'extracted' as const },
    'data-2': { hex: '#2456A6', source: 'derived' as const, gap: 'pending' },
    'data-3': { hex: '#2456A6', source: 'derived' as const, gap: 'pending' },
  };
}

describe('UI color candidates', () => {
  it('explains contrast and collision verdicts with metrics', () => {
    const candidates = buildDataCandidates(tokensWithGaps(), sourceColors, 'data-2');
    expect(candidates.every((candidate) => candidate.verdict.metric.length > 0)).toBe(true);
    expect(candidates.some((candidate) => candidate.verdict.kind === 'collision' && candidate.verdict.disabled)).toBe(true);
    expect(candidates.some((candidate) => candidate.verdict.kind === 'weak' && !candidate.verdict.disabled)).toBe(true);
  });

  it('auto-fill chooses the best enabled candidate in sorted order', () => {
    const tokens = tokensWithGaps();
    const replacements = autoFillDataGaps(tokens, sourceColors);
    for (const replacement of replacements) {
      expect(replacement.candidate.verdict.disabled).toBe(false);
      expect(replacement.candidate.verdict.kind).not.toBe('collision');
    }
  });

  it('uses a weak candidate when no serving candidate is available', () => {
    const base = tokensWithGaps();
    const tokens = {
      ...base,
      primary: { ...base.primary, gap: 'pending' as const },
      secondary: { ...base.secondary, gap: 'pending' as const },
      accent: { ...base.accent, gap: 'pending' as const },
      'data-1': { hex: '#111111', source: 'override' as const },
    };
    const replacements = autoFillDataGaps(tokens, [
      { id: 'soft-gray', name: 'Soft gray', hex: '#B8B8B8', group: 'light-neutral' },
    ]);

    expect(replacements[0]?.candidate.verdict.kind).toBe('weak');
  });

  it('disables source colors without expressive character', () => {
    const candidates = buildExpressiveCandidates(sourceColors);
    expect(candidates.find((candidate) => candidate.id === 'source-cream')?.verdict.disabled).toBe(true);
    expect(candidates.find((candidate) => candidate.id === 'source-orange')?.verdict.kind).toBe('serve');
  });
});
