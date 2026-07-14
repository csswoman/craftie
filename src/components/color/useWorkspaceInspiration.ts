'use client';

import type { Dispatch, SetStateAction } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';
import {
  buildCuratedSourceCatalog,
  type SelectableColor,
} from '@lib/color/selectableColors';
import type { DesignStyle } from '@lib/styles/presets';

export function useWorkspaceInspiration({
  assignFromHexes,
  assignFromExtracted,
  clearRolePalette,
  setCatalogSource,
  setError,
  setGeneratedPalette,
  setInspirationModalOpen,
  setIsImageExtracting,
  setIsImageRegenerating,
  setPaletteCatalog,
  setRightPanelCollapsed,
  setSelectedStyleId,
}: {
  assignFromHexes: (hexes: string[]) => void;
  assignFromExtracted: (extracted: ExtractedColor[], paletteType?: ImagePaletteBuildResult['classification']['type']) => void;
  clearRolePalette: () => void;
  setCatalogSource: Dispatch<SetStateAction<'none' | 'curated' | 'image'>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setGeneratedPalette: Dispatch<SetStateAction<GeneratedPalette | null>>;
  setInspirationModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsImageExtracting: Dispatch<SetStateAction<boolean>>;
  setIsImageRegenerating: Dispatch<SetStateAction<boolean>>;
  setPaletteCatalog: Dispatch<SetStateAction<SelectableColor[]>>;
  setRightPanelCollapsed: Dispatch<SetStateAction<boolean>>;
  setSelectedStyleId: Dispatch<SetStateAction<string | null>>;
}) {
  function applyCuratedInspiration(hexes: string[], styleId: string | null) {
    setCatalogSource('curated');
    setPaletteCatalog(buildCuratedSourceCatalog(hexes));
    setSelectedStyleId(styleId);
    assignFromHexes(hexes);
    setGeneratedPalette(null);
    setRightPanelCollapsed(false);
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
    if (palette.mode === 'ui') {
      assignFromExtracted(palette.extracted, palette.classification.type);
    } else {
      clearRolePalette();
    }
    setGeneratedPalette(null);
    setRightPanelCollapsed(false);
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
