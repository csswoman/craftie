import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { contrastRatio, oklchChannelsToHex } from '../utils/colorMath';
import {
  deriveSemanticTokens,
  type ExpressiveSynthesisStrategy,
  type SemanticTokenName,
} from './semanticTokens';
import {
  deriveRolePaletteFromSemanticInput,
  rolePaletteAsSemanticOverrides,
} from './rolePalette';

const toOklch = converter('oklch');

function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function tokenHue(hex: string): number {
  return toOklch(hex)?.h ?? 0;
}

function tokenLightness(hex: string): number {
  return toOklch(hex)?.l ?? 0;
}

function tokenChroma(hex: string): number {
  return toOklch(hex)?.c ?? 0;
}

function weightedHue(colors: Array<{ hex: string; prominence: number }>): number {
  const vector = colors.reduce((total, color) => {
    const radians = (tokenHue(color.hex) * Math.PI) / 180;
    return {
      x: total.x + Math.cos(radians) * color.prominence,
      y: total.y + Math.sin(radians) * color.prominence,
    };
  }, { x: 0, y: 0 });

  return ((Math.atan2(vector.y, vector.x) * 180) / Math.PI + 360) % 360;
}

const STRUCTURAL_NEUTRAL_TOKENS = [
  'background',
  'surface',
  'surface-elevated',
  'background-inverse',
  'surface-inverse',
  'surface-inverse-elevated',
  'on-background',
  'on-surface',
  'on-surface-muted',
  'on-background-inverse',
  'on-surface-inverse',
  'border',
  'divider',
] as const satisfies readonly SemanticTokenName[];

const EXPRESSIVE_SAMPLE = [
  { hex: '#C03A2B', prominence: 0.34 },
  { hex: '#2468C8', prominence: 0.28 },
  { hex: '#1F8A4C', prominence: 0.22 },
  { hex: '#8C4BC7', prominence: 0.16 },
];

function nearMonochromeExtracted() {
  return [
    { hex: oklchChannelsToHex(0.45, 0.025, 20), prominence: 0.5 },
    { hex: oklchChannelsToHex(0.36, 0.018, 18), prominence: 0.3 },
    { hex: oklchChannelsToHex(0.28, 0.014, 24), prominence: 0.2 },
  ];
}

function derivedWithStrategy(strategy: ExpressiveSynthesisStrategy) {
  return deriveSemanticTokens({
    extracted: nearMonochromeExtracted(),
    synthesisStrategy: strategy,
  });
}

