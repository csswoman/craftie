import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from './semanticTokens';
import { composeIllustration, nextIllustrationSeed } from './illustrationComposer';
import { getPreviewFamily } from './previewFamilies';

const tokens = deriveSemanticTokens({
  extracted: [
    { hex: '#3366CC', prominence: 1 },
    { hex: '#E85D75', prominence: 0.9 },
    { hex: '#F2C94C', prominence: 0.8 },
  ],
});
const illustration = getPreviewFamily('illustration');

if (illustration.id !== 'illustration') {
  throw new Error('Expected illustration family');
}

describe('illustrationComposer', () => {
  it('creates reproducible color studio compositions for the same seed and tokens', () => {
    const input = { seed: 1729, tokens, paletteInput: illustration.contract.rendererInput };
    const first = composeIllustration('color-studio', input);
    const second = composeIllustration('color-studio', input);

    expect(second).toEqual(first);
  });

  it('changes geometry or paint assignment when the seed changes', () => {
    const first = composeIllustration('color-studio', {
      seed: 1729,
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });
    const second = composeIllustration('color-studio', {
      seed: nextIllustrationSeed(1729),
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });

    expect(second).not.toEqual(first);
  });

  it('recolors the same composition when the palette changes', () => {
    const alternateTokens = deriveSemanticTokens({
      extracted: [
        { hex: '#6B2D5C', prominence: 1 },
        { hex: '#F4B942', prominence: 0.9 },
        { hex: '#4F7CAC', prominence: 0.8 },
      ],
    });
    const first = composeIllustration('color-studio', {
      seed: 1729,
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });
    const recolored = composeIllustration('color-studio', {
      seed: 1729,
      tokens: alternateTokens,
      paletteInput: illustration.contract.rendererInput,
    });

    expect(recolored.variant).toBe(first.variant);
    expect(recolored.posterRotation).toBe(first.posterRotation);
    expect(recolored.featured.map((paint) => paint.hex)).not.toEqual(
      first.featured.map((paint) => paint.hex),
    );
    expect(recolored.pawToes.map((paint) => paint.hex)).not.toEqual(
      first.pawToes.map((paint) => paint.hex),
    );
  });

  it('uses the active theme for structural surfaces and text', () => {
    const source = [
      { hex: '#3366CC', prominence: 1 },
      { hex: '#E85D75', prominence: 0.9 },
      { hex: '#F2C94C', prominence: 0.8 },
    ];
    const lightTokens = deriveSemanticTokens({ extracted: source, theme: 'light' });
    const darkTokens = deriveSemanticTokens({ extracted: source, theme: 'dark' });
    const input = { seed: 1729, paletteInput: illustration.contract.rendererInput };
    const light = composeIllustration('color-studio', { ...input, tokens: lightTokens });
    const dark = composeIllustration('color-studio', { ...input, tokens: darkTokens });

    expect(light.background.token).toBe('background');
    expect(dark.background.hex).toBe(darkTokens.background.hex);
    expect(dark.paper.hex).toBe(darkTokens.surface.hex);
    expect(dark.ink.hex).toBe(darkTokens['on-surface'].hex);
    expect(dark.background.hex).not.toBe(light.background.hex);
    expect(dark.paper.hex).not.toBe(light.paper.hex);
  });

  it('uses only existing semantic token values', () => {
    const composition = composeIllustration('color-studio', {
      seed: 1729,
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });
    const allowedTokens = new Set([
      'background',
      'surface',
      'surface-elevated',
      'on-surface',
      'on-surface-muted',
      'border',
      'divider',
      ...Object.values(illustration.contract.rendererInput.bases),
      ...Object.values(illustration.contract.rendererInput.states),
      ...Object.values(illustration.contract.rendererInput.tonalScales).flat(),
    ]);
    const usedPaints = [
      composition.background,
      composition.paper,
      composition.paperElevated,
      composition.ink,
      composition.mutedInk,
      composition.border,
      composition.divider,
      ...composition.featured,
      ...composition.pawToes,
      ...composition.soft,
      ...composition.scale,
    ];

    for (const paint of usedPaints) {
      expect(allowedTokens.has(paint!.token)).toBe(true);
      expect(paint!.hex).toBe(tokens[paint!.token].hex);
    }
  });
});
