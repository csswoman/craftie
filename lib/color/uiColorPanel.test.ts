import { describe, expect, it } from 'vitest';

import { deriveSemanticTokens } from './semanticTokens';
import {
  buildTintedNeutralRamp,
  deriveMissingDataColors,
  rolesBySourceHex,
} from './uiColorPanel';
import type { SelectableColor } from './selectableColors';
import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';

const colors: SelectableColor[] = [
  { id: 'brick', name: 'Brick', hex: '#94202E', group: 'bold', prominence: 0.7 },
  { id: 'mandy', name: 'Mandy', hex: '#E04B62', group: 'bold', prominence: 0.3 },
];

describe('UI color panel model', () => {
  it('builds eight tinted neutrals from the source hue', () => {
    const ramp = buildTintedNeutralRamp(colors);
    expect(ramp.steps).toHaveLength(8);
    expect(ramp.steps.map((step) => step.lightness)).toEqual([0.98, 0.96, 0.93, 0.88, 0.72, 0.53, 0.33, 0.2]);
    expect(ramp.steps.every((step) => hexToOklchChannels(step.hex).c > 0)).toBe(true);
  });

  it('indexes every system role occupying a source hex', () => {
    const tokens = deriveSemanticTokens({ extracted: colors.map(({ hex, prominence = 1 }) => ({ hex, prominence })) });
    const roles = rolesBySourceHex(tokens);
    expect(roles.get(tokens.primary.hex)).toContain('Primario');
  });

  it('derives only data colors with 3:1 contrast when gaps exist', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#94202E', prominence: 1 }],
      paletteType: 'vivid',
    });
    const derived = deriveMissingDataColors(tokens, colors);
    expect(derived.every((hex) => contrastRatio(hex, tokens.background.hex) >= 3)).toBe(true);
  });
});
