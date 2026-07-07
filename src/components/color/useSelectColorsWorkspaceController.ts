'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildImagePalette } from '@lib/color/imagePalette';
import { validateImageFile } from '@lib/color/imageExtractor';
import {
  generatePaletteFromRolePalette,
  validateRolePalette,
} from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { DESIGN_STYLES } from '@lib/styles/presets';
import { getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';

import { useWorkspaceExports } from '@/components/color/useWorkspaceExports';
import { useWorkspaceInspiration } from '@/components/color/useWorkspaceInspiration';
import { useWorkspacePaletteActions } from '@/components/color/useWorkspacePaletteActions';
import { useWorkspaceShortcuts } from '@/components/color/useWorkspaceShortcuts';
import type { StudioShortcutsHelpHandle } from '@/components/layout/StudioShortcutsHelp';
import { useRolePalette } from '@/context/RolePaletteContext';
import { extractPaletteColorsFromImage } from '@/lib/browser/imageExtractor';

export function useSelectColorsWorkspaceController() {
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [paletteCatalog, setPaletteCatalog] = useState<SelectableColor[]>([]);
  const {
    rolePalette,
    seeds,
    themes,
    selectionReady,
    setRolePalette,
    clearRolePalette,
    replaceRole,
    renameRole,
    assignFromHexes,
  } = useRolePalette();
  const [catalogSource, setCatalogSource] = useState<'none' | 'curated' | 'image'>('none');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedPairing, setSelectedPairing] = useState<FontPair | null>(null);
  const [isImageExtracting, setIsImageExtracting] = useState(false);
  const [isImageRegenerating, setIsImageRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [inspirationModalOpen, setInspirationModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRegenerateIndex, setImageRegenerateIndex] = useState(0);
  const generatingRef = useRef(false);
  const imagePreviewUrlRef = useRef<string | null>(null);
  const shortcutsRef = useRef<StudioShortcutsHelpHandle>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current !== null) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  const isImageBusy = isImageExtracting || isImageRegenerating;

  function updateImagePreview(file: File) {
    if (imagePreviewUrlRef.current !== null) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    imagePreviewUrlRef.current = nextPreviewUrl;
    setImagePreviewUrl(nextPreviewUrl);
    setImageFileName(file.name);
    setImageFile(file);
  }

  async function processImageFile(file: File, regenerateIndex = 0, isRegenerate = false) {
    if (isImageBusy) {
      return;
    }

    try {
      validateImageFile(file, 5);
    } catch (validationError) {
      const message =
        validationError instanceof Error ? validationError.message : 'No se pudo validar la imagen.';
      handleImageExtractionError(message);
      return;
    }

    if (!isRegenerate) {
      setImageRegenerateIndex(0);
      updateImagePreview(file);
      handleImageExtractionStart();
    } else {
      setImageRegenerateIndex(regenerateIndex);
      handleImageRegenerateStart();
    }

    try {
      const extracted = await extractPaletteColorsFromImage(file, regenerateIndex);
      handleImagePaletteExtracted(buildImagePalette(extracted));
    } catch (extractionError) {
      const message =
        extractionError instanceof Error
          ? extractionError.message
          : 'No se pudieron extraer colores de la imagen.';
      handleImageExtractionError(message);
    }
  }

  function handleImageFileSelected(file: File) {
    const isSameFile = imageFile !== null && imageFile.name === file.name && imageFile.size === file.size;
    void processImageFile(file, isSameFile ? imageRegenerateIndex + 1 : 0, isSameFile);
  }

  function handleImageRegenerate() {
    if (imageFile === null) {
      return;
    }

    void processImageFile(imageFile, imageRegenerateIndex + 1, true);
  }

  const activeMoods = useMemo(() => {
    if (selectedStyleId === null) {
      return [];
    }

    return DESIGN_STYLES.find((style) => style.id === selectedStyleId)?.mood ?? [];
  }, [selectedStyleId]);

  const recommendedPairings = useMemo(
    () => getRecommendedPairings(activeMoods, 3),
    [activeMoods],
  );

  const isReviewPhase = generatedPalette !== null;

  useEffect(() => {
    if (!rolePalette || !isReviewPhase) {
      return;
    }

    // Keep review outputs synced when role edits happen from the inspector.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeneratedPalette(generatePaletteFromRolePalette(rolePalette));
  }, [rolePalette, isReviewPhase]);

  const handleGenerate = useCallback(() => {
    if (generatingRef.current) {
      return;
    }

    generatingRef.current = true;
    setIsGenerating(true);

    try {
      const selectionResult = validateRolePalette(rolePalette);

      if (!selectionResult.ok) {
        setError(selectionResult.error);
        setGeneratedPalette(null);
        setStatusMessage(null);
        return;
      }

      setError(null);
      const nextPalette = generatePaletteFromRolePalette(rolePalette!);
      setGeneratedPalette(nextPalette);
      setRightPanelOpen(true);
      setStatusMessage('Guía de marca lista. Revisa contraste, tipografía y exporta tu Brand Kit.');
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  }, [rolePalette]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => setStatusMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useWorkspaceShortcuts({ handleGenerate, isReviewPhase, selectionReady, shortcutsRef });

  function exitReviewPhase() {
    setGeneratedPalette(null);
    setStatusMessage(null);
  }

  function handleFlowStepFocus(stepId: StudioFlowStepId) {
    if (stepId === 'review') {
      return;
    }

    if (isReviewPhase) {
      exitReviewPhase();
    }

    if (stepId === 'inspire') {
      setInspirationModalOpen(true);
      return;
    }

    if (stepId === 'adjust' || stepId === 'generate') {
      setRightPanelOpen(true);
    }
  }

  const {
    handleImageExtractionError,
    handleImageExtractionStart,
    handleImagePaletteExtracted,
    handleImageRegenerateStart,
    handleSelectStyle,
  } = useWorkspaceInspiration({
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
  });

  const { handleAddColorByHex, handleRenameColor, handleReplacePreviewColor } =
    useWorkspacePaletteActions({
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
      setRightPanelOpen,
      setRolePalette,
    });

  const { handleExportBrandKit, handleExportDesignMd } = useWorkspaceExports({
    generatedPalette,
    rolePalette,
    seeds,
    selectedPairing,
    setError,
    setStatusMessage,
    themes,
  });

  return {
    catalogSource,
    error,
    imageFileName,
    imagePreviewUrl,
    handleImageFileSelected,
    handleImageRegenerate,
    generatedPalette,
    handleAddColorByHex,
    handleExportBrandKit,
    handleExportDesignMd,
    handleFlowStepFocus,
    handleGenerate,
    handleImageExtractionError,
    handleImageExtractionStart,
    handleImagePaletteExtracted,
    handleImageRegenerateStart,
    handleRenameColor,
    handleReplacePreviewColor,
    handleSelectStyle,
    inspirationModalOpen,
    isGenerating,
    isImageExtracting,
    isImageRegenerating,
    isImageBusy,
    isReviewPhase,
    paletteCatalog,
    recommendedPairings,
    rightPanelCollapsed,
    rightPanelOpen,
    rolePalette,
    selectedPairing,
    selectedStyleId,
    selectionReady,
    setInspirationModalOpen,
    setRightPanelCollapsed,
    setRightPanelOpen,
    setSelectedPairing,
    shortcutsRef,
    statusMessage,
  };
}
