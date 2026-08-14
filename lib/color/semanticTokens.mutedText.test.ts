import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../utils/colorMath';
import { deriveSemanticTokens } from './semanticTokens';
import { assignRolesFromHexes } from './rolePalette';
import { isTextSafe } from './roleFitness';

describe('on-background-muted', () => {
  it('derives muted text near 3:1 against surface and weaker than primary text', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const mutedRatio = contrastRatio(tokens['on-background-muted'].hex, tokens.surface.hex);
    const mainRatio = contrastRatio(tokens['on-background'].hex, tokens.surface.hex);
    expect(mutedRatio).toBeGreaterThanOrEqual(2.8);
    expect(mutedRatio).toBeLessThanOrEqual(3.4);
    expect(mutedRatio).toBeLessThan(mainRatio);
  });
});

describe('RoleSlot.textSafe projection', () => {
  it('sets textSafe on expressive roles from isTextSafe vs surface', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    expect(palette.primario.textSafe).toBe(
      isTextSafe(palette.primario.hex, palette.superficie.hex),
    );
    expect(palette.secundario.textSafe).toBe(
      isTextSafe(palette.secundario.hex, palette.superficie.hex),
    );
    expect(palette.acento.textSafe).toBe(
      isTextSafe(palette.acento.hex, palette.superficie.hex),
    );
    expect(palette['texto-secundario'].hex).toBeTruthy();
  });
});
