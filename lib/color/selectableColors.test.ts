import { describe, expect, it } from 'vitest';

import {
  canToggleColor,
  createDefaultSelection,
  mapSelectedColorsToSeeds,
  SELECTABLE_COLORS,
  suggestSelectionFromHexes,
  toggleSelectedColor,
  validateSelection,
} from './selectableColors';

describe('selectableColors', () => {
  it('creates a default selection that satisfies group rules', () => {
    const selection = createDefaultSelection();

    expect(validateSelection(selection)).toEqual({ ok: true });
    expect(selection).toHaveLength(4);
  });

  it('prevents removing the last light neutral', () => {
    const selection = createDefaultSelection();
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;

    expect(canToggleColor(selection, porcelain)).toBe(false);
    expect(toggleSelectedColor(selection, porcelain)).toBeNull();
  });

  it('limits bold colors to four selections', () => {
    let selection = createDefaultSelection();
    const extraBold = SELECTABLE_COLORS.filter(
      (color) => color.group === 'bold' && !selection.some((entry) => entry.id === color.id),
    );

    for (const color of extraBold.slice(0, 2)) {
      const next = toggleSelectedColor(selection, color);
      expect(next).not.toBeNull();
      selection = next!;
    }

    const blocked = extraBold[2]!;
    expect(canToggleColor(selection, blocked)).toBe(false);
  });

  it('maps selected colors to up to three seed hex values', () => {
    const selection = createDefaultSelection();
    const seeds = mapSelectedColorsToSeeds(selection);

    expect(seeds).toHaveLength(3);
    expect(seeds.every((seed) => seed.startsWith('#'))).toBe(true);
  });

  it('suggests a valid selection from seed hex values', () => {
    const suggestion = suggestSelectionFromHexes(['#9ADBD6', '#E8D44D', '#2C3E50']);

    expect(suggestion.ok).toBe(true);

    if (suggestion.ok) {
      expect(validateSelection(suggestion.colors)).toEqual({ ok: true });
      expect(suggestion.colors.some((color) => color.id === 'seaspray')).toBe(true);
    }
  });
});
