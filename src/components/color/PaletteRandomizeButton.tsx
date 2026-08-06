'use client';

import {
  hasUnlockedPaletteRoles,
  randomUnlockedRolePalette,
} from '@lib/color/randomUnlockedRolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RandomColorIcon } from './paletteToolbarIcons';

export function PaletteRandomizeButton() {
  const { rolePalette, lockedRoles, replaceRoles, activeTheme } = useRolePalette();
  const canRandomize = rolePalette !== null && hasUnlockedPaletteRoles(lockedRoles);

  return (
    <button
      type="button"
      aria-label="Probar otra paleta"
      title="Probar otra paleta"
      disabled={!canRandomize}
      onClick={() => {
        if (!rolePalette) return;
        replaceRoles(
          randomUnlockedRolePalette(rolePalette, lockedRoles, Math.random, activeTheme),
        );
      }}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <RandomColorIcon />
    </button>
  );
}
