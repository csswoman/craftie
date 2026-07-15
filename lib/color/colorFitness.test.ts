import { describe, expect, it } from 'vitest';

import { colorFitnessRecommendation, evaluateColorFitness } from './colorFitness';

const scenario = {
  backgroundHex: '#FFFFFF',
  lightOnColorBaseHex: '#F0F0F0',
  darkTextBaseHex: '#202020',
  occupiedDataHexes: ['#2456A6'],
};

describe('color fitness', () => {
  it('presents Brilliant Rose as useful beyond text', () => {
    const fitness = evaluateColorFitness('#F653A6', scenario);

    expect(fitness.asText.ok).toBe(false);
    expect(fitness.asFill.ok).toBe(true);
    expect(fitness.asAccent.ok).toBe(true);
    expect(fitness.asSurface.ok).toBe(true);
    expect(colorFitnessRecommendation(fitness)).not.toContain('Débil');
  });

  it('requires both 3:1 contrast and series separation for data', () => {
    const colliding = evaluateColorFitness('#2456A6', scenario);
    const separated = evaluateColorFitness('#8A3D20', scenario);

    expect(colliding.asData.ok).toBe(false);
    expect(separated.asData.ratio).toBeGreaterThanOrEqual(3);
    expect(separated.asData.ok).toBe(true);
  });

  it('rejects an accent only when it is almost identical to the background', () => {
    expect(evaluateColorFitness('#FEFEFE', scenario).asAccent.ok).toBe(false);
    expect(evaluateColorFitness('#F653A6', scenario).asAccent.ok).toBe(true);
  });
});