describe('deriveSemanticTokens', () => {
  it('builds a complete synthetic neutral ramp from the weighted image hue', () => {
    const extracted = [
      { hex: '#B6E4E6', prominence: 0.4 },
      { hex: '#EDC3DB', prominence: 0.3 },
      { hex: '#D0C4F4', prominence: 0.2 },
      { hex: '#89DFE7', prominence: 0.1 },
    ];
    const tokens = deriveSemanticTokens({ extracted, paletteType: 'pastel' });
    const hue = weightedHue(extracted);

    expect(tokenLightness(tokens.background.hex)).toBeCloseTo(0.98, 1);
    expect(tokenLightness(tokens.surface.hex)).toBeCloseTo(0.96, 1);
    expect(tokenLightness(tokens['surface-elevated'].hex)).toBeCloseTo(0.94, 1);
    expect(tokenLightness(tokens.border.hex)).toBeCloseTo(0.88, 1);
    expect(tokenLightness(tokens['on-background'].hex)).toBeCloseTo(0.25, 1);
    expect(tokenLightness(tokens['on-surface-muted'].hex)).toBeCloseTo(0.53, 1);
    expect(tokenChroma(tokens.background.hex)).toBeGreaterThan(0);

    for (const name of STRUCTURAL_NEUTRAL_TOKENS) {
      expect(hueDistance(tokenHue(tokens[name].hex), hue), name).toBeLessThanOrEqual(3);
      expect(tokenChroma(tokens[name].hex), name).toBeGreaterThan(0);
      expect(tokens[name].hex, name).not.toBe('#FFFFFF');
      expect(tokens[name].hex, name).not.toBe('#000000');
    }

    const sources = extracted.map((color) => color.hex);
    expect(sources).toContain(tokens.primary.hex);
    expect(sources).toContain(tokens.accent.hex);
  });

  it('uses the specified tinted neutral ramp for dark UI', () => {
    const tokens = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme: 'dark' });

    expect(tokenLightness(tokens.background.hex)).toBeCloseTo(0.15, 1);
    expect(tokenLightness(tokens.surface.hex)).toBeCloseTo(0.19, 1);
    expect(tokenLightness(tokens['surface-elevated'].hex)).toBeCloseTo(0.23, 1);
    expect(tokenLightness(tokens.border.hex)).toBeCloseTo(0.32, 1);
    expect(tokenLightness(tokens['on-background'].hex)).toBeCloseTo(0.92, 1);
    expect(tokenLightness(tokens['on-surface-muted'].hex)).toBeCloseTo(0.7, 1);
  });
  it('always derives structural neutrals instead of taking extracted colors directly', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#F7F7F5', prominence: 0.5 },
        { hex: '#3366CC', prominence: 0.3 },
        { hex: '#111111', prominence: 0.2 },
      ],
      neutralStyle: 'tinted',
    });

    expect(tokens.background.source).toBe('derived');
    expect(tokens.surface.source).toBe('derived');
    expect(tokens.border.source).toBe('derived');
    expect(tokens.background.hex).not.toBe('#F7F7F5');
    expect(toOklch(tokens.background.hex)?.c ?? 1).toBeGreaterThan(0.004);
    expect(toOklch(tokens.background.hex)?.c ?? 1).toBeLessThanOrEqual(0.02);
  });

  it('derives subtly tinted neutral chrome from the dominant image hue by default', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#F7F7F5', prominence: 0.5 },
        { hex: '#3366CC', prominence: 0.3 },
        { hex: '#111111', prominence: 0.2 },
      ],
    });

    const dominantHue = tokenHue('#3366CC');

    expect(toOklch(tokens.background.hex)?.c ?? 0).toBeGreaterThan(0.004);
    expect(hueDistance(tokenHue(tokens.background.hex), dominantHue)).toBeLessThanOrEqual(3);
    expect(hueDistance(tokenHue(tokens.surface.hex), dominantHue)).toBeLessThanOrEqual(3);
  });

  it('keeps a chroma trace even when the image is achromatic', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#EFEFEF', prominence: 0.6 },
        { hex: '#222222', prominence: 0.4 },
      ],
    });

    expect(toOklch(tokens.background.hex)?.c ?? 0).toBeGreaterThan(0);
    expect(tokens.background.hex).not.toBe('#FFFFFF');
  });

  it('filters low-chroma extracted colors out of expressive roles before assignment', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#7C7F78', prominence: 0.5 },
        { hex: '#8B8E87', prominence: 0.3 },
        { hex: '#6D716A', prominence: 0.2 },
      ],
    });

    expect(tokens.primary.source).toBe('derived');
    expect(tokens.accent.source).toBe('derived');
    expect(tokens.primary.hex).not.toBe('#7C7F78');
    expect(tokens.accent.hex).not.toBe('#8B8E87');
  });

  it('keeps pastel expressive surfaces intact and derives readable foregrounds', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#9ADBD6', prominence: 0.5 },
        { hex: '#E8D44D', prominence: 0.3 },
        { hex: '#F4A261', prominence: 0.2 },
      ],
    });

    expect(['#9ADBD6', '#E8D44D', '#F4A261']).toContain(tokens.primary.hex);
    expect(tokens.primary.source).toBe('extracted');
    expect(contrastRatio(tokens['on-primary'].hex, tokens.primary.hex)).toBeGreaterThanOrEqual(4.5);
    expect(hueDistance(tokenHue(tokens['on-primary'].hex), tokenHue(tokens.primary.hex))).toBeLessThanOrEqual(3);
  });

  it('uses suitable extracted state hues and synthesizes missing state hues', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#1F8A4C', prominence: 0.35 },
        { hex: '#3366CC', prominence: 0.35 },
        { hex: '#5E4BD8', prominence: 0.3 },
      ],
    });

    expect(tokens.success.source === 'extracted' || tokens.success.source === 'corrected').toBe(true);
    expect(tokens.warning.source).toBe('derived');
    expect(tokens.error.source).toBe('derived');
  });

  it('derives inverse and hero text tokens that pass AA', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#351F1C', prominence: 0.45 },
        { hex: '#B9272F', prominence: 0.3 },
        { hex: '#6E625E', prominence: 0.25 },
      ],
    });

    expect(toOklch(tokens['background-inverse'].hex)?.l ?? 1).toBeGreaterThanOrEqual(0.15);
    expect(toOklch(tokens['background-inverse'].hex)?.l ?? 1).toBeLessThanOrEqual(0.25);
    expect(contrastRatio(tokens['on-background-inverse'].hex, tokens['background-inverse'].hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-surface-inverse'].hex, tokens['surface-inverse'].hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-secondary'].hex, tokens.secondary.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-accent'].hex, tokens.accent.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-hero'].hex, tokens['hero-surface'].hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('derives muted text that remains AA on surface', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#F6F4EE', prominence: 0.45 },
        { hex: '#225F88', prominence: 0.35 },
        { hex: '#C33D31', prominence: 0.2 },
      ],
    });

    expect(contrastRatio(tokens['on-surface-muted'].hex, tokens.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(tokens['on-surface-muted'].hex).not.toBe(tokens.surface.hex);
  });

  it('exposes tonal scale tokens and readable text pairs for expressive mid steps', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#C03A2B', prominence: 0.4 },
        { hex: '#2468C8', prominence: 0.35 },
        { hex: '#1F8A4C', prominence: 0.25 },
      ],
    });

    expect(tokens['primary-50'].source).toBe('derived');
    expect(tokens['primary-900'].source).toBe('derived');
    expect(toOklch(tokens['primary-50'].hex)?.l ?? 0).toBeGreaterThan(toOklch(tokens['primary-900'].hex)?.l ?? 1);
    expect(contrastRatio(tokens['on-primary-500'].hex, tokens['primary-500'].hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-primary-600'].hex, tokens['primary-600'].hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-secondary-500'].hex, tokens['secondary-500'].hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-accent-600'].hex, tokens['accent-600'].hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('synthesizes analogous secondary under analogous strategies for near-monochrome input', () => {
    for (const strategy of ['analogous', 'analogous-with-accent'] satisfies ExpressiveSynthesisStrategy[]) {
      const tokens = derivedWithStrategy(strategy);
      const primaryHue = tokenHue(tokens.primary.hex);
      const secondaryHue = tokenHue(tokens.secondary.hex);
      const distance = hueDistance(primaryHue, secondaryHue);

      expect(tokens.primary.source).toBe('derived');
      expect(tokens.secondary.source).toBe('derived');
      expect(distance).toBeGreaterThanOrEqual(30);
      expect(distance).toBeLessThanOrEqual(40);
      expect(contrastRatio(tokens.secondary.hex, tokens.surface.hex)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tokens['on-secondary'].hex, tokens.secondary.hex)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('only synthesizes a complementary accent for complementary accent strategies', () => {
    const analogous = derivedWithStrategy('analogous');
    const complementary = derivedWithStrategy('complementary');
    const analogousWithAccent = derivedWithStrategy('analogous-with-accent');

    const analogousAccentDistance = hueDistance(tokenHue(analogous.primary.hex), tokenHue(analogous.accent.hex));
    const complementaryAccentDistance = hueDistance(
      tokenHue(complementary.primary.hex),
      tokenHue(complementary.accent.hex),
    );
    const analogousWithAccentDistance = hueDistance(
      tokenHue(analogousWithAccent.primary.hex),
      tokenHue(analogousWithAccent.accent.hex),
    );

    expect(analogousAccentDistance).toBeGreaterThanOrEqual(30);
    expect(analogousAccentDistance).toBeLessThanOrEqual(40);
    expect(complementaryAccentDistance).toBeGreaterThanOrEqual(165);
    expect(complementaryAccentDistance).toBeLessThanOrEqual(195);
    expect(analogousWithAccentDistance).toBeGreaterThanOrEqual(165);
    expect(analogousWithAccentDistance).toBeLessThanOrEqual(195);
    expect(contrastRatio(analogousWithAccent.accent.hex, analogousWithAccent.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(analogousWithAccent['on-accent'].hex, analogousWithAccent.accent.hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps real chromatic extracted candidates ahead of synthesis strategy fallbacks', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#C03A2B', prominence: 0.4 },
        { hex: '#2468C8', prominence: 0.35 },
        { hex: '#1F8A4C', prominence: 0.25 },
      ],
      synthesisStrategy: 'analogous',
    });

    expect(tokens.primary.source === 'extracted' || tokens.primary.source === 'corrected').toBe(true);
    expect(tokens.secondary.source === 'extracted' || tokens.secondary.source === 'corrected').toBe(true);
    expect(tokens.accent.source === 'extracted' || tokens.accent.source === 'corrected').toBe(true);
  });

  it('derives data colors only from source hues and keeps them legible', () => {
    for (const theme of ['light', 'dark'] as const) {
      const tokens = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme });
      const entries = ['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'] as const;
      const usable = entries.map((name) => tokens[name]).filter((entry) => !entry.gap);

      for (const entry of usable) {
        expect(entry.originalHex).toBeTruthy();
        expect(hueDistance(tokenHue(entry.hex), tokenHue(entry.originalHex!))).toBeLessThanOrEqual(3);
        expect(contrastRatio(entry.hex, tokens.background.hex)).toBeGreaterThanOrEqual(3);
      }

      for (let left = 0; left < usable.length; left += 1) {
        for (let right = left + 1; right < usable.length; right += 1) {
          const hueSeparated = hueDistance(tokenHue(usable[left]!.hex), tokenHue(usable[right]!.hex)) >= 25;
          const lightnessSeparated = Math.abs(tokenLightness(usable[left]!.hex) - tokenLightness(usable[right]!.hex)) >= 0.15;
          expect(hueSeparated || lightnessSeparated).toBe(true);
        }
      }
    }
  });

  it('declares data gaps instead of inventing hues for neutral input', () => {
    const tokens = deriveSemanticTokens({ extracted: nearMonochromeExtracted() });

    for (const name of ['data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6'] as const) {
      expect(tokens[name].gap).toBeTruthy();
    }
  });

  it('preserves extracted expressive tokens at every vibrancy setting', () => {
    const pastel = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 0 });
    const bright = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 100 });
    const sourceHexes = EXPRESSIVE_SAMPLE.map((color) => color.hex);

    for (const tokenName of ['primary', 'secondary', 'accent'] as const) {
      expect(sourceHexes).toContain(pastel[tokenName].hex);
      expect(bright[tokenName].hex).toBe(pastel[tokenName].hex);
      expect(contrastRatio(pastel[`on-${tokenName}`].hex, pastel[tokenName].hex)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('does not allow neutralStyle to remove the image tint', () => {
    for (const theme of ['light', 'dark'] as const) {
      const pure = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, neutralStyle: 'pure' });
      const tinted = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, neutralStyle: 'tinted' });

      expect(pure.background.hex).toBe(tinted.background.hex);
      expect(tokenChroma(pure.background.hex)).toBeGreaterThan(0);
      expect(pure.background.hex).not.toBe(theme === 'light' ? '#FFFFFF' : '#000000');
    }
  });

  it('leaves structural neutral tokens byte-for-byte unchanged across vibrancy extremes', () => {
    const pastel = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 0 });
    const bright = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 100 });

    for (const tokenName of STRUCTURAL_NEUTRAL_TOKENS) {
      expect(bright[tokenName].hex, tokenName).toBe(pastel[tokenName].hex);
    }
  });

  it('projects saved vibrancy through RolePalette and semantic overrides', () => {
    const brightTokens = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 100 });
    const projected = deriveRolePaletteFromSemanticInput({
      extracted: EXPRESSIVE_SAMPLE,
      vibrancy: 100,
    });
    const overrides = rolePaletteAsSemanticOverrides(projected);
    const roundTrip = deriveSemanticTokens({
      extracted: EXPRESSIVE_SAMPLE,
      overrides,
      vibrancy: 50,
    });

    expect(projected.primario.hex).toBe(brightTokens.primary.hex);
    expect(projected.secundario.hex).toBe(brightTokens.secondary.hex);
    expect(projected.acento.hex).toBe(brightTokens.accent.hex);
    expect(roundTrip.primary.hex).toBe(projected.primario.hex);
    expect(roundTrip.secondary.hex).toBe(projected.secundario.hex);
    expect(roundTrip.accent.hex).toBe(projected.acento.hex);
  });
});
