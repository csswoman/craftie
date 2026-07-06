'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import {
  generatePaletteFromRolePalette,
  validateRolePalette,
} from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { DESIGN_STYLES } from '@lib/styles/presets';
import { getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import type { StudioView } from '@lib/export/studioViews';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';

import type { InspectorSection } from '@/components/color/InspectorPanel';
import { useWorkspaceExports } from '@/components/color/useWorkspaceExports';
import { useWorkspaceInspiration } from '@/components/color/useWorkspaceInspiration';
import { useWorkspacePaletteActions } from '@/components/color/useWorkspacePaletteActions';
import { useWorkspaceShortcuts } from '@/components/color/useWorkspaceShortcuts';
import type { StudioShortcutsHelpHandle } from '@/components/layout/StudioShortcutsHelp';
import { useRolePalette } from '@/context/RolePaletteContext';

export function useSelectColorsWorkspaceController() {
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [studioView, setStudioView] = useState<StudioView>('style-guide');
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
  const [inspectorSection, setInspectorSection] = useState<InspectorSection>('accessibility');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [inspirationModalOpen, setInspirationModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const generatingRef = useRef(false);
  const shortcutsRef = useRef<StudioShortcutsHelpHandle>(null);

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
      setStudioView('style-guide');
      setInspectorSection('accessibility');
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
    inspectorSection,
    isGenerating,
    isImageExtracting,
    isImageRegenerating,
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
    setInspectorSection,
    setRightPanelCollapsed,
    setRightPanelOpen,
    setSelectedPairing,
    setStudioView,
    shortcutsRef,
    statusMessage,
    studioView,
  };
}
