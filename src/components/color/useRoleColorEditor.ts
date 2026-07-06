'use client';

import { useMemo } from 'react';

import { getActiveRoleContrastInfo } from '@lib/color/roleInspectorContrast';
import { normalizeHex } from '@lib/color/normalizeHex';
import type { PaletteRoleId } from '@lib/color/rolePalette';
import {
  hexToOklchChannels,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
} from '@lib/utils/colorMath';

import { useRolePalette } from '@/context/RolePaletteContext';

export function useRoleColorEditor(role: PaletteRoleId) {
  const { rolePalette, lockedRoles, toggleLock, replaceRole } = useRolePalette();

  const slot = rolePalette?.[role];
  const locked = lockedRoles.includes(role);

  const oklch = useMemo(
    () => (slot ? hexToOklchChannels(slot.hex) : null),
    [slot?.hex],
  );

  const chromaMax = useMemo(
    () => (oklch ? Math.max(0.001, maxOklchChromaForSrgb(oklch.l, oklch.h)) : 0),
    [oklch],
  );

  const contrast = useMemo(
    () => (rolePalette ? getActiveRoleContrastInfo(rolePalette, role) : null),
    [rolePalette, role],
  );

  function updateOklch(patch: Partial<{ l: number; c: number; h: number }>) {
    if (!oklch || locked) {
      return;
    }

    const next = {
      l: patch.l ?? oklch.l,
      c: patch.c ?? oklch.c,
      h: patch.h ?? oklch.h,
    };

    replaceRole(role, oklchChannelsToHex(next.l, next.c, next.h));
  }

  function handleHexCommit(raw: string) {
    if (locked) {
      return;
    }

    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return;
    }

    try {
      const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      replaceRole(role, normalizeHex(withHash));
    } catch {
      // Mantener el valor del contexto hasta que el hex sea válido.
    }
  }

  return {
    ready: slot !== undefined && oklch !== null && contrast !== null,
    slot,
    locked,
    oklch,
    chromaMax,
    contrast,
    updateOklch,
    handleHexCommit,
    toggleLock: () => toggleLock(role),
  };
}
