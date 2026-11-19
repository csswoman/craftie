import { toOklch } from './oklchMath';

import type { SemanticTokenName, SemanticTokens } from './semanticTokens';


export const CHROMA_BUDGET_THRESHOLD = 0.03;

const AREA_ESTIMATES: Partial<Record<SemanticTokenName, number>> = {
  background: 0.55,
  surface: 0.25,
  border: 0.03,
  primary: 0.05,
  accent: 0.015,
  'on-background': 0.08,
  'data-1': 0.02 / 6,
  'data-2': 0.02 / 6,
  'data-3': 0.02 / 6,
  'data-4': 0.02 / 6,
  'data-5': 0.02 / 6,
  'data-6': 0.02 / 6,
};

/** Estimated share of a typical UI covered by the token (0-1), or null when not budgeted. */
export function estimatedTokenArea(tokenName: SemanticTokenName): number | null {
  return AREA_ESTIMATES[tokenName] ?? null;
}

export type ChromaBudgetAssessment = {
  score: number;
  threshold: number;
  overBudget: boolean;
  leadingRole: SemanticTokenName | null;
};

export function assessChromaBudget(tokens: SemanticTokens): ChromaBudgetAssessment {
  const contributions = Object.entries(AREA_ESTIMATES).map(([name, area]) => {
    const tokenName = name as SemanticTokenName;
    const chroma = toOklch(tokens[tokenName].hex)?.c ?? 0;

    return { name: tokenName, value: chroma * (area ?? 0) };
  });
  const score = contributions.reduce((sum, contribution) => sum + contribution.value, 0);
  const leadingRole = contributions.sort((left, right) => right.value - left.value)[0]?.name ?? null;

  return {
    score,
    threshold: CHROMA_BUDGET_THRESHOLD,
    overBudget: score > CHROMA_BUDGET_THRESHOLD,
    leadingRole,
  };
}
