'use client';

import type { Dispatch, SetStateAction } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';
import type { RolePalette } from '@lib/color/rolePalette';
import { SELECTABLE_COLORS, type SelectableColor } from '@lib/color/selectableColors';
import type { DesignStyle } from '@lib/styles/presets';

export function useWorkspaceInspiration({
  assignFromHexes,
  clearRolePalette,
  setCatalogSource,
  setError,
  setGeneratedPalette,
  setInspirationModalOpen,
  setIsImageExtracting,
  setIsImageRegenerating,
  setPaletteCatalog,
  setRightPanelOpen,
  setRolePalette,
  setSelectedStyleId,
}: {
  assignFromHexes: (hexes: string[]) => void;
  clearRolePalette: () => void;
  setCatalogSource: Dispatch<SetStateAction<'none' | 'curated' | 'image'>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setGeneratedPalette: Dispatch<SetStateAction<GeneratedPalette | null>>;
  setInspirationModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsImageExtracting: Dispatch<SetStateAction<boolean>>;
  setIsImageRegenerating: Dispatch<SetStateAction<boolean>>;
  setPaletteCatalog: Dispatch<SetStateAction<SelectableColor[]>>;
  setRightPanelOpen: Dispatch<SetStateAction<boolean>>;
  setRolePalette: (palette: RolePalette | null) => void;
  setSelectedStyleId: Dispatch<SetStateAction<string | null>>;
}) {
  function applyCuratedInspiration(hexes: string[], styleId: string | null) {
    setCatalogSource('curated');
    setPaletteCatalog([...SELECTABLE_COLORS]);
    setSelectedStyleId(styleId);
    assignFromHexes(hexes);
    setGeneratedPalette(null);
    setRightPanelOpen(true);
    setError(null);
  }

  function handleSelectStyle(style: DesignStyle) {
    applyCuratedInspiration(style.seeds, style.id);
    setInspirationModalOpen(false);
  }

  function handleImageExtractionStart() {
    setIsImageExtracting(true);
    setIsImageRegenerating(false);
    setCatalogSource('image');
    setPaletteCatalog([]);
    clearRolePalette();
    setSelectedStyleId(null);
    setGeneratedPalette(null);
    setError(null);
  }

  function handleImageRegenerateStart() {
    setIsImageRegenerating(true);
    setError(null);
  }

  function handleImagePaletteExtracted(palette: ImagePaletteBuildResult) {
    setIsImageExtracting(false);
    setIsImageRegenerating(false);
    setCatalogSource('image');
    setPaletteCatalog(palette.catalog);
    setSelectedStyleId(null);
    setRolePalette(palette.rolePalette);
    setGeneratedPalette(null);
    setRightPanelOpen(true);
    setError(null);
  }

  function handleImageExtractionError(message: string) {
    setIsImageExtracting(false);
    setIsImageRegenerating(false);
    setCatalogSource('none');
    setPaletteCatalog([]);
    clearRolePalette();
    setError(message);
  }

  return {
    handleImageExtractionError,
    handleImageExtractionStart,
    handleImagePaletteExtracted,
    handleImageRegenerateStart,
    handleSelectStyle,
  };
}
