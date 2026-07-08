import { describe, expect, it } from 'vitest';

import { LAYOUT_MODES, layoutModeTokenEntries, type LayoutSlot } from './layoutModes';
import type { SemanticTokenName } from './semanticTokens';

const PAIRS: Array<[LayoutSlot, LayoutSlot]> = [
  ['surface', 'text'],
  ['surface', 'mutedText'],
  ['primaryAction', 'primaryActionText'],
  ['secondaryAction', 'secondaryActionText'],
  ['heroSurface', 'onHero'],
  ['supportSurface', 'supportSurfaceText'],
];

const ON_TOKEN_BASE: Partial<Record<SemanticTokenName, SemanticTokenName>> = {
  'on-background': 'background',
  'on-surface': 'surface',
  'on-surface-muted': 'surface',
  'on-background-inverse': 'background-inverse',
  'on-surface-inverse': 'surface-inverse',
  'on-primary': 'primary',
  'on-secondary': 'secondary',
  'on-accent': 'accent',
  'on-hero': 'hero-surface',
};

describe('layoutModes', () => {
  it('pairs every on-* token with its matching base token', () => {
    for (const mode of LAYOUT_MODES) {
      const entries = new Map<LayoutSlot, SemanticTokenName>(layoutModeTokenEntries(mode));

      for (const [baseSlot, textSlot] of PAIRS) {
        const baseToken = entries.get(baseSlot);
        const textToken = entries.get(textSlot);

        if (!baseToken || !textToken) {
          continue;
        }

        expect(ON_TOKEN_BASE[textToken], `${mode.id}:${String(textSlot)}`).toBe(baseToken);
      }
    }
  });

  it('maps dashboard edit slots to the expected semantic tokens', () => {
    const dashboard = LAYOUT_MODES.find((mode) => mode.id === 'dashboard')!;
    const entries = new Map(layoutModeTokenEntries(dashboard));

    expect(entries.get('primaryAction')).toBe('primary');
    expect(entries.get('data4')).toBe('data-4');
    expect(entries.get('appBackground')).toBe('background');
  });
});
