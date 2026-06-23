import { describe, expect, it } from 'vitest';

import {
  addSeed,
  canAddSeed,
  canRemoveSeed,
  createDefaultSeeds,
  MAX_SEED_COUNT,
  removeSeedAt,
  replaceSeeds,
  updateSeedAt,
  validateSeedsForGeneration,
} from './seeds';

describe('seeds', () => {
  it('starts with one default seed', () => {
    expect(createDefaultSeeds()).toEqual(['#2F5644']);
  });

  it('adds and removes seeds within limits', () => {
    let seeds = createDefaultSeeds();

    expect(canAddSeed(seeds)).toBe(true);
    seeds = addSeed(seeds);
    seeds = addSeed(seeds);
    expect(seeds).toHaveLength(MAX_SEED_COUNT);
    expect(canAddSeed(seeds)).toBe(false);

    expect(canRemoveSeed(seeds)).toBe(true);
    seeds = removeSeedAt(seeds, 1);
    expect(seeds).toHaveLength(2);
    seeds = removeSeedAt(seeds, 0);
    expect(seeds).toHaveLength(1);
    expect(canRemoveSeed(seeds)).toBe(false);
  });

  it('updates a seed at an index', () => {
    const seeds = updateSeedAt(createDefaultSeeds(), 0, '#112233');
    expect(seeds[0]).toBe('#112233');
  });

  it('replaces seeds from an external list within limits', () => {
    expect(replaceSeeds(['#112233', '#445566'])).toEqual(['#112233', '#445566']);
    expect(replaceSeeds(['#111111', '#222222', '#333333', '#444444'])).toHaveLength(MAX_SEED_COUNT);
    expect(replaceSeeds([])).toEqual(createDefaultSeeds());
  });

  it('validates strict hex seeds for generation', () => {
    expect(validateSeedsForGeneration(['#2F5644'])).toEqual({
      ok: true,
      seeds: ['#2F5644'],
    });

    expect(validateSeedsForGeneration(['white'])).toEqual({
      ok: false,
      error: 'El color semilla 1 debe ser un HEX válido (#RRGGBB).',
    });

    expect(validateSeedsForGeneration(['#GGGGGG'])).toEqual({
      ok: false,
      error: 'El color semilla 1 debe ser un HEX válido (#RRGGBB).',
    });
  });
});
