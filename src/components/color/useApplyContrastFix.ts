'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RoleContrastFix } from '@lib/color/roleContrastFixes';
import type { PaletteRoleId, RolePalette } from '@lib/color/rolePalette';
import { solveSystemContrast } from '@lib/color/systemContrastSolver';
import type { ThemeId } from '@lib/color/themePalette';

type HexByRole = Partial<Record<PaletteRoleId, string>>;
type PendingFix = { theme: ThemeId; hexByRole: HexByRole };

/**
 * Applies contrast fixes to the theme they were computed for. Edits always target the
 * active theme, so a fix for the other theme switches first and applies once it is active.
 * Every fix lands as a single history step, so one undo reverts it.
 */
export function useApplyContrastFix({
  activeTheme,
  setActiveTheme,
  replaceRoles,
  lockedRolesByTheme,
}: {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
  replaceRoles: (hexByRole: HexByRole) => void;
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
}) {
  const pending = useRef<PendingFix | null>(null);

  useEffect(() => {
    const next = pending.current;
    if (next && next.theme === activeTheme) {
      pending.current = null;
      replaceRoles(next.hexByRole);
    }
  }, [activeTheme, replaceRoles]);

  const apply = useCallback(
    (theme: ThemeId, hexByRole: HexByRole) => {
      if (Object.keys(hexByRole).length === 0) return;
      if (theme === activeTheme) {
        replaceRoles(hexByRole);
        return;
      }
      pending.current = { theme, hexByRole };
      setActiveTheme(theme);
    },
    [activeTheme, replaceRoles, setActiveTheme],
  );

  const applyFix = useCallback(
    (theme: ThemeId, fix: RoleContrastFix) => apply(theme, { [fix.role]: fix.toHex }),
    [apply],
  );

  /** Solves the whole palette at once (locked roles stay put) and applies every change. */
  const applyAll = useCallback(
    (theme: ThemeId, palette: RolePalette) => {
      const solution = solveSystemContrast(palette, { lockedRoles: lockedRolesByTheme[theme] });
      apply(
        theme,
        Object.fromEntries(solution.changes.map((change) => [change.role, change.toHex])),
      );
    },
    [apply, lockedRolesByTheme],
  );

  return { applyFix, applyAll };
}
