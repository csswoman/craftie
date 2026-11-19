'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RoleContrastFix } from '@lib/color/roleContrastFixes';
import type { PaletteRoleId } from '@lib/color/rolePalette';
import type { ThemeId } from '@lib/color/themePalette';

type PendingFix = { theme: ThemeId; fix: RoleContrastFix };

/**
 * Applies a contrast fix to the theme it was computed for. Edits always target the
 * active theme, so a fix for the other theme switches first and applies once it is active.
 */
export function useApplyContrastFix({
  activeTheme,
  setActiveTheme,
  replaceRole,
}: {
  activeTheme: ThemeId;
  setActiveTheme: (theme: ThemeId) => void;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
}) {
  const pending = useRef<PendingFix | null>(null);

  useEffect(() => {
    const next = pending.current;
    if (next && next.theme === activeTheme) {
      pending.current = null;
      replaceRole(next.fix.role, next.fix.toHex);
    }
  }, [activeTheme, replaceRole]);

  return useCallback(
    (theme: ThemeId, fix: RoleContrastFix) => {
      if (theme === activeTheme) {
        replaceRole(fix.role, fix.toHex);
        return;
      }
      pending.current = { theme, fix };
      setActiveTheme(theme);
    },
    [activeTheme, replaceRole, setActiveTheme],
  );
}
