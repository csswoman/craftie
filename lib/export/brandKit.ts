import type { GeneratedPalette } from '../color/formulas';
import type { PaletteSeeds, RolePalette } from '../color/rolePalette';
import type { SemanticTokenOverrides } from '../color/semanticTokens';
import type { FontPair } from '../typography/pairings';
import type { ThemesConfig } from '../color/themePalette';

import { buildExportTokenSet } from './exportTokenSet';
import { generateDesignMd } from './generateDesignMd';

export type BrandKitPayload = {
  version: 1;
  name: string;
  exportedAt: string;
  palette: GeneratedPalette;
  rolePalette: RolePalette;
  typography: {
    heading: { family: string; classification: string };
    body: { family: string; classification: string };
  } | null;
  designMd: string;
};

export function buildBrandKit(
  palette: GeneratedPalette,
  rolePalette: RolePalette,
  pairing: FontPair | null,
  kitName = 'Craftie Kit',
  themeInput?: {
    seeds?: PaletteSeeds;
    themes?: ThemesConfig;
    tokenOverridesByTheme?: {
      light: SemanticTokenOverrides;
      dark: SemanticTokenOverrides;
    };
  },
): BrandKitPayload {
  const exportedAt = new Date().toISOString();

  let designMd: string;
  if (themeInput?.tokenOverridesByTheme) {
    designMd = generateDesignMd(
      buildExportTokenSet({
        rolePalette,
        tokenOverridesByTheme: themeInput.tokenOverridesByTheme,
        pairing,
        name: kitName,
        exportedAt,
      }),
    );
  } else if (themeInput?.seeds) {
    designMd = generateDesignMd({
      seeds: themeInput.seeds,
      themes: themeInput.themes,
      pairing,
      kitName,
    });
  } else {
    designMd = generateDesignMd(
      buildExportTokenSet({
        rolePalette,
        tokenOverridesByTheme: { light: {}, dark: {} },
        pairing,
        name: kitName,
        exportedAt,
      }),
    );
  }

  return {
    version: 1,
    name: kitName,
    exportedAt,
    palette,
    rolePalette,
    typography: pairing
      ? {
          heading: {
            family: pairing.heading.family,
            classification: pairing.heading.classification,
          },
          body: {
            family: pairing.body.family,
            classification: pairing.body.classification,
          },
        }
      : null,
    designMd,
  };
}

export function serializeBrandKit(kit: BrandKitPayload): string {
  return JSON.stringify(kit, null, 2);
}
