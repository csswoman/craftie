import { describe, expect, it } from 'vitest';

import {
  LAYOUT_MODES,
  layoutModeTokenEntries,
  resolveLayoutColors,
  type LayoutSlot,
} from './layoutModes';
import { deriveSemanticTokens, type SemanticTokenName } from './semanticTokens';

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

  it('maps decorative brand slots to the palette roles, not to chart colors', () => {
    const dashboard = LAYOUT_MODES.find((mode) => mode.id === 'dashboard')!;
    const entries = new Map(layoutModeTokenEntries(dashboard));

    expect(entries.get('brand1')).toBe('primary');
    expect(entries.get('brand2')).toBe('secondary');
    expect(entries.get('brand3')).toBe('accent');
    expect(entries.get('brand4')).toBe('primary-300');

    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#C03A2B', prominence: 0.4 },
        { hex: '#2468C8', prominence: 0.35 },
        { hex: '#1F8A4C', prominence: 0.25 },
      ],
    });
    const colors = resolveLayoutColors(dashboard, tokens);

    expect(colors.brand1).toBe(tokens.primary.hex);
    expect(colors.brand2).toBe(tokens.secondary.hex);
    expect(colors.brand3).toBe(tokens.accent.hex);
  });

  it('previews a gap status color in its suggestion instead of a gray placeholder', () => {
    const dashboard = LAYOUT_MODES.find((mode) => mode.id === 'dashboard')!;
    const tokens = deriveSemanticTokens({ extracted: [{ hex: '#1F6F54', prominence: 1 }] });
    const pending = {
      ...tokens,
      success: { hex: '#777777', source: 'derived' as const, gap: 'pendiente', suggestedHex: '#1F8A4C' },
    };

    expect(resolveLayoutColors(dashboard, pending).success).toBe('#1F8A4C');
  });

  it('rewires dashboard actions to a fill-ready primary step when the source is a pastel', () => {
    const dashboard = LAYOUT_MODES.find((mode) => mode.id === 'dashboard')!;
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#1A1214', prominence: 1 },
        { hex: '#E8B4B8', prominence: 0.8 },
        { hex: '#C47A80', prominence: 0.5 },
      ],
      theme: 'dark',
      overrides: { primary: '#E8B4B8' },
    });
    const entries = new Map(layoutModeTokenEntries(dashboard, tokens));
    const colors = resolveLayoutColors(dashboard, tokens);

    expect(['primary-500', 'primary-600']).toContain(entries.get('primaryAction'));
    expect(entries.get('primaryActionText')).toBe(`on-${entries.get('primaryAction')}`);
    expect(colors.primaryAction).not.toBe(tokens.primary.hex);
  });

  it('maps the media player to the active theme instead of inverse surfaces', () => {
    const media = LAYOUT_MODES.find((mode) => mode.id === 'media')!;
    const source = [{ hex: '#3366CC', prominence: 1 }];

    for (const theme of ['light', 'dark'] as const) {
      const tokens = deriveSemanticTokens({ extracted: source, theme });
      const colors = resolveLayoutColors(media, tokens);

      expect(colors.appBackground).toBe(tokens.background.hex);
      expect(colors.surface).toBe(tokens.surface.hex);
      expect(colors.surfaceElevated).toBe(tokens['surface-elevated'].hex);
      expect(colors.text).toBe(tokens['on-surface'].hex);
      expect(colors.mutedText).toBe(tokens['on-surface-muted'].hex);
    }
  });
});
