import type { PaletteTokens } from '@lib/color/paletteTokens';

export type MockupVariant = 'preview' | 'expanded';

export type MockupFonts = {
  headingFamily: string;
  bodyFamily: string;
};

export type MockupPaletteProps = {
  tokens: PaletteTokens;
  variant?: MockupVariant;
  fonts: MockupFonts;
};
