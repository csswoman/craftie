import { CURATED_FONT_PAIRS } from './fontPairLibrary';

export type FontClassification =
  | 'serif'
  | 'sans-serif'
  | 'display'
  | 'monospace';

export type FontMeta = {
  family: string;
  googleFontsRef: string;
  classification: FontClassification;
  contrast: 'high' | 'medium' | 'low';
  xHeight: 'high' | 'medium' | 'low';
  personality: string[];
  bestFor: 'heading' | 'body' | 'both';
};

export type FontPair = {
  id: string;
  displayName: string;
  heading: FontMeta;
  body: FontMeta;
  rationale: string;
  mood: string[];
  character: string[];
  wcagNote?: string;
};

export const FONT_PAIRS: FontPair[] = [...CURATED_FONT_PAIRS];

const STRONG_PERSONALITY_TAG_COUNT = 3;

function countMoodOverlap(pairMoods: string[], targetMoods: string[]): number {
  const targets = new Set(targetMoods);
  let matches = 0;

  for (const mood of pairMoods) {
    if (targets.has(mood)) {
      matches += 1;
    }
  }

  return matches;
}

function bothHaveHighContrast(pair: FontPair): boolean {
  return pair.heading.contrast === 'high' && pair.body.contrast === 'high';
}

function bothHaveManyPersonalityTags(pair: FontPair): boolean {
  return (
    pair.heading.personality.length >= STRONG_PERSONALITY_TAG_COUNT &&
    pair.body.personality.length >= STRONG_PERSONALITY_TAG_COUNT
  );
}

/**
 * Scores how well a font pair fits a mood list. Higher is better.
 * Deterministic: mood overlap adds points; high-contrast pairs and
 * pairs with busy personality metadata on both fonts lose points.
 */
export function scorePairForMood(pair: FontPair, mood: string[]): number {
  let score = countMoodOverlap(pair.mood, mood);

  if (bothHaveHighContrast(pair)) {
    score -= 1;
  }

  if (bothHaveManyPersonalityTags(pair)) {
    score -= 1;
  }

  return score;
}

/**
 * Returns curated pairs that share at least one mood tag with the input.
 * An empty mood list returns every curated pair in source order.
 */
export function getPairingsForStyle(mood: string[]): FontPair[] {
  if (mood.length === 0) {
    return [...FONT_PAIRS];
  }

  const targets = new Set(mood);

  return FONT_PAIRS.filter((pair) => pair.mood.some((tag) => targets.has(tag)));
}

/**
 * Returns the highest-scoring pairings for a mood list, preserving deterministic order.
 */
export function getRecommendedPairings(mood: string[], limit = 3): FontPair[] {
  const candidates = getPairingsForStyle(mood);

  return candidates
    .map((pair) => ({ pair, score: scorePairForMood(pair, mood) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.pair.id.localeCompare(right.pair.id, 'es');
    })
    .slice(0, limit)
    .map(({ pair }) => pair);
}
