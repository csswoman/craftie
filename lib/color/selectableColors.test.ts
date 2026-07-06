import { describe, expect, it } from 'vitest';

import {
  canToggleColor,
  createDefaultSelection,
  getSelectionSuggestions,
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

  it('allows removing selected colors without blocking generation', () => {
    const selection = createDefaultSelection();
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;

    expect(canToggleColor(selection, porcelain)).toBe(true);
    const next = toggleSelectedColor(selection, porcelain);

    expect(next).not.toBeNull();
    expect(validateSelection(next!)).toEqual({ ok: true });
  });

  it('allows selecting more than four bold colors', () => {
    let selection = createDefaultSelection();
    const extraBold = SELECTABLE_COLORS.filter(
      (color) => color.group === 'bold' && !selection.some((entry) => entry.id === color.id),
    );

    for (const color of extraBold.slice(0, 3)) {
      const next = toggleSelectedColor(selection, color);
      expect(next).not.toBeNull();
      selection = next!;
    }

    expect(selection.filter((color) => color.group === 'bold').length).toBeGreaterThan(4);
    expect(validateSelection(selection)).toEqual({ ok: true });
  });

  it('requires at least one selected color to generate', () => {
    expect(validateSelection([])).toEqual({
      ok: false,
      error: 'Selecciona al menos un color para generar.',
    });
  });

  it('returns suggestions instead of blocking incomplete group coverage', () => {
    const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight')!;
    const graphite = SELECTABLE_COLORS.find((color) => color.id === 'graphite')!;

    expect(validateSelection([twilight, graphite])).toEqual({ ok: true });
    expect(getSelectionSuggestions([twilight, graphite])).toContain(
      'Sugerencia: elige al menos un neutro claro para superficies.',
    );
    expect(getSelectionSuggestions([twilight, graphite])).toContain(
      'Sugerencia: elige 2–4 colores intensos para primario y acento.',
    );
  });

  it('maps all selected colors to seeds in group order', () => {
    const selection = createDefaultSelection();
    const seeds = mapSelectedColorsToSeeds(selection);

    expect(seeds).toHaveLength(selection.length);
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
