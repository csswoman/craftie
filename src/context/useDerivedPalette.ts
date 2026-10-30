import { useCallback, useMemo } from 'react';

import {
  applyClearedDataTokens,
  statusColorsAsTokenOverrides,
  type EditablePaletteState,
} from '@lib/color/editablePalette';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import { normalizeHex } from '@lib/color/normalizeHex';
import type { PaletteType } from '@lib/color/paletteClassification';
import {
  extractSeedsFromPalette,
  PALETTE_ROLE_ORDER,
  validateRolePalette,
  type PaletteSeeds,
} from '@lib/color/rolePalette';
import { projectSemanticTokensToRolePalette, tokenNameForPaletteRole } from '@lib/color/semanticRoleProjection';
import { getPairedOnTokenForFill } from '@lib/color/semanticTokenTargets';
import { deriveSemanticTokens, type SemanticTokenOverrides } from '@lib/color/semanticTokens';
import type { ThemeId } from '@lib/color/themePalette';
import { resolveUiExpressiveGaps } from '@lib/color/uiExpressiveGaps';
import { applyUiStatusColors, buildUiStatusColors } from '@lib/color/uiStatusColors';
import { getColorForUsage, type UsageIntent } from '@lib/color/usageColor';

import type { TokenEditPreview } from '@/context/rolePaletteTypes';

type DerivedPaletteInput = {
  activeTheme: ThemeId;
  editable: EditablePaletteState;
  extractedColors: ExtractedColor[];
  paletteType: PaletteType | undefined;
  previewVibrancy: number;
  illustrationSeed: number;
  statusColorsEnabled: boolean;
  tokenEditPreview: TokenEditPreview | null;
};

