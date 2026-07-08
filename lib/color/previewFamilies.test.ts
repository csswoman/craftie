import { describe, expect, it } from 'vitest';

import { UI_LAYOUT_MODES } from './layoutModes';
import { getPreviewFamily, PREVIEW_FAMILIES } from './previewFamilies';

describe('previewFamilies', () => {
  it('keeps existing layout modes under the ui family with pure neutral chrome by default', () => {
    const ui = getPreviewFamily('ui');

    expect(ui.id).toBe('ui');
    expect(ui.modes).toBe(UI_LAYOUT_MODES);

    if (ui.id !== 'ui') {
      throw new Error('Expected UI family');
    }

    expect(ui.contract.kind).toBe('slot-token-map');
    expect(ui.contract.neutralChromeRule).toBe('structural-neutrals-only-for-large-surfaces');
    expect(ui.contract.neutralStyle).toBe('pure');
  });

  it('declares illustration as a full-palette family without UI slots or modes', () => {
    const illustration = getPreviewFamily('illustration');

    expect(illustration.id).toBe('illustration');
    expect(illustration.modes).toEqual([]);

    if (illustration.id !== 'illustration') {
      throw new Error('Expected illustration family');
    }

    expect(illustration.contract.kind).toBe('full-palette-tonal-scales');
    expect(illustration.contract.rendererInput.tonalScales.primary).toContain('primary-500');
    expect(illustration.contract.rendererInput.tonalScales.secondary).toContain('secondary-500');
    expect(illustration.contract.rendererInput.tonalScales.accent).toContain('accent-500');
  });

  it('only exposes populated families as selectable renderer families for now', () => {
    const selectable = PREVIEW_FAMILIES.filter((family) => family.modes.length > 0);

    expect(selectable.map((family) => family.id)).toEqual(['ui']);
  });
});
