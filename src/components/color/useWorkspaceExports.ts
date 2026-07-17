'use client';

import { generatePaletteFromRolePalette } from '@lib/color/rolePalette';
import type { RolePalette } from '@lib/color/rolePalette';
import type { SemanticTokenOverrides } from '@lib/color/semanticTokens';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import {
  buildExportTokenSet,
  canExportTokenSet,
  formatMissingCoreLabel,
} from '@lib/export/exportTokenSet';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import { toCss, toTokensStudio, toW3cJson } from '@lib/export/serializeExportTokens';
import type { FontPair } from '@lib/typography/pairings';
import { downloadTextFile } from '@/lib/browser/download';

export function useWorkspaceExports({
  rolePalette,
  tokenOverridesByTheme,
  exportStatusTokenOverrides = {},
  selectedPairing,
  setError,
  setStatusMessage,
  kitName = 'craftie-tokens',
}: {
  rolePalette: RolePalette | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  /** Confirmed status colors (success/warning/error) merged into the light slot for export. */
  exportStatusTokenOverrides?: SemanticTokenOverrides;
  selectedPairing: FontPair | null;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  kitName?: string;
}) {
  // Merge confirmed status colors into the light overrides without mutating the source objects.
  const exportOverridesByTheme = {
    light: { ...tokenOverridesByTheme.light, ...exportStatusTokenOverrides },
    dark: { ...tokenOverridesByTheme.dark },
  };
  const tokenSet = buildExportTokenSet({
    rolePalette,
    tokenOverridesByTheme: exportOverridesByTheme,
    pairing: selectedPairing,
    name: kitName,
  });
  const canExport = canExportTokenSet(tokenSet);
  const exportBlockedReason = canExport
    ? null
    : `Falta: ${formatMissingCoreLabel(tokenSet.meta.missingCore)}`;

  function download(filename: string, content: string, mime: string, success: string) {
    const result = downloadTextFile(filename, content, mime);
    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }
    setError(null);
    setStatusMessage(success);
  }

  function requireExportable(): boolean {
    if (!canExport) {
      setError(exportBlockedReason);
      setStatusMessage(null);
      return false;
    }
    return true;
  }

  function handleExportCss() {
    if (!requireExportable()) return;
    download('tokens.css', toCss(tokenSet), 'text/css;charset=utf-8', 'tokens.css descargado.');
  }

  function handleExportTokensJson() {
    if (!requireExportable()) return;
    download(
      'tokens.json',
      toW3cJson(tokenSet),
      'application/json;charset=utf-8',
      'tokens.json descargado.',
    );
  }

  function handleExportFigmaTokens() {
    if (!requireExportable()) return;
    download(
      'figma-tokens.json',
      toTokensStudio(tokenSet),
      'application/json;charset=utf-8',
      'figma-tokens.json descargado.',
    );
  }

  function handleExportDesignMd() {
    if (!requireExportable()) return;
    download(
      'DESIGN.md',
      generateDesignMd(tokenSet),
      'text/markdown;charset=utf-8',
      'DESIGN.md descargado en tu carpeta de descargas.',
    );
  }

  function handleExportBrandKit() {
    if (!requireExportable() || !rolePalette) return;
    // Always derive from the export role palette (light-stable) so brand-kit.json
    // never mixes a UI/review palette that may reflect the active dark theme.
    const palette = generatePaletteFromRolePalette(rolePalette);
    const kit = buildBrandKit(palette, rolePalette, selectedPairing, kitName, {
      tokenOverridesByTheme: exportOverridesByTheme,
    });
    download(
      'brand-kit.json',
      serializeBrandKit(kit),
      'application/json;charset=utf-8',
      'Brand kit (.json) descargado.',
    );
  }

  return {
    canExport,
    exportBlockedReason,
    handleExportBrandKit,
    handleExportCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
  };
}
