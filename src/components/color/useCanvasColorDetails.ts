'use client';

import { useState } from 'react';

import type { PaletteRoleId, RolePalette } from '@lib/color/rolePalette';
import type { SemanticTokenName } from '@lib/color/semanticTokens';

import { useTx } from '@/context/I18nContext';
import { replacePaletteColorFromDrawer } from './replacePaletteColorFromDrawer';

type DrawerReplaceInput = Parameters<typeof replacePaletteColorFromDrawer>[0];

/** Which canvas color the details drawer shows, and how a replacement from it lands. */
export function useCanvasColorDetails({
  rolePalette,
  columns,
  lockedSet,
  replaceRole,
  replaceSemanticToken,
}: {
  rolePalette: RolePalette | null;
  columns: DrawerReplaceInput['columns'];
  lockedSet: Set<PaletteRoleId>;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  replaceSemanticToken: (tokenName: SemanticTokenName, hex: string) => void;
}) {
  const tx = useTx();
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [selectedAccentSlot, setSelectedAccentSlot] = useState<number | null>(null);

  function openRoleDetails(hex: string) {
    setSelectedAccentSlot(null);
    setSelectedColorHex(hex);
  }

  function openAccentDetails(hex: string, slotIndex: number) {
    setSelectedAccentSlot(slotIndex);
    setSelectedColorHex(hex);
  }

  function closeDetails() {
    setSelectedColorHex(null);
    setSelectedAccentSlot(null);
  }

  function replaceFromDrawer(newHex: string): string | null {
    if (!rolePalette) {
      return tx('No se puede sustituir este color.');
    }

    return replacePaletteColorFromDrawer({
      newHex,
      selectedColorHex,
      selectedAccentSlot,
      columns,
      lockedSet,
      replaceRole,
      replaceSemanticToken,
      setSelectedColorHex,
    });
  }

  return { selectedColorHex, openRoleDetails, openAccentDetails, closeDetails, replaceFromDrawer };
}
