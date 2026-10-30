'use client';

import { generatePaletteFromRolePalette } from '@lib/color/rolePalette';
import type { NeutralScale } from '@lib/color/neutralScale';
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
import { encodeShareSnapshot } from '@lib/studio/shareLink';
import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';
import { downloadTextFile } from '@/lib/browser/download';
import { exportPaletteImage } from '@/lib/browser/exportPaletteImage';
import {
  buildShareUrl,
  copyTextToClipboard,
} from '@/lib/browser/shareUrl';

export function useWorkspaceExports({
  rolePalette,
  neutralScale = null,
  tokenOverridesByTheme,
  exportStatusTokenOverrides = {},
  selectedPairing,
  getShareSnapshot,
  setError,
  setStatusMessage,
  kitName = 'craftie-tokens',
}: {
  rolePalette: RolePalette | null;
  neutralScale?: NeutralScale | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  /** Confirmed status colors (success/warning/error) merged into the light slot for export. */
  exportStatusTokenOverrides?: SemanticTokenOverrides;
  selectedPairing: FontPair | null;
  /** Builds the current serializable workspace snapshot for the share link. */
  getShareSnapshot: () => WorkspaceSnapshot;
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
    neutralScale,
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

  async function handleCopyCss() {
    if (!requireExportable()) return;
    const copied = await copyTextToClipboard(toCss(tokenSet));
    if (!copied) {
      setError('No se pudo copiar el CSS. Descárgalo desde Exportar.');
      setStatusMessage(null);
      return;
    }
    setError(null);
    setStatusMessage('CSS copiado al portapapeles.');
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

  async function handleExportImage() {
    if (!requireExportable() || !rolePalette) return;

    const result = await exportPaletteImage({
      palette: rolePalette,
      title: kitName,
      pairing: selectedPairing
        ? { heading: selectedPairing.heading.family, body: selectedPairing.body.family }
        : null,
    });

    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('Imagen (.png) descargada con tu paleta y tipografía.');
  }

  async function handleCopyShareLink() {
    const encoded = encodeShareSnapshot(getShareSnapshot());
    const url = buildShareUrl(encoded);

    if (url === null) {
      setError('No se pudo generar el enlace para compartir.');
      setStatusMessage(null);
      return;
    }

    const copied = await copyTextToClipboard(url);
    if (!copied) {
      setError('No se pudo copiar el enlace. Cópialo manualmente desde la barra de direcciones.');
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('Enlace copiado. Compártelo para abrir esta paleta.');
  }

  return {
    canExport,
    exportBlockedReason,
    handleExportBrandKit,
    handleExportCss,
    handleCopyCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
    handleExportImage,
    handleCopyShareLink,
  };
}
