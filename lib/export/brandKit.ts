import type { GeneratedPalette } from '@lib/color/formulas';
import type { FontPair } from '@lib/typography/pairings';

import { generateDesignMd } from './generateDesignMd';

export type BrandKitPayload = {
  version: 1;
  name: string;
  exportedAt: string;
  palette: GeneratedPalette;
  typography: {
    heading: { family: string; classification: string };
    body: { family: string; classification: string };
  } | null;
  designMd: string;
};

export function buildBrandKit(
  palette: GeneratedPalette,
  pairing: FontPair | null,
  kitName = 'Craftie Kit',
): BrandKitPayload {
  return {
    version: 1,
    name: kitName,
    exportedAt: new Date().toISOString(),
    palette,
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
    designMd: generateDesignMd({ palette, pairing, kitName }),
  };
}

export function serializeBrandKit(kit: BrandKitPayload): string {
  return JSON.stringify(kit, null, 2);
}
