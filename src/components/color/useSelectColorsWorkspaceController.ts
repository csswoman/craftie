'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { buildImagePalette } from '@lib/color/imagePalette';
import type { PaletteType } from '@lib/color/paletteClassification';
import { validateImageFile } from '@lib/color/imageExtractor';
import {
  generatePaletteFromRolePalette,
  validateRolePalette,
} from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { DESIGN_STYLES } from '@lib/styles/presets';
import { FONT_PAIRS, getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';
import { hasWorkspaceProgress } from '@lib/studio/workspaceProgress';
import {
  appliedToLoadablePair,
  applyPairToTypography,
  createInitialTypeUiState,
  previewPairTypography,
  type TypeUiState,
} from '@lib/typography/typeState';
import {
  applyCustomFamilyToRole,
  createCustomFont,
  upsertCustomFont,
} from '@lib/typography/customFonts';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';

import { useWorkspaceExports } from '@/components/color/useWorkspaceExports';
import { useWorkspaceInspiration } from '@/components/color/useWorkspaceInspiration';
import { useWorkspacePaletteActions } from '@/components/color/useWorkspacePaletteActions';
import { useWorkspaceShortcuts } from '@/components/color/useWorkspaceShortcuts';
import { useRolePalette } from '@/context/RolePaletteContext';
import {
  loadGoogleFontFamily,
  loadLocalFontFile,
  readCustomFontsSession,
  restoreGoogleCustomFonts,
  writeCustomFontsSession,
} from '@/lib/browser/customFonts';
import type { CustomFontSubmitInput } from '@/components/font-pairing/CustomFontEntry';
import { extractPaletteColorsFromImage } from '@/lib/browser/imageExtractor';
import { getImageFingerprint } from '@/lib/browser/imageFingerprint';
import { readSelectedFontPairId, writeSelectedFontPairId } from '@/lib/browser/selectedFontPair';
import { requestStudioToolFocus } from '@/lib/browser/studioToolFocus';

export function useSelectColorsWorkspaceController() {
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [paletteCatalog, setPaletteCatalog] = useState<SelectableColor[]>([]);
  const {
    rolePalette,
    exportRolePalette,
    exportStatusTokenOverrides,
    tokenOverridesByTheme,
    selectionReady,
    clearRolePalette,
    replaceRole,
    renameRole,
    assignFromHexes,
    assignFromExtracted,
  } = useRolePalette();
  const [catalogSource, setCatalogSource] = useState<'none' | 'curated' | 'image'>('none');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [typeUi, setTypeUi] = useState<TypeUiState>(() => createInitialTypeUiState());
  const [isImageExtracting, setIsImageExtracting] = useState(false);
  const [isImageRegenerating, setIsImageRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspirationModalOpen, setInspirationModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageFingerprint, setImageFingerprint] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRegenerateIndex, setImageRegenerateIndex] = useState(0);
  const [imagePaletteType, setImagePaletteType] = useState<PaletteType | null>(null);
  const [paletteTypeOverride, setPaletteTypeOverride] = useState<PaletteType | null>(null);
  const generatingRef = useRef(false);
  const imagePreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const storedPairId = readSelectedFontPairId();
    const storedPair = FONT_PAIRS.find((pairing) => pairing.id === storedPairId) ?? null;
    const sessionFonts = readCustomFontsSession();

    if (storedPair !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypeUi({
        ...createInitialTypeUiState(storedPair),
        customFonts: sessionFonts.filter((entry) => entry.source === 'google'),
      });
    } else if (sessionFonts.length > 0) {
      setTypeUi((current) => ({
        ...current,
        customFonts: sessionFonts.filter((entry) => entry.source === 'google'),
      }));
    }

    void restoreGoogleCustomFonts(sessionFonts).then((available) => {
      writeCustomFontsSession(available);
      setTypeUi((current) => ({ ...current, customFonts: available }));
    });
  }, []);

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
    setImageFingerprint(null);
    void getImageFingerprint(file).then(setImageFingerprint).catch(() => setImageFingerprint(null));
  }

  async function processImageFile(
    file: File,
    regenerateIndex = 0,
    isRegenerate = false,
    requestedPaletteType: PaletteType | null = paletteTypeOverride,
  ) {
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
      const palette = buildImagePalette(extracted, {
        paletteType: requestedPaletteType ?? undefined,
      });
      setImagePaletteType(palette.classification.type);
      handleImagePaletteExtracted(palette);
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

  function handlePaletteTypeChange(type: PaletteType | null) {
    setPaletteTypeOverride(type);

    if (imageFile !== null) {
      void processImageFile(imageFile, imageRegenerateIndex + 1, true, type);
    }
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
  const fontPairings = FONT_PAIRS;

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
      setStatusMessage('Guía de marca lista. Revisa contraste y tipografía, luego exporta.');
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

  useWorkspaceShortcuts({ handleGenerate, isReviewPhase, selectionReady });

  function exitReviewPhase() {
    setGeneratedPalette(null);
    setStatusMessage(null);
  }

  const resetWorkspace = useCallback(() => {
    if (imagePreviewUrlRef.current !== null) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }

    setImagePreviewUrl(null);
    setImageFileName(null);
    setImageFingerprint(null);
    setImageFile(null);
    setImageRegenerateIndex(0);
    setImagePaletteType(null);
    setPaletteTypeOverride(null);
    setIsImageExtracting(false);
    setIsImageRegenerating(false);

    setCatalogSource('none');
    setSelectedStyleId(null);
    setPaletteCatalog([]);
    clearRolePalette();
    setGeneratedPalette(null);

    setError(null);
    setStatusMessage(null);
    setInspirationModalOpen(false);
    setResetConfirmOpen(false);

    setTypeUi(createInitialTypeUiState());
  }, [clearRolePalette]);

  const requestCraftieHome = useCallback(() => {
    const hasProgress = hasWorkspaceProgress({
      catalogSource,
      rolePalette,
      generatedPalette,
      imageFile,
      imagePreviewUrl,
      isImageBusy,
    });

    if (hasProgress) {
      setResetConfirmOpen(true);
      return;
    }

    resetWorkspace();
  }, [
    catalogSource,
    generatedPalette,
    imageFile,
    imagePreviewUrl,
    isImageBusy,
    resetWorkspace,
    rolePalette,
  ]);

  const cancelResetWorkspace = useCallback(() => {
    setResetConfirmOpen(false);
  }, []);

  const confirmResetWorkspace = useCallback(() => {
    resetWorkspace();
  }, [resetWorkspace]);

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

    if (stepId === 'adjust') {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[data-flow-target="role-palette"] button')
          ?.focus();
      });
      return;
    }

    if (stepId === 'generate') {
      requestStudioToolFocus('source');
    }
  }

  function handleSelectPairing(pairing: FontPair) {
    setTypeUi((current) => {
      const applied = applyPairToTypography(current.applied, pairing, {
        pinHeading: current.pinHeading,
        pinBody: current.pinBody,
      });
      if (applied.catalogPairId) {
        writeSelectedFontPairId(applied.catalogPairId);
      }
      return { ...current, applied, hovered: null };
    });
  }

  function handlePreviewPairing(pairing: FontPair) {
    setTypeUi((current) => ({
      ...current,
      hovered: previewPairTypography(current.applied, pairing, {
        pinHeading: current.pinHeading,
        pinBody: current.pinBody,
      }),
    }));
  }

  function handleClearPreview() {
    setTypeUi((current) => ({ ...current, hovered: null }));
  }

  function handleTogglePinHeading() {
    setTypeUi((current) => ({ ...current, pinHeading: !current.pinHeading, hovered: null }));
  }

  function handleTogglePinBody() {
    setTypeUi((current) => ({ ...current, pinBody: !current.pinBody, hovered: null }));
  }

  function handleTypeScaleBaseChange(base: TypeScaleBase) {
    setTypeUi((current) => ({ ...current, base }));
  }

  function handleTypeScaleRatioChange(ratio: TypeScaleRatio) {
    setTypeUi((current) => ({ ...current, ratio }));
  }

  function handleHeadingWeightChange(weight: number) {
    setTypeUi((current) => ({
      ...current,
      applied: { ...current.applied, headingWeight: weight },
    }));
  }

  async function handleApplyCustomFont(input: CustomFontSubmitInput) {
    if (input.source === 'google') {
      await loadGoogleFontFamily(input.family);
    } else if (input.file) {
      await loadLocalFontFile(input.file, input.family);
    } else {
      const alreadyLoaded = typeUi.customFonts.some(
        (font) =>
          font.source === 'local' &&
          font.family.toLowerCase() === input.family.trim().toLowerCase(),
      );
      if (!alreadyLoaded) {
        throw new Error('Elige un archivo de fuente.');
      }
    }

    const entry = createCustomFont({
      family: input.family,
      source: input.source,
      fileName: input.file?.name,
    });

    setTypeUi((current) => {
      const customFonts = upsertCustomFont(current.customFonts, entry);
      writeCustomFontsSession(customFonts);
      return {
        ...current,
        customFonts,
        applied: applyCustomFamilyToRole(current.applied, input.family, input.role),
        hovered: null,
      };
    });
  }

  const selectedPairing = useMemo(() => {
    const catalogId = typeUi.applied.catalogPairId;
    if (catalogId) {
      return FONT_PAIRS.find((pairing) => pairing.id === catalogId) ?? appliedToLoadablePair(typeUi.applied);
    }
    return appliedToLoadablePair(typeUi.applied);
  }, [typeUi.applied]);

  const hoveredPairing = useMemo(() => {
    if (!typeUi.hovered) {
      return null;
    }
    return appliedToLoadablePair(typeUi.hovered);
  }, [typeUi.hovered]);

  const {
    handleImageExtractionError,
    handleImageExtractionStart,
    handleImagePaletteExtracted,
    handleImageRegenerateStart,
    handleSelectStyle,
  } = useWorkspaceInspiration({
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
  });

  const {
    canExport,
    exportBlockedReason,
    handleExportBrandKit,
    handleExportCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
  } = useWorkspaceExports({
    rolePalette: exportRolePalette,
    tokenOverridesByTheme,
    exportStatusTokenOverrides,
    selectedPairing,
    setError,
    setStatusMessage,
  });

  return {
    catalogSource,
    canExport,
    exportBlockedReason,
    error,
    imageFileName,
    imageFingerprint,
    imagePaletteType,
    paletteTypeOverride,
    imagePreviewUrl,
    handleImageFileSelected,
    handleImageRegenerate,
    handlePaletteTypeChange,
    generatedPalette,
    handleAddColorByHex,
    handleExportBrandKit,
    handleExportCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
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
    fontPairings,
    rolePalette,
    selectedPairing,
    hoveredPairing,
    appliedTypography: typeUi.applied,
    selectedCatalogPairId: typeUi.applied.catalogPairId,
    pinHeading: typeUi.pinHeading,
    pinBody: typeUi.pinBody,
    typeScaleBase: typeUi.base,
    typeScaleRatio: typeUi.ratio,
    customFonts: typeUi.customFonts,
    isTypePreviewing: typeUi.hovered !== null,
    selectedStyleId,
    selectionReady,
    resetConfirmOpen,
    requestCraftieHome,
    cancelResetWorkspace,
    confirmResetWorkspace,
    setInspirationModalOpen,
    setSelectedPairing: handleSelectPairing,
    previewPairing: handlePreviewPairing,
    clearTypePreview: handleClearPreview,
    togglePinHeading: handleTogglePinHeading,
    togglePinBody: handleTogglePinBody,
    setTypeScaleBase: handleTypeScaleBaseChange,
    setTypeScaleRatio: handleTypeScaleRatioChange,
    setHeadingWeight: handleHeadingWeightChange,
    applyCustomFont: handleApplyCustomFont,
    statusMessage,
  };
}
