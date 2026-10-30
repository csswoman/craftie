import { describe, expect, it } from 'vitest';

import { buildSourceCatalogFromHexes } from './sourceCatalog';
import { SELECTABLE_COLORS } from './selectableColors';

describe('buildSourceCatalogFromHexes', () => {
  it('keeps a custom HEX that is not part of the curated catalog', () => {
    const catalog = buildSourceCatalogFromHexes(['#1F6F54']);

    expect(catalog).toHaveLength(1);
    expect(catalog[0].hex).toBe('#1F6F54');
    expect(catalog[0].id).toMatch(/^custom-/);
  });

  it('reuses curated colors by HEX', () => {
    const curated = SELECTABLE_COLORS[0];
    const catalog = buildSourceCatalogFromHexes([curated.hex.toLowerCase()]);

    expect(catalog).toEqual([curated]);
  });

  it('deduplicates and skips invalid values', () => {
    const catalog = buildSourceCatalogFromHexes(['#1f6f54', '#1F6F54', 'not-a-color', '']);

    expect(catalog).toHaveLength(1);
  });

  it('returns an empty catalog when there is nothing valid', () => {
    expect(buildSourceCatalogFromHexes([])).toEqual([]);
  });
});
