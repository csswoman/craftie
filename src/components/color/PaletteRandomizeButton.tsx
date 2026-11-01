'use client';

import { useCallback, useEffect } from 'react';
import { isRandomizePaletteShortcut, shouldIgnoreStudioShortcut } from '@lib/studio/studioShortcuts';
import {
  hasUnlockedPaletteRoles,
  randomUnlockedRolePalette,
} from '@lib/color/randomUnlockedRolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RandomColorIcon } from './paletteToolbarIcons';
import { useT } from '@/context/I18nContext';

export function PaletteRandomizeButton() {
  const t = useT();
  const { rolePalette, lockedRoles, replaceRoles, activeTheme } = useRolePalette();
  const canRandomize = rolePalette !== null && hasUnlockedPaletteRoles(lockedRoles);

  const randomize = useCallback(() => {
    if (!rolePalette) return;
    replaceRoles(randomUnlockedRolePalette(rolePalette, lockedRoles, Math.random, activeTheme));
  }, [activeTheme, lockedRoles, replaceRoles, rolePalette]);

  useEffect(() => {
    if (!canRandomize) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (!isRandomizePaletteShortcut(event) || shouldIgnoreStudioShortcut(event.target)) return;
      event.preventDefault();
      randomize();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRandomize, randomize]);

  return (
    <button
      type="button"
      aria-label={t('ui.PaletteRandomizeButton.probar-otra-paleta')}
      aria-keyshortcuts="Alt+R"
      title={t('ui.PaletteRandomizeButton.probar-otra-paleta-alt-r')}
      disabled={!canRandomize}
      onClick={randomize}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <RandomColorIcon />
    </button>
  );
}
