import { describe, expect, it } from 'vitest';

import type { GeneratedPalette } from './formulas';
import { buildPaletteTokens } from './paletteTokens';

const palette: GeneratedPalette = {
  primary: '#2563EB',
  accent: '#F59E0B',
  surface: '#FFFFFF',
  onSurface: '#1F2937',
  neutralLight: '#F3F4F6',
  neutralDark: '#374151',
};

describe('buildPaletteTokens', () => {
  it('maps generated palette roles to semantic UI tokens', () => {
    const tokens = buildPaletteTokens(palette);

    expect(tokens.surface).toBe(palette.surface);
    expect(tokens.onSurface).toBe(palette.onSurface);
    expect(tokens.primary).toBe(palette.primary);
    expect(tokens.accent).toBe(palette.accent);
    expect(tokens.neutralLight).toBe(palette.neutralLight);
    expect(tokens.neutralDark).toBe(palette.neutralDark);
    expect(tokens.border).toBe(palette.neutralDark);
  });
});
