'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';
import { isGeneratedPaletteRole } from '@lib/color/paletteDisplay';
import { normalizeHex } from '@lib/color/normalizeHex';
import { addColorToPalette, renamePaletteColor } from '@lib/color/paletteOrder';
import {
  assignColorToRolePalette,
  generatePaletteFromRolePalette,
  isPaletteRoleId,
  validateRolePalette,
} from '@lib/color/rolePalette';
import { SELECTABLE_COLORS, type SelectableColor } from '@lib/color/selectableColors';
import { DESIGN_STYLES, type DesignStyle } from '@lib/styles/presets';
import { getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import { downloadTextFile } from '@lib/export/download';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import type { StudioView } from '@lib/export/studioViews';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';
import {
  isGenerateShortcut,
  isShortcutsHelpShortcut,
  shouldIgnoreStudioShortcut,
} from '@lib/studio/studioShortcuts';

import type { InspectorSection } from '@/components/color/InspectorPanel';
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

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (isShortcutsHelpShortcut(event)) {
        event.preventDefault();
        shortcutsRef.current?.open();
        return;
      }

      if (isReviewPhase || !selectionReady) {
        return;
      }

      if (!isGenerateShortcut(event) || shouldIgnoreStudioShortcut(event.target)) {
        return;
      }

      event.preventDefault();
      handleGenerate();
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleGenerate, isReviewPhase, selectionReady]);

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
      setRolePalette(assignColorToRolePalette(rolePalette, hex));
    } else {
      assignFromHexes([hex]);
    }

    setRightPanelOpen(true);
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

  function handleExportDesignMd() {
    if (!generatedPalette || !rolePalette || !seeds) return;
    const content = generateDesignMd({ seeds, themes, pairing: selectedPairing });
    const result = downloadTextFile('DESIGN.md', content, 'text/markdown;charset=utf-8');

    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('DESIGN.md descargado.');
  }

  function handleExportBrandKit() {
    if (!generatedPalette || !rolePalette || !seeds) return;
    const kit = buildBrandKit(generatedPalette, rolePalette, selectedPairing, 'Craftie Kit', {
      seeds,
      themes,
    });
    const result = downloadTextFile('brand-kit.json', serializeBrandKit(kit), 'application/json;charset=utf-8');

    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }

    setError(null);
    setStatusMessage('Brand Kit descargado.');
  }

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
