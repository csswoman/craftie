'use client';

import type { Dispatch, SetStateAction } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isGeneratedPaletteRole } from '@lib/color/paletteDisplay';
import { addColorToPalette, renamePaletteColor } from '@lib/color/paletteOrder';
import {
  isPaletteRoleId,
  type PaletteRoleId,
  type RolePalette,
} from '@lib/color/rolePalette';
import { SELECTABLE_COLORS, type SelectableColor } from '@lib/color/selectableColors';

export function useWorkspacePaletteActions({
  assignFromHexes,
  generatedPalette,
  paletteCatalog,
  replaceRole,
  renameRole,
  rolePalette,
  setCatalogSource,
  setError,
  setGeneratedPalette,
  setPaletteCatalog,
}: {
  assignFromHexes: (hexes: string[]) => void;
  generatedPalette: GeneratedPalette | null;
  paletteCatalog: SelectableColor[];
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  renameRole: (role: PaletteRoleId, name: string) => void;
  rolePalette: RolePalette | null;
  setCatalogSource: Dispatch<SetStateAction<'none' | 'curated' | 'image'>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setGeneratedPalette: Dispatch<SetStateAction<GeneratedPalette | null>>;
  setPaletteCatalog: Dispatch<SetStateAction<SelectableColor[]>>;
}) {
  function handleReplacePreviewColor(columnId: string, newHex: string): string | null {
    if (!generatedPalette) {
      return 'Genera una paleta primero.';
    }

    let normalized: string;

    try {
      normalized = normalizeHex(newHex);
    } catch {
      return 'Introduce un código HEX válido.';
    }

    if (isGeneratedPaletteRole(columnId)) {
      setGeneratedPalette({ ...generatedPalette, [columnId]: normalized });
      return null;
    }

    if (isPaletteRoleId(columnId) && rolePalette) {
      replaceRole(columnId, normalized);
      return null;
    }

    return 'No se pudo sustituir este color.';
  }

  function handleAddColorByHex(hex: string, customName?: string): string | null {
    const baseCatalog = paletteCatalog.length > 0 ? paletteCatalog : [...SELECTABLE_COLORS];
    const result = addColorToPalette(baseCatalog, [], hex, { customName });

    if (!result.ok) {
      return result.error;
    }

    if (paletteCatalog.length === 0) {
      setCatalogSource('curated');
    }

    setPaletteCatalog(result.catalog);

    if (rolePalette) {
      assignFromHexes([...Object.values(rolePalette).map((slot) => slot.hex), hex]);
    } else {
      assignFromHexes([hex]);
    }

    setError(null);

    return result.message ?? null;
  }

  function handleRenameColor(color: SelectableColor, newName: string): boolean {
    const baseCatalog = paletteCatalog.length > 0 ? paletteCatalog : [...SELECTABLE_COLORS];
    const result = renamePaletteColor(baseCatalog, [], color.id, newName);

    if (!result) {
      return false;
    }

    if (paletteCatalog.length === 0) {
      setCatalogSource('curated');
    }

    setPaletteCatalog(result.catalog);

    if (rolePalette) {
      const matchingRole = Object.values(rolePalette).find(
        (slot) => normalizeHex(slot.hex) === normalizeHex(color.hex),
      )?.role;

      if (matchingRole) {
        renameRole(matchingRole, newName);
      }
    }

    return true;
  }

  return { handleAddColorByHex, handleRenameColor, handleReplacePreviewColor };
}
