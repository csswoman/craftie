import type { GeneratedPalette } from './formulas';

/** Semantic color roles for UI previews and mockups. */
export type PaletteTokens = {
  surface: string;
  onSurface: string;
  primary: string;
  accent: string;
  border: string;
  neutralLight: string;
  neutralDark: string;
};

export function buildPaletteTokens(palette: GeneratedPalette): PaletteTokens {
  return {
    surface: palette.surface,
    onSurface: palette.onSurface,
    primary: palette.primary,
    accent: palette.accent,
    border: palette.neutralDark,
    neutralLight: palette.neutralLight,
    neutralDark: palette.neutralDark,
  };
}
