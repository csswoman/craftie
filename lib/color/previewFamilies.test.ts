import { describe, expect, it } from 'vitest';

import { UI_LAYOUT_MODES } from './layoutModes';
import { getPreviewFamily, PREVIEW_FAMILIES } from './previewFamilies';

describe('previewFamilies', () => {
  it('keeps existing layout modes under the ui family with tinted neutral chrome by default', () => {
    const ui = getPreviewFamily('ui');

    expect(ui.id).toBe('ui');
    expect(ui.modes).toBe(UI_LAYOUT_MODES);

    if (ui.id !== 'ui') {
      throw new Error('Expected UI family');
    }

    expect(ui.contract.kind).toBe('slot-token-map');
    expect(ui.contract.neutralChromeRule).toBe('structural-neutrals-only-for-large-surfaces');
    expect(ui.contract.neutralStyle).toBe('tinted');
  });

  it('declares illustration as a full-palette family without UI slots or modes', () => {
    const illustration = getPreviewFamily('illustration');

    expect(illustration.id).toBe('illustration');
    expect(illustration.modes).toEqual([]);
    if (illustration.id !== 'illustration') {
      throw new Error('Expected illustration family');
    }

    expect(illustration.styles.map((style) => style.id)).toEqual(['bento']);
    expect(illustration.contract.kind).toBe('full-palette-tonal-scales');
    expect(illustration.contract.rendererInput.tonalScales.primary).toContain('primary-500');
    expect(illustration.contract.rendererInput.tonalScales.secondary).toContain('secondary-500');
    expect(illustration.contract.rendererInput.tonalScales.accent).toContain('accent-500');
  });

  it('exposes families with either UI modes or illustration styles as selectable renderers', () => {
    const selectable = PREVIEW_FAMILIES.filter(
      (family) => family.id === 'ui' || (family.id === 'illustration' && family.styles.length > 0),
    );

    expect(selectable.map((family) => family.id)).toEqual(['ui', 'illustration']);
  });
});
