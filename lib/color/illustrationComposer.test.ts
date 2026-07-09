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
  it('creates reproducible bento compositions for the same seed and tokens', () => {
    const input = { seed: 1729, tokens, paletteInput: illustration.contract.rendererInput };
    const first = composeIllustration('bento', input);
    const second = composeIllustration('bento', input);

    expect(second).toEqual(first);
  });

  it('changes geometry or paint assignment when the seed changes', () => {
    const first = composeIllustration('bento', {
      seed: 1729,
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });
    const second = composeIllustration('bento', {
      seed: nextIllustrationSeed(1729),
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });

    expect(second.cells).not.toEqual(first.cells);
  });

  it('uses only existing expressive and tonal semantic token values', () => {
    const composition = composeIllustration('bento', {
      seed: 1729,
      tokens,
      paletteInput: illustration.contract.rendererInput,
    });
    const allowedTokens = new Set([
      ...Object.values(illustration.contract.rendererInput.bases),
      ...Object.values(illustration.contract.rendererInput.states),
      ...Object.values(illustration.contract.rendererInput.tonalScales).flat(),
    ]);
    const usedPaints = [
      composition.background,
      ...composition.cells.flatMap((cell) => [cell.paint, cell.shape?.paint].filter(Boolean)),
    ];

    for (const paint of usedPaints) {
      expect(allowedTokens.has(paint!.token)).toBe(true);
      expect(paint!.hex).toBe(tokens[paint!.token].hex);
    }
  });
});
