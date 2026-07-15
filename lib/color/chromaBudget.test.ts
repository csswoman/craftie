import { describe, expect, it } from 'vitest';

import { assessChromaBudget } from './chromaBudget';
import { deriveSemanticTokens } from './semanticTokens';

const SOURCE = [
  { hex: '#B6E4E6', prominence: 0.4 },
  { hex: '#EDC3DB', prominence: 0.3 },
  { hex: '#D0C4F4', prominence: 0.2 },
  { hex: '#89DFE7', prominence: 0.1 },
];

describe('chroma budget', () => {
  it('keeps the area-aware UI palette under budget', () => {
    expect(assessChromaBudget(deriveSemanticTokens({ extracted: SOURCE })).overBudget).toBe(false);
  });

  it('warns when a high-chroma source is forced into the full background', () => {
    const assessment = assessChromaBudget(deriveSemanticTokens({
      extracted: SOURCE,
      overrides: { background: '#19CFE6' },
    }));

    expect(assessment.overBudget).toBe(true);
    expect(assessment.leadingRole).toBe('background');
  });
});
