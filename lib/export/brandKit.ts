import type { GeneratedPalette } from '../color/formulas';
import type { PaletteSeeds, RolePalette } from '../color/rolePalette';
import type { FontPair } from '../typography/pairings';
import type { ThemesConfig } from '../color/themePalette';

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
  themeInput?: { seeds: PaletteSeeds; themes: ThemesConfig },
): BrandKitPayload {
  const seeds = themeInput?.seeds ?? {
    primario: rolePalette.primario.hex,
    acento: rolePalette.acento.hex,
    neutralHue: 0,
  };

  return {
    version: 1,
    name: kitName,
    exportedAt: new Date().toISOString(),
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
    designMd: generateDesignMd({
      seeds,
      themes: themeInput?.themes,
      pairing,
      kitName,
    }),
  };
}

export function serializeBrandKit(kit: BrandKitPayload): string {
  return JSON.stringify(kit, null, 2);
}
