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
const EXPECTED_DATA_SERIES_MIN_CHROMA = 0.1;

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

function averageChroma(hexes: string[]): number {
  return hexes.reduce((total, hex) => total + tokenChroma(hex), 0) / hexes.length;
}

function dataSeries(tokens: ReturnType<typeof deriveSemanticTokens>) {
  return [
    tokens['data-1'].hex,
    tokens['data-2'].hex,
    tokens['data-3'].hex,
    tokens['data-4'].hex,
    tokens['data-5'].hex,
    tokens['data-6'].hex,
  ];
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

function expectPairwiseDataDistinguishable(series: string[]) {
  for (let left = 0; left < series.length; left += 1) {
    for (let right = left + 1; right < series.length; right += 1) {
      const hueSeparated = hueDistance(tokenHue(series[left]!), tokenHue(series[right]!)) >= 24;
      const lightnessSeparated =
        Math.abs(tokenLightness(series[left]!) - tokenLightness(series[right]!)) >= 0.02;

      expect(
        hueSeparated || lightnessSeparated,
        `${series[left]} (${tokenLightness(series[left]!).toFixed(3)}) vs ${series[right]} (${tokenLightness(series[right]!).toFixed(3)})`,
      ).toBe(true);
    }
  }
}

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

  it('uses pure neutral chrome by default', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#F7F7F5', prominence: 0.5 },
        { hex: '#3366CC', prominence: 0.3 },
        { hex: '#111111', prominence: 0.2 },
      ],
    });

    expect(toOklch(tokens.background.hex)?.c ?? 1).toBeLessThan(0.004);
    expect(toOklch(tokens.surface.hex)?.c ?? 1).toBeLessThan(0.004);
    expect(toOklch(tokens['background-inverse'].hex)?.c ?? 1).toBeLessThan(0.004);
  });

  it('uses pure achromatic neutrals only when the image is achromatic', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#EFEFEF', prominence: 0.6 },
        { hex: '#222222', prominence: 0.4 },
      ],
    });

    expect(toOklch(tokens.background.hex)?.c ?? 1).toBeLessThan(0.004);
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

  it('corrects expressive lightness until it passes on surface', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#9ADBD6', prominence: 0.5 },
        { hex: '#E8D44D', prominence: 0.3 },
        { hex: '#F4A261', prominence: 0.2 },
      ],
    });

    expect(contrastRatio(tokens.primary.hex, tokens.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.accent.hex, tokens.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens['on-primary'].hex, tokens.primary.hex)).toBeGreaterThanOrEqual(4.5);
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

  it('selects data-series tonal steps that contrast and stay distinguishable on light chrome', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#C03A2B', prominence: 0.28 },
        { hex: '#2468C8', prominence: 0.24 },
        { hex: '#1F8A4C', prominence: 0.2 },
        { hex: '#8C4BC7', prominence: 0.16 },
        { hex: '#C58A1F', prominence: 0.12 },
      ],
      theme: 'light',
    });
    const series = dataSeries(tokens);

    for (const hex of series) {
      expect(contrastRatio(hex, tokens.surface.hex)).toBeGreaterThanOrEqual(3);
      expect(tokenChroma(hex)).toBeGreaterThanOrEqual(EXPECTED_DATA_SERIES_MIN_CHROMA - 0.01);
      expect(tokenLightness(hex)).toBeGreaterThanOrEqual(0.35);
      expect(tokenLightness(hex)).toBeLessThanOrEqual(0.65);
    }

    expectPairwiseDataDistinguishable(series);
  });

  it('selects data-series tonal steps that contrast and stay distinguishable on dark chrome', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#C03A2B', prominence: 0.28 },
        { hex: '#2468C8', prominence: 0.24 },
        { hex: '#1F8A4C', prominence: 0.2 },
        { hex: '#8C4BC7', prominence: 0.16 },
        { hex: '#C58A1F', prominence: 0.12 },
      ],
      theme: 'dark',
    });
    const series = dataSeries(tokens);

    for (const hex of series) {
      expect(contrastRatio(hex, tokens.surface.hex)).toBeGreaterThanOrEqual(3);
      expect(tokenChroma(hex)).toBeGreaterThanOrEqual(EXPECTED_DATA_SERIES_MIN_CHROMA - 0.01);
    }

    expectPairwiseDataDistinguishable(series);
  });

  it('uses vivid bounded-hue data series instead of complementary invented hues for near-monochrome input', () => {
    for (const theme of ['light', 'dark'] as const) {
      const tokens = deriveSemanticTokens({
        extracted: nearMonochromeExtracted(),
        theme,
      });
      const series = dataSeries(tokens).slice(0, 5);
      const primaryHue = tokenHue(tokens.primary.hex);

      for (const hex of series) {
        expect(contrastRatio(hex, tokens.surface.hex)).toBeGreaterThanOrEqual(3);
        expect(tokenChroma(hex)).toBeGreaterThanOrEqual(EXPECTED_DATA_SERIES_MIN_CHROMA - 0.01);
        expect(hueDistance(primaryHue, tokenHue(hex))).toBeLessThanOrEqual(90);
      }

      expectPairwiseDataDistinguishable(series);
      expect(hueDistance(primaryHue, tokenHue(tokens['data-6'].hex))).toBeLessThanOrEqual(90);
    }
  });

  it('boosts data-series chroma for deliberately desaturated source images at bright vibrancy', () => {
    for (const theme of ['light', 'dark'] as const) {
      const tokens = deriveSemanticTokens({
        extracted: [
          { hex: oklchChannelsToHex(0.52, 0.018, 210), prominence: 0.45 },
          { hex: oklchChannelsToHex(0.46, 0.016, 214), prominence: 0.35 },
          { hex: oklchChannelsToHex(0.38, 0.014, 206), prominence: 0.2 },
        ],
        theme,
        vibrancy: 100,
      });

      for (const hex of dataSeries(tokens)) {
        expect(tokenChroma(hex)).toBeGreaterThanOrEqual(EXPECTED_DATA_SERIES_MIN_CHROMA - 0.01);
        expect(contrastRatio(hex, tokens.surface.hex)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('lowers data-series chroma at pastel vibrancy without clamping above expressive chroma', () => {
    const midpoint = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 50 });
    const pastel = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 0 });
    const pastelSeries = dataSeries(pastel);
    const maxPastelExpressiveChroma = Math.max(
      tokenChroma(pastel.primary.hex),
      tokenChroma(pastel.secondary.hex),
      tokenChroma(pastel.accent.hex),
    );

    expect(averageChroma(pastelSeries)).toBeLessThan(averageChroma(dataSeries(midpoint)));

    for (const hex of pastelSeries) {
      expect(tokenChroma(hex)).toBeLessThanOrEqual(maxPastelExpressiveChroma + 0.01);
      expect(contrastRatio(hex, pastel.surface.hex)).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps pastel data series distinguishable with hue or lightness separation', () => {
    const pastel = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 0 });
    const series = dataSeries(pastel);

    expectPairwiseDataDistinguishable(series);

    for (const hex of series) {
      expect(contrastRatio(hex, pastel.surface.hex)).toBeGreaterThanOrEqual(3);
    }
  });

  it('preserves vivid chroma for already saturated source colors in data series', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#00E676', prominence: 0.34 },
        { hex: '#7B61FF', prominence: 0.28 },
        { hex: '#FF4D8D', prominence: 0.22 },
        { hex: '#FFB000', prominence: 0.16 },
      ],
      theme: 'light',
    });
    const sourceChroma = ['#00E676', '#7B61FF', '#FF4D8D', '#FFB000'].map(tokenChroma);
    const sourceFloor = Math.min(...sourceChroma) * 0.75;

    for (const hex of dataSeries(tokens).slice(0, 4)) {
      expect(tokenChroma(hex)).toBeGreaterThanOrEqual(Math.max(EXPECTED_DATA_SERIES_MIN_CHROMA - 0.01, sourceFloor - 0.01));
      expect(contrastRatio(hex, tokens.surface.hex)).toBeGreaterThanOrEqual(3);
    }
  });

  it('calibrates pastel expressive tokens to high-lightness low-chroma colors with readable on-* pairs', () => {
    const midpoint = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 50 });
    const pastel = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 0 });

    for (const tokenName of ['primary', 'secondary', 'accent'] as const) {
      expect(tokenLightness(pastel[tokenName].hex)).toBeGreaterThan(0.72);
      expect(tokenChroma(pastel[tokenName].hex)).toBeLessThan(tokenChroma(midpoint[tokenName].hex));
      expect(tokenChroma(pastel[tokenName].hex)).toBeLessThanOrEqual(0.1);
    }

    expect(contrastRatio(pastel['on-primary'].hex, pastel.primary.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(pastel['on-secondary'].hex, pastel.secondary.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(pastel['on-accent'].hex, pastel.accent.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(pastel['on-hero'].hex, pastel['hero-surface'].hex)).toBeGreaterThanOrEqual(4.5);
  });

  it('calibrates bright expressive tokens and data series to high chroma above the series floor', () => {
    const midpoint = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 50 });
    const bright = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, vibrancy: 100 });

    for (const tokenName of ['primary', 'secondary', 'accent'] as const) {
      expect(tokenChroma(bright[tokenName].hex)).toBeGreaterThan(tokenChroma(midpoint[tokenName].hex));
      expect(tokenLightness(bright[tokenName].hex)).toBeGreaterThanOrEqual(0.5);
      expect(tokenLightness(bright[tokenName].hex)).toBeLessThanOrEqual(0.66);
    }

    for (const hex of dataSeries(bright)) {
      expect(tokenChroma(hex)).toBeGreaterThanOrEqual(EXPECTED_DATA_SERIES_MIN_CHROMA);
      expect(contrastRatio(hex, bright.surface.hex)).toBeGreaterThanOrEqual(3);
    }
  });

  it('does not mutate raw extracted source colors when vibrancy changes', () => {
    const extracted = EXPRESSIVE_SAMPLE.map((color) => ({ ...color }));
    const originalHexes = extracted.map((color) => color.hex);

    const pastel = deriveSemanticTokens({ extracted, vibrancy: 0 });
    const bright = deriveSemanticTokens({ extracted, vibrancy: 100 });

    expect(extracted.map((color) => color.hex)).toEqual(originalHexes);
    expect(pastel.primary.hex).not.toBe(bright.primary.hex);
  });

  it('applies vibrancy to both light and dark theme branches', () => {
    for (const theme of ['light', 'dark'] as const) {
      const midpoint = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, vibrancy: 50 });
      const bright = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, vibrancy: 100 });

      expect(bright.primary.hex).not.toBe(midpoint.primary.hex);
      expect(bright.secondary.hex).not.toBe(midpoint.secondary.hex);
      expect(bright.accent.hex).not.toBe(midpoint.accent.hex);
      expect(contrastRatio(bright['on-primary'].hex, bright.primary.hex)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bright['on-secondary'].hex, bright.secondary.hex)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(bright['on-accent'].hex, bright.accent.hex)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('applies neutralStyle to both light and dark theme branches', () => {
    for (const theme of ['light', 'dark'] as const) {
      const pure = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, neutralStyle: 'pure' });
      const tinted = deriveSemanticTokens({ extracted: EXPRESSIVE_SAMPLE, theme, neutralStyle: 'tinted' });

      expect(tinted.background.hex).not.toBe(pure.background.hex);
      expect(tinted.surface.hex).not.toBe(pure.surface.hex);
      expect(tinted.border.hex).not.toBe(pure.border.hex);
      expect(tinted.divider.hex).not.toBe(pure.divider.hex);
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