/** Pure derivations (tokens, role palettes, export data) from the editable state. */
export function useDerivedPalette({
  activeTheme,
  editable,
  extractedColors,
  paletteType,
  previewVibrancy,
  illustrationSeed,
  statusColorsEnabled,
  tokenEditPreview,
}: DerivedPaletteInput) {
  const {
    tokenOverridesByTheme,
    clearedSemanticTokens,
    roleNames,
    savedVibrancy,
    neutralStyle,
    forcedStatusSources,
    forcedStatusColors,
  } = editable;

  const tokenOverrides = useMemo(
    () => tokenOverridesByTheme[activeTheme] ?? {},
    [tokenOverridesByTheme, activeTheme],
  );

  const previewTokenOverrides = useMemo<SemanticTokenOverrides>(() => {
    if (!tokenEditPreview || tokenEditPreview.kind !== 'token') {
      return tokenOverrides;
    }

    const fillToken = tokenEditPreview.tokenName;
    const pairedOn = getPairedOnTokenForFill(fillToken);
    const next: SemanticTokenOverrides = {
      ...tokenOverrides,
      [fillToken]: normalizeHex(tokenEditPreview.hex),
    };

    if (pairedOn) {
      delete next[pairedOn];
    }

    return next;
  }, [tokenEditPreview, tokenOverrides]);

  const baseSemanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return applyClearedDataTokens(resolveUiExpressiveGaps(deriveSemanticTokens({
      extracted: extractedColors,
      overrides: tokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: savedVibrancy,
      paletteType,
    }), extractedColors), clearedSemanticTokens);
  }, [activeTheme, clearedSemanticTokens, extractedColors, neutralStyle, paletteType, savedVibrancy, tokenOverrides]);

  const previewBaseSemanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return applyClearedDataTokens(resolveUiExpressiveGaps(deriveSemanticTokens({
      extracted: extractedColors,
      overrides: previewTokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: previewVibrancy,
      paletteType,
    }), extractedColors), clearedSemanticTokens);
  }, [activeTheme, clearedSemanticTokens, extractedColors, neutralStyle, paletteType, previewTokenOverrides, previewVibrancy]);

  const statusColors = useMemo(
    () => statusColorsEnabled && baseSemanticTokens
      ? buildUiStatusColors({
        colors: extractedColors,
        backgroundHex: baseSemanticTokens.background.hex,
        forcedSources: forcedStatusSources,
        forcedColors: forcedStatusColors,
      })
      : null,
    [baseSemanticTokens, extractedColors, forcedStatusColors, forcedStatusSources, statusColorsEnabled],
  );
  const previewStatusColors = useMemo(() => {
    if (!statusColors) {
      return null;
    }

    if (!tokenEditPreview || tokenEditPreview.kind !== 'status') {
      return statusColors;
    }

    return {
      ...statusColors,
      [tokenEditPreview.role]: tokenEditPreview.status,
    };
  }, [statusColors, tokenEditPreview]);
  const semanticTokens = useMemo(
    () => baseSemanticTokens ? applyUiStatusColors(baseSemanticTokens, statusColors) : null,
    [baseSemanticTokens, statusColors],
  );
  const previewSemanticTokens = useMemo(
    () => previewBaseSemanticTokens
      ? applyUiStatusColors(previewBaseSemanticTokens, previewStatusColors)
      : null,
    [previewBaseSemanticTokens, previewStatusColors],
  );

  const rolePalette = useMemo(
    () => (semanticTokens ? projectSemanticTokensToRolePalette(semanticTokens, roleNames) : null),
    [roleNames, semanticTokens],
  );
  const getColorForUsageBound = useCallback(
    (intent: UsageIntent) => {
      if (!rolePalette || !semanticTokens) return null;
      return getColorForUsage(rolePalette, semanticTokens, intent);
    },
    [rolePalette, semanticTokens],
  );
  const previewRolePalette = useMemo(
    () =>
      previewSemanticTokens
        ? projectSemanticTokensToRolePalette(previewSemanticTokens, roleNames)
        : null,
    [previewSemanticTokens, roleNames],
  );

  // Export must serialize the `light` slot regardless of which theme is active in the editor,
  // so derive a dedicated light-stable role palette instead of reusing `rolePalette`.
  // Status colors are intentionally excluded: they never affect the 7 core roles.
  const exportRolePalette = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    const lightTokens = applyClearedDataTokens(
      resolveUiExpressiveGaps(
        deriveSemanticTokens({
          extracted: extractedColors,
          overrides: tokenOverridesByTheme.light ?? {},
          theme: 'light',
          neutralStyle,
          vibrancy: savedVibrancy,
          paletteType,
        }),
        extractedColors,
      ),
      clearedSemanticTokens,
    );

    return projectSemanticTokensToRolePalette(lightTokens, roleNames);
  }, [
    clearedSemanticTokens,
    extractedColors,
    neutralStyle,
    paletteType,
    roleNames,
    savedVibrancy,
    tokenOverridesByTheme,
  ]);

  // Confirmed explicit status colors live in `forcedStatusColors`, outside `tokenOverridesByTheme`.
  const exportStatusTokenOverrides = useMemo(
    () => statusColorsAsTokenOverrides(forcedStatusColors),
    [forcedStatusColors],
  );

  const seeds = useMemo<PaletteSeeds | null>(
    () =>
      rolePalette
        ? {
          ...extractSeedsFromPalette(rolePalette),
          extracted: extractedColors,
          vibrancy: savedVibrancy,
          illustrationSeed,
        }
        : null,
    [extractedColors, illustrationSeed, rolePalette, savedVibrancy],
  );

  const selectionReady = useMemo(
    () =>
      semanticTokens !== null
      && PALETTE_ROLE_ORDER.every((role) => !semanticTokens[tokenNameForPaletteRole(role)].gap)
      && validateRolePalette(rolePalette).ok,
    [rolePalette, semanticTokens],
  );

  return useMemo(
    () => ({
      rolePalette,
      getColorForUsage: getColorForUsageBound,
      exportRolePalette,
      exportStatusTokenOverrides,
      semanticTokens,
      previewRolePalette,
      previewSemanticTokens,
      statusColors,
      seeds,
      selectionReady,
    }),
    [
      rolePalette,
      getColorForUsageBound,
      exportRolePalette,
      exportStatusTokenOverrides,
      semanticTokens,
      previewRolePalette,
      previewSemanticTokens,
      statusColors,
      seeds,
      selectionReady,
    ],
  );
}
