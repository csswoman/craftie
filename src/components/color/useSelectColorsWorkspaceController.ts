'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { normalizeHex } from '@lib/color/normalizeHex';
import { buildImagePalette } from '@lib/color/imagePalette';
import type { PaletteType } from '@lib/color/paletteClassification';
import { validateImageFile } from '@lib/color/imageExtractor';
import {
  generatePaletteFromRolePalette,
  validateRolePalette,
} from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { buildSourceCatalogFromHexes } from '@lib/color/sourceCatalog';
import { DESIGN_STYLES } from '@lib/styles/presets';
import { FONT_PAIRS, getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import {
  getPaletteAwareRecommendations,
  hasPaletteContext,
} from '@lib/typography/paletteAwarePairing';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';
import { hasWorkspaceProgress } from '@lib/studio/workspaceProgress';
import { buildExampleWorkspaceSnapshot } from '@lib/studio/exampleWorkspace';
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
import { useCanvasView } from '@/context/CanvasViewContext';
import { useRolePalette } from '@/context/RolePaletteContext';
import {
  loadGoogleFontFamily,
  loadLocalFontFile,
  readCustomFontsSession,
  restoreGoogleCustomFonts,
  writeCustomFontsSession,
} from '@/lib/browser/customFonts';
import type { CustomFontSubmitInput } from '@/components/font-pairing/CustomFontModal';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';
import { extractPaletteColorsFromImage } from '@/lib/browser/imageExtractor';
import { getImageFingerprint } from '@/lib/browser/imageFingerprint';
import { readSelectedFontPairId, writeSelectedFontPairId } from '@/lib/browser/selectedFontPair';
import { requestStudioToolFocus } from '@/lib/browser/studioToolFocus';
import { clearShareHash, readShareHash } from '@/lib/browser/shareUrl';
import { readWorkspaceSnapshot } from '@/lib/browser/workspaceStorage';
import {
  readOnboardingDismissed,
  writeOnboardingDismissed,
} from '@/lib/browser/onboardingDismiss';
import type { LocalProject } from '@lib/studio/projectModel';

export function useSelectColorsWorkspaceController() {
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [storedPaletteCatalog, setPaletteCatalog] = useState<SelectableColor[]>([]);
  const {
    rolePalette,
    seeds,
    exportRolePalette,
    exportStatusTokenOverrides,
    tokenOverridesByTheme,
    selectionReady,
    clearRolePalette,
    replaceRole,
    renameRole,
    assignFromHexes,
    assignFromExtracted,
    getShareSnapshot,
    applySnapshot,
    setSnapshotExtras,
    restoredExtras,
  } = useRolePalette();
  // A palette restored from the example, autosave, a share link or a project has no
  // stored catalog; derive the source colors from the palette's own seed colors so the
  // Colores panel is never empty while a palette exists.
  const paletteCatalog = useMemo(
    () => storedPaletteCatalog.length > 0 || !seeds
      ? storedPaletteCatalog
      : buildSourceCatalogFromHexes((seeds.extracted ?? []).map((color) => color.hex)),
    [seeds, storedPaletteCatalog],
  );
  const { activeView, selectView } = useCanvasView();
  const [catalogSource, setCatalogSource] = useState<'none' | 'curated' | 'image'>('none');
  const [onboardingHintVisible, setOnboardingHintVisible] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [typeUi, setTypeUi] = useState<TypeUiState>(() => createInitialTypeUiState());
  const [typeScaleOverrides, setTypeScaleOverrides] = useState<SizeOverrides>({});
  const [typographySpacing, setTypographySpacing] = useState<TypographySpacing>({
    headingLineHeight: 1.2,
    headingLetterSpacing: -0.02,
    bodyLineHeight: 1.5,
    bodyLetterSpacing: 0,
  });
  const [largerTypeScaleSteps, setLargerTypeScaleSteps] = useState(0);
  const [smallerTypeScaleSteps, setSmallerTypeScaleSteps] = useState(0);
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

  // Publish confirmed typography and the active canvas view so they travel with
  // autosave, share links and saved projects. Hover previews and pins are
  // transient and never published.
  useEffect(() => {
    setSnapshotExtras({
      typography: { applied: typeUi.applied, base: typeUi.base, ratio: typeUi.ratio },
      canvasView: activeView,
    });
  }, [typeUi.applied, typeUi.base, typeUi.ratio, activeView, restoredExtras?.token, setSnapshotExtras]);

  // Re-apply typography / canvas view whenever the context restores a snapshot
  // (mount hydrate, share link or reopened project).
  useEffect(() => {
    if (!restoredExtras) return;
    const { typography, canvasView } = restoredExtras.extras;
    // Snapshots saved before typography was persisted fall back to the defaults
    // so a reopened project never inherits the previous project's fonts.
    const defaults = createInitialTypeUiState();
    const resolved = typography ?? defaults;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypeUi((current) => ({
      ...current,
      applied: resolved.applied,
      base: resolved.base,
      ratio: resolved.ratio,
      hovered: null,
    }));
    if (canvasView) selectView(canvasView);
  }, [restoredExtras, selectView]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current !== null) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  // First-load onboarding: when the visitor arrives with no shared link and no
  // stored workspace, preload a deterministic example palette so the studio
  // opens populated instead of empty, and surface a dismissible hint. The
  // RolePaletteContext still hydrates any stored/shared snapshot on its own; we
  // only step in when there is genuinely nothing to restore.
  useEffect(() => {
    const hasSharedState = readShareHash() !== null;
    const hasStoredState = readWorkspaceSnapshot() !== null;

    if (hasSharedState || hasStoredState) {
      return;
    }

    applySnapshot(buildExampleWorkspaceSnapshot());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCatalogSource('curated');

    if (!readOnboardingDismissed()) {
      setOnboardingHintVisible(true);
    }
  }, [applySnapshot]);

  const dismissOnboardingHint = useCallback(() => {
    writeOnboardingDismissed(true);
    setOnboardingHintVisible(false);
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
        variant: regenerateIndex,
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

  const recommendedPairings = useMemo<FontPair[]>(() => {
    const paletteTextHex = generatedPalette?.onSurface ?? null;
    const paletteBackgroundHex = generatedPalette?.surface ?? null;

    if (hasPaletteContext(paletteTextHex, paletteBackgroundHex)) {
      return getPaletteAwareRecommendations(
        {
          mood: activeMoods,
          paletteTextHex: paletteTextHex!,
          paletteBackgroundHex: paletteBackgroundHex!,
        },
        3,
      );
    }

    return getRecommendedPairings(activeMoods, 3);
  }, [activeMoods, generatedPalette]);
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

  const handleGenerate = useCallback((): boolean => {
    if (generatingRef.current) {
      return false;
    }

    generatingRef.current = true;
    setIsGenerating(true);

    try {
      const selectionResult = validateRolePalette(rolePalette);

      if (!selectionResult.ok) {
        setError(selectionResult.error);
        setGeneratedPalette(null);
        setStatusMessage(null);
        return false;
      }

      setError(null);
      const nextPalette = generatePaletteFromRolePalette(rolePalette!);
      setGeneratedPalette(nextPalette);
      setStatusMessage('Vista previa lista. Revisa la guía y usa Exportar para descargarla.');
      return true;
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
    setTypeScaleOverrides({});
    setTypographySpacing({ headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 });
    setLargerTypeScaleSteps(0);
    setSmallerTypeScaleSteps(0);
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

  const handleOpenProject = useCallback(
    (project: LocalProject) => {
      // A reopened project owns the workspace, so drop any share hash so the
      // mount-hydrate precedence never resurrects an older linked palette.
      clearShareHash();
      applySnapshot(project.snapshot);
      // Mark the workspace as sourced so the editor (not the empty state)
      // renders; the snapshot already carries the extracted colors.
      setCatalogSource('curated');
      setSelectedStyleId(null);
      setGeneratedPalette(null);
      setError(null);
      setStatusMessage(`Proyecto «${project.name}» abierto.`);
    },
    [applySnapshot],
  );

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

  function handleBodyWeightChange(weight: number) {
    setTypeUi((current) => ({
      ...current,
      applied: { ...current.applied, bodyWeight: weight },
    }));
  }

  function handleAddLargerTypeScaleStep() {
    setLargerTypeScaleSteps((current) => current + 1);
  }

  function handleAddSmallerTypeScaleStep() {
    setSmallerTypeScaleSteps((current) => current + 1);
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
    handleSelectCuratedHexes,
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

  function handleStartFromHex(input: string): string | null {
    let hex: string;
    try {
      hex = normalizeHex(input);
    } catch {
      return 'Escribe un color válido, por ejemplo #1F6F54.';
    }
    handleSelectCuratedHexes([hex]);
    return null;
  }

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
    handleCopyCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
    handleExportImage,
    handleCopyShareLink,
  } = useWorkspaceExports({
    rolePalette: exportRolePalette,
    tokenOverridesByTheme,
    exportStatusTokenOverrides,
    selectedPairing,
    getShareSnapshot,
    setError,
    setStatusMessage,
  });

  // A palette restored from autosave, a share link or a project has no inspiration
  // source of its own; treat it as sourced so the editor renders instead of the
  // empty state.
  const effectiveCatalogSource: typeof catalogSource =
    catalogSource === 'none' && rolePalette !== null ? 'curated' : catalogSource;

  return {
    catalogSource: effectiveCatalogSource,
    onboardingHintVisible,
    dismissOnboardingHint,
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
    handleCopyCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
    handleExportImage,
    handleCopyShareLink,
    handleStartFromHex,
    handleOpenProject,
    getShareSnapshot,
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
    typeScaleOverrides,
    typographySpacing,
    largerTypeScaleSteps,
    smallerTypeScaleSteps,
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
    setBodyWeight: handleBodyWeightChange,
    setTypeScaleOverrides,
    setTypographySpacing,
    addLargerTypeScaleStep: handleAddLargerTypeScaleStep,
    addSmallerTypeScaleStep: handleAddSmallerTypeScaleStep,
    applyCustomFont: handleApplyCustomFont,
    statusMessage,
  };
}
