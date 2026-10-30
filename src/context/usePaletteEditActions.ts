import { useCallback, useMemo } from 'react';

import {
  applySemanticTokenHex,
  clearSemanticTokenState,
} from '@lib/color/editablePalette';
import { nextIllustrationSeed } from '@lib/color/illustrationComposer';
import {
  PALETTE_ROLE_ORDER,
  renameRoleSlot,
  type PaletteRoleId,
  type RolePalette,
} from '@lib/color/rolePalette';
import { tokenNameForPaletteRole } from '@lib/color/semanticRoleProjection';
import type { NeutralStyle, SemanticTokenName } from '@lib/color/semanticTokens';
import { normalizeVibrancy } from '@lib/color/vibrancy';

import type { PaletteCore } from '@/context/paletteCore';

/** User edits that go through the undo/redo history. */
export function usePaletteEditActions(core: PaletteCore, rolePalette: RolePalette | null) {
  const {
    activeTheme,
    extractedColors,
    paletteType,
    previewVibrancy,
    commitEdit,
    setIllustrationSeed,
    setPreviewVibrancyState,
    setTokenEditPreviewState,
  } = core;

  const setPreviewVibrancy = useCallback((value: number) => {
    setPreviewVibrancyState(normalizeVibrancy(value));
  }, [setPreviewVibrancyState]);

  const saveVibrancy = useCallback(() => {
    commitEdit((current) => current.savedVibrancy === previewVibrancy
      ? current
      : { ...current, savedVibrancy: previewVibrancy });
  }, [commitEdit, previewVibrancy]);

  const setNeutralStyle = useCallback((style: NeutralStyle) => {
    commitEdit((current) => current.neutralStyle === style
      ? current
      : { ...current, neutralStyle: style });
  }, [commitEdit]);

  const regenerateIllustrationSeed = useCallback(() => {
    setIllustrationSeed((seed) => nextIllustrationSeed(seed));
  }, [setIllustrationSeed]);

  const replaceSemanticToken = useCallback((tokenName: SemanticTokenName, hex: string) => {
    // Persist the chosen hex for the active theme and a same-hue counterpart for the other.
    // Accent ↔ data-1 stay in sync as the shared "Acento 1" family slot.
    commitEdit((current) =>
      applySemanticTokenHex(current, tokenName, hex, {
        activeTheme,
        extractedColors,
        paletteType,
      }),
    );
    setTokenEditPreviewState(null);
  }, [activeTheme, commitEdit, extractedColors, paletteType, setTokenEditPreviewState]);

  const replaceRole = useCallback(
    (role: PaletteRoleId, hex: string) => {
      replaceSemanticToken(tokenNameForPaletteRole(role), hex);
    },
    [replaceSemanticToken],
  );

  const replaceRoles = useCallback(
    (hexByRole: Partial<Record<PaletteRoleId, string>>) => {
      const entries = PALETTE_ROLE_ORDER.flatMap((role) => {
        const hex = hexByRole[role];
        return hex ? ([[role, hex]] as const) : [];
      });
      if (entries.length === 0) return;

      // Neutrals last again so opposite-theme counterparts re-nudge AA against
      // the final fondo / superficie / texto pair on the other theme.
      const neutralRefresh = (['fondo', 'superficie', 'texto'] as const).flatMap((role) => {
        const hex = hexByRole[role];
        return hex ? ([[role, hex]] as const) : [];
      });

      commitEdit((current) => {
        let next = current;
        const applyOpts = { activeTheme, extractedColors, paletteType };
        for (const [role, hex] of entries) {
          next = applySemanticTokenHex(next, tokenNameForPaletteRole(role), hex, applyOpts);
        }
        for (const [role, hex] of neutralRefresh) {
          next = applySemanticTokenHex(next, tokenNameForPaletteRole(role), hex, applyOpts);
        }
        return next;
      });
      setTokenEditPreviewState(null);
    },
    [activeTheme, commitEdit, extractedColors, paletteType, setTokenEditPreviewState],
  );

  const clearSemanticToken = useCallback((tokenName: SemanticTokenName) => {
    commitEdit((current) => clearSemanticTokenState(current, tokenName));
    setTokenEditPreviewState(null);
  }, [commitEdit, setTokenEditPreviewState]);

  const renameRole = useCallback(
    (role: PaletteRoleId, name: string) => {
      const trimmed = name.trim();

      if (trimmed.length === 0 || trimmed.length > 40) {
        return false;
      }

      if (!rolePalette) {
        return false;
      }

      const renamed = renameRoleSlot(rolePalette, role, trimmed);

      if (!renamed) {
        return false;
      }

      commitEdit((current) => ({
        ...current,
        roleNames: { ...current.roleNames, [role]: trimmed },
      }));

      return true;
    },
    [commitEdit, rolePalette],
  );

  const toggleLock = useCallback(
    (role: PaletteRoleId) => {
      commitEdit((current) => {
        const themeLocks = current.lockedRolesByTheme[activeTheme];
        const nextLocks = themeLocks.includes(role)
          ? themeLocks.filter((id) => id !== role)
          : [...themeLocks, role];

        return {
          ...current,
          lockedRolesByTheme: {
            ...current.lockedRolesByTheme,
            [activeTheme]: nextLocks,
          },
        };
      });
    },
    [activeTheme, commitEdit],
  );

  return useMemo(
    () => ({
      setPreviewVibrancy,
      saveVibrancy,
      setNeutralStyle,
      regenerateIllustrationSeed,
      replaceSemanticToken,
      replaceRole,
      replaceRoles,
      clearSemanticToken,
      renameRole,
      toggleLock,
    }),
    [
      setPreviewVibrancy,
      saveVibrancy,
      setNeutralStyle,
      regenerateIllustrationSeed,
      replaceSemanticToken,
      replaceRole,
      replaceRoles,
      clearSemanticToken,
      renameRole,
      toggleLock,
    ],
  );
}
