'use client';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { PaletteSeeds, RolePalette } from '@lib/color/rolePalette';
import type { ThemesConfig } from '@lib/color/themePalette';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import type { FontPair } from '@lib/typography/pairings';
import { downloadTextFile } from '@/lib/browser/download';

export function useWorkspaceExports({
  generatedPalette,
  rolePalette,
  seeds,
  selectedPairing,
  setError,
  setStatusMessage,
  themes,
}: {
  generatedPalette: GeneratedPalette | null;
  rolePalette: RolePalette | null;
  seeds: PaletteSeeds | null;
  selectedPairing: FontPair | null;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  themes: ThemesConfig;
}) {
  function handleExportDesignMd() {
    if (!generatedPalette || !rolePalette || !seeds) return;
    const content = generateDesignMd({ seeds, themes, pairing: selectedPairing });
    const result = downloadTextFile('DESIGN.md', content, 'text/markdown;charset=utf-8');

    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('DESIGN.md descargado.');
  }

  function handleExportBrandKit() {
    if (!generatedPalette || !rolePalette || !seeds) return;
    const kit = buildBrandKit(generatedPalette, rolePalette, selectedPairing, 'Craftie Kit', {
      seeds,
      themes,
    });
    const result = downloadTextFile('brand-kit.json', serializeBrandKit(kit), 'application/json;charset=utf-8');

    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('Brand Kit descargado.');
  }

  return { handleExportBrandKit, handleExportDesignMd };
}
