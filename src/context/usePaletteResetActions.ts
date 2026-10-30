import { useCallback, useMemo } from 'react';

import { INITIAL_EDITABLE } from '@lib/color/editablePalette';
import { DEFAULT_ILLUSTRATION_SEED } from '@lib/color/illustrationComposer';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { PaletteType } from '@lib/color/paletteClassification';
import {
  assignRolesFromHexes,
  PALETTE_ROLE_ORDER,
  rolePaletteAsSemanticOverrides,
  type PaletteRoleId,
  type RolePalette,
} from '@lib/color/rolePalette';
import { tokenNameForPaletteRole } from '@lib/color/semanticRoleProjection';
import type { SemanticTokenOverrides } from '@lib/color/semanticTokens';
import { counterpartRoleColorForTheme } from '@lib/color/themeCounterpartColor';
import { STATUS_COLORS_ON_DEMAND } from '@lib/color/uiStatusColors';
import { VIBRANCY_MID } from '@lib/color/vibrancy';
import { createHistory } from '@lib/utils/historyStack';

import type { PaletteCore } from '@/context/paletteCore';
import type { useEditHistory } from '@/context/useEditHistory';

/** Actions that replace the whole palette and reset transient state. */
export function usePaletteResetActions(
  core: PaletteCore,
  setEditHistory: ReturnType<typeof useEditHistory>['setEditHistory'],
) {
  const {
    resetEditable,
    setExtractedColors,
    setPaletteType,
    setPreviewVibrancyState,
    setIllustrationSeed,
    setActiveRole,
    setStatusColorsEnabled,
    setTokenEditPreviewState,
    setPaletteRevision,
  } = core;

  const resetTransient = useCallback(() => {
    setPreviewVibrancyState(VIBRANCY_MID);
    setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
    setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
    setTokenEditPreviewState(null);
  }, [setIllustrationSeed, setPreviewVibrancyState, setStatusColorsEnabled, setTokenEditPreviewState]);

  const setRolePalette = useCallback(
    (palette: RolePalette | null) => {
      setPaletteRevision((revision) => revision + 1);
      if (palette === null) {
        setExtractedColors([]);
        resetEditable();
        setPaletteType(undefined);
        resetTransient();
        return;
      }

      setExtractedColors(
        Object.values(palette).map((slot, index) => ({
          hex: slot.hex,
          prominence: 1 - index * 0.05,
        })),
      );
      const lightOverrides = rolePaletteAsSemanticOverrides(palette);
      const darkOverrides = Object.fromEntries(
        PALETTE_ROLE_ORDER.map((role) => [
          tokenNameForPaletteRole(role),
          counterpartRoleColorForTheme(palette[role].hex, role, 'dark'),
        ]),
      ) as SemanticTokenOverrides;
      setEditHistory((history) => createHistory({
        ...INITIAL_EDITABLE,
        tokenOverridesByTheme: {
          light: lightOverrides,
          dark: darkOverrides,
        },
        roleNames: history.present.roleNames,
        lockedRolesByTheme: history.present.lockedRolesByTheme,
      }));
      resetTransient();
    },
    [resetEditable, resetTransient, setEditHistory, setExtractedColors, setPaletteRevision, setPaletteType],
  );

  const assignFromExtracted = useCallback((extracted: ExtractedColor[], nextPaletteType?: PaletteType) => {
    setPaletteRevision((revision) => revision + 1);
    setExtractedColors(extracted);
    setPaletteType(nextPaletteType);
    resetEditable();
    resetTransient();
    setActiveRole(null);
  }, [resetEditable, resetTransient, setActiveRole, setExtractedColors, setPaletteRevision, setPaletteType]);

  const clearRolePalette = useCallback(() => {
    setPaletteRevision((revision) => revision + 1);
    setExtractedColors([]);
    resetEditable();
    resetTransient();
    setActiveRole(null);
  }, [resetEditable, resetTransient, setActiveRole, setExtractedColors, setPaletteRevision]);

  const assignFromHexes = useCallback(
    (hexes: string[]) => {
      setPaletteRevision((revision) => revision + 1);
      const extracted = hexes.map((hex, index) => ({
        hex,
        prominence: 1 - index * 0.05,
      }));
      const assigned = assignRolesFromHexes(hexes);

      setExtractedColors(extracted);
      resetEditable({
        roleNames: Object.fromEntries(
          Object.values(assigned).map((slot) => [slot.role, slot.name]),
        ) as Partial<Record<PaletteRoleId, string>>,
      });
      resetTransient();
    },
    [resetEditable, resetTransient, setExtractedColors, setPaletteRevision],
  );

  return useMemo(
    () => ({ setRolePalette, assignFromExtracted, clearRolePalette, assignFromHexes }),
    [setRolePalette, assignFromExtracted, clearRolePalette, assignFromHexes],
  );
}
