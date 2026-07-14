import { describe, expect, it } from 'vitest';

import { normalizeHex } from '../color/normalizeHex';
import {
  SELECTABLE_COLORS,
  buildCuratedSourceCatalog,
  suggestSelectionFromHexes,
} from '../color/selectableColors';

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
  it('exports curated styles for onboarding', () => {
    expect(DESIGN_STYLES.length).toBeGreaterThanOrEqual(4);
    expect(DESIGN_STYLES.every((style) => style.seeds.length >= 2)).toBe(true);
  });

  it('maps every curated style to a valid selection', () => {
    for (const style of DESIGN_STYLES) {
      const result = suggestSelectionFromHexes(style.seeds);
      expect(result.ok, style.id).toBe(true);
    }
  });

  it('builds source catalog from curated seeds only, not the full catalog', () => {
    for (const style of DESIGN_STYLES) {
      const catalog = buildCuratedSourceCatalog(style.seeds);
      const seedHexes = [...new Set(style.seeds.map((hex) => normalizeHex(hex)))].sort();
      const catalogHexes = catalog.map((color) => normalizeHex(color.hex)).sort();

      expect(catalog.length, style.id).toBeGreaterThan(0);
      expect(catalog.length, style.id).toBeLessThan(SELECTABLE_COLORS.length);
      expect(catalogHexes, style.id).toEqual(seedHexes);
    }
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
