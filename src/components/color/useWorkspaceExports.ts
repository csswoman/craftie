'use client';

import { generatePaletteFromRolePalette } from '@lib/color/rolePalette';
import type { NeutralScale } from '@lib/color/neutralScale';
import type { RolePalette } from '@lib/color/rolePalette';
import type { SemanticTokenOverrides } from '@lib/color/semanticTokens';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import { buildExportTokenSet, canExportTokenSet } from '@lib/export/exportTokenSet';
import { createTranslator, type Translate } from '@lib/i18n/translate';
import type { ExportDerivedTokensByTheme } from '@lib/export/derivedExportTokens';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import { toCss, toTokensStudio, toW3cJson } from '@lib/export/serializeExportTokens';
import { toShadcnTheme, toTailwindTheme } from '@lib/export/serializeFrameworkTokens';
import type { FontPair } from '@lib/typography/pairings';
import type { ResolvedTypeRole, TypeRoleId } from '@lib/typography/typeRoles';
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
  derivedTokensByTheme = null,
  tokenOverridesByTheme,
  exportStatusTokenOverrides = {},
  selectedPairing,
  typeRoles = null,
  getShareSnapshot,
  setError,
  setStatusMessage,
  kitName = 'craftie-tokens',
  t = createTranslator('es'),
}: {
  rolePalette: RolePalette | null;
  neutralScale?: NeutralScale | null;
  /** Derived tokens per theme (on-* pairs, status, dark mode). */
  derivedTokensByTheme?: ExportDerivedTokensByTheme | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  /** Confirmed status colors (success/warning/error) merged into the light slot for export. */
  exportStatusTokenOverrides?: SemanticTokenOverrides;
  selectedPairing: FontPair | null;
  /** Resolved type roles exported with the pairing. */
  typeRoles?: Record<TypeRoleId, ResolvedTypeRole> | null;
  /** Builds the current serializable workspace snapshot for the share link. */
  getShareSnapshot: () => WorkspaceSnapshot;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  kitName?: string;
  /** Translator for status and error messages; Spanish when omitted. */
  t?: Translate;
}) {
  // Merge confirmed status colors into the light overrides without mutating the source objects.
  const exportOverridesByTheme = {
    light: { ...tokenOverridesByTheme.light, ...exportStatusTokenOverrides },
    dark: { ...tokenOverridesByTheme.dark },
  };
  const tokenSet = buildExportTokenSet({
    rolePalette,
    neutralScale,
    derivedTokensByTheme,
    tokenOverridesByTheme: exportOverridesByTheme,
    pairing: selectedPairing,
    typeRoles,
    name: kitName,
  });
  const canExport = canExportTokenSet(tokenSet);
  const exportBlockedReason = canExport
    ? null
    : t('export.missing', {
        what: tokenSet.meta.missingCore
          .map((token) => t(`export.missing.${token}`))
          .join(', '),
      });

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
    download('tokens.css', toCss(tokenSet), 'text/css;charset=utf-8', t('export.done.css'));
  }

  async function handleCopyCss() {
    if (!requireExportable()) return;
    const copied = await copyTextToClipboard(toCss(tokenSet));
    if (!copied) {
      setError(t('export.error.copyCss'));
      setStatusMessage(null);
      return;
    }
    setError(null);
    setStatusMessage(t('export.done.copyCss'));
  }

  function handleExportTailwind() {
    if (!requireExportable()) return;
    download('craftie-tailwind.css', toTailwindTheme(tokenSet), 'text/css;charset=utf-8', t('export.done.tailwind'));
  }

  function handleExportShadcn() {
    if (!requireExportable()) return;
    download('craftie-shadcn.css', toShadcnTheme(tokenSet), 'text/css;charset=utf-8', t('export.done.shadcn'));
  }

  function handleExportTokensJson() {
    if (!requireExportable()) return;
    download(
      'tokens.json',
      toW3cJson(tokenSet),
      'application/json;charset=utf-8',
      t('export.done.tokens'),
    );
  }

  function handleExportFigmaTokens() {
    if (!requireExportable()) return;
    download(
      'figma-tokens.json',
      toTokensStudio(tokenSet),
      'application/json;charset=utf-8',
      t('export.done.figma'),
    );
  }

  function handleExportDesignMd() {
    if (!requireExportable()) return;
    download(
      'DESIGN.md',
      generateDesignMd(tokenSet),
      'text/markdown;charset=utf-8',
      t('export.done.designMd'),
    );
  }

  function handleExportBrandKit() {
    if (!requireExportable() || !rolePalette) return;
    // Always derive from the export role palette (light-stable) so brand-kit.json
    // never mixes a UI/review palette that may reflect the active dark theme.
    const palette = generatePaletteFromRolePalette(rolePalette);
    const kit = buildBrandKit(palette, rolePalette, selectedPairing, kitName, {
      tokenOverridesByTheme: exportOverridesByTheme,
      typeRoles,
    });
    download(
      'brand-kit.json',
      serializeBrandKit(kit),
      'application/json;charset=utf-8',
      t('export.done.brandKit'),
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
    setStatusMessage(t('export.done.image'));
  }

  async function handleCopyShareLink() {
    const encoded = encodeShareSnapshot(getShareSnapshot());
    const url = buildShareUrl(encoded);

    if (url === null) {
      setError(t('export.error.shareLink'));
      setStatusMessage(null);
      return;
    }

    const copied = await copyTextToClipboard(url);
    if (!copied) {
      setError(t('export.error.copyShareLink'));
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage(t('export.done.shareLink'));
  }

  return {
    canExport,
    exportBlockedReason,
    handleExportBrandKit,
    handleExportCss,
    handleCopyCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTailwind,
    handleExportShadcn,
    handleExportTokensJson,
    handleExportImage,
    handleCopyShareLink,
  };
}
