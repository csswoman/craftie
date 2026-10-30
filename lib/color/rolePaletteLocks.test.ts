import { describe, expect, it } from 'vitest';

import type { ExtractedColor } from './imageExtractor';
import { assignRolesFromExtracted, mergeRolePalettePreservingLocks } from './rolePalette';

const RICH_EXTRACTION: ExtractedColor[] = [
  { hex: '#F7F7F5', prominence: 0.3 },
  { hex: '#EFEFE8', prominence: 0.15 },
  { hex: '#9ADBD6', prominence: 0.2 },
  { hex: '#E8D44D', prominence: 0.15 },
  { hex: '#F4A261', prominence: 0.1 },
  { hex: '#2C3E50', prominence: 0.1 },
];

describe('mergeRolePalettePreservingLocks', () => {
  it('does not overwrite locked roles when a new extraction is merged', () => {
    const current = assignRolesFromExtracted(RICH_EXTRACTION);
    const lockedFondo = current.fondo.hex;
    const lockedTexto = current.texto.hex;
    const reassigned = assignRolesFromExtracted([
      { hex: '#FFFFFF', prominence: 0.5 },
      { hex: '#FF0000', prominence: 0.3 },
      { hex: '#00FF00', prominence: 0.2 },
    ]);

    const merged = mergeRolePalettePreservingLocks(current, reassigned, ['fondo', 'texto']);

    expect(merged.fondo.hex).toBe(lockedFondo);
    expect(merged.texto.hex).toBe(lockedTexto);
    expect(merged.primario.hex).toBe(reassigned.primario.hex);
  });
});
