import { describe, expect, it } from 'vitest';

import {
  collectMoods,
  DESIGN_STYLES,
  filterStylesByMood,
  type DesignStyle,
} from './presets';

const sampleStyles: DesignStyle[] = [
  {
    id: 'calm-ledger',
    name: 'Calm Ledger',
    description: 'Neutros suaves con un acento verde.',
    seeds: ['#2F5644'],
    mood: ['sereno', 'editorial'],
    thumbnailColors: ['#2F5644'],
  },
  {
    id: 'warm-signal',
    name: 'Warm Signal',
    description: 'Contraste cálido para interfaces activas.',
    seeds: ['#8B3A2A', '#F2E6D8'],
    mood: ['enérgico', 'cálido'],
    thumbnailColors: ['#8B3A2A', '#F2E6D8'],
  },
];

describe('presets', () => {
  it('exports an empty curated styles list by default', () => {
    expect(DESIGN_STYLES).toEqual([]);
  });

  it('collects unique moods in sorted order', () => {
    expect(collectMoods(sampleStyles)).toEqual(['cálido', 'editorial', 'enérgico', 'sereno']);
  });

  it('filters styles by mood', () => {
    expect(filterStylesByMood(sampleStyles, 'editorial')).toHaveLength(1);
    expect(filterStylesByMood(sampleStyles, 'editorial')[0]?.id).toBe('calm-ledger');
    expect(filterStylesByMood(sampleStyles, null)).toEqual(sampleStyles);
  });
});
