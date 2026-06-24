'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { generatePalette } from '@lib/color/formulas';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';
import {
  mapSelectedColorsToSeeds,
  SELECTABLE_COLORS,
  suggestSelectionFromHexes,
  validateSelection,
  type SelectableColor,
} from '@lib/color/selectableColors';
import { addColorToPalette, renamePaletteColor, replacePaletteColor } from '@lib/color/paletteOrder';
import { replaceSeeds, validateSeedsForGeneration } from '@lib/color/seeds';
import { DESIGN_STYLES, type DesignStyle } from '@lib/styles/presets';
import { getRecommendedPairings, type FontPair } from '@lib/typography/pairings';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import { downloadTextFile } from '@lib/export/download';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import { isLayoutView, type StudioView } from '@lib/export/studioViews';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';

import { ColorSelectionPanel } from '@/components/color/ColorSelectionPanel';
import { PaletteCanvas, type PaletteCanvasMode } from '@/components/color/PaletteCanvas';
import { InspectorPanel, type InspectorSection } from '@/components/color/InspectorPanel';
import { ContrastPanel } from '@/components/color-engine/ContrastPanel';
import { GenerateButton } from '@/components/color-engine/GenerateButton';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PalettePreview } from '@/components/color-engine/PalettePreview';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
import { StudioFlowGuide } from '@/components/layout/StudioFlowGuide';
import { StudioStatusBar } from '@/components/layout/StudioStatusBar';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import { PairingList } from '@/components/font-pairing/PairingList';
import { StyleGuideView } from '@/components/style-guide/StyleGuideView';
import { MockupPreviewGrid } from '@/components/brand-preview/MockupPreviewGrid';
import {
  ColorsView,
  LayoutPreview,
  TypeScaleView,
} from '@/components/style-guide/StudioViews';
import { ToolsSidebar, type ToolSection } from '@/components/color/ToolsSidebar';

export function SelectColorsWorkspace() {
  const [studioView, setStudioView] = useState<StudioView>('style-guide');
  const [paletteCatalog, setPaletteCatalog] = useState<SelectableColor[]>([]);
  const [selectedColors, setSelectedColors] = useState<SelectableColor[]>([]);
  const [catalogSource, setCatalogSource] = useState<'none' | 'curated' | 'image'>('none');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);
  const [selectedPairing, setSelectedPairing] = useState<FontPair | null>(null);
  const [isImageExtracting, setIsImageExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolSection, setToolSection] = useState<ToolSection>('colors');
  const [inspectorSection, setInspectorSection] = useState<InspectorSection>('accessibility');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [canvasMode, setCanvasMode] = useState<PaletteCanvasMode>('selection');
  const [lockedColorIds, setLockedColorIds] = useState<string[]>([]);
  const [inspirationOpenRequestId, setInspirationOpenRequestId] = useState(0);

  const activeCatalog = paletteCatalog.length > 0 ? paletteCatalog : SELECTABLE_COLORS;

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

  const selectionValidation = useMemo(() => validateSelection(selectedColors), [selectedColors]);
  const selectionReady = selectionValidation.ok;
  const isReviewPhase = generatedPalette !== null;
  const showInspirationByDefault = !isReviewPhase && selectedColors.length === 0 && !isImageExtracting;

  useEffect(() => {
    if (isReviewPhase) {
      return;
    }

    if (selectionReady) {
      setToolSection('generate');
      return;
    }

    if (selectedColors.length > 0) {
      setToolSection('colors');
    }
  }, [isReviewPhase, selectedColors.length, selectionReady]);

  const handleGenerate = useCallback(() => {
    const selectionResult = validateSelection(selectedColors);

    if (!selectionResult.ok) {
      setError(selectionResult.error);
      setGeneratedPalette(null);
      return;
    }

    const seeds = replaceSeeds(mapSelectedColorsToSeeds(selectedColors));
    const seedResult = validateSeedsForGeneration(seeds);

    if (!seedResult.ok) {
      setError(seedResult.error);
      setGeneratedPalette(null);
      return;
    }

    setError(null);
    const nextPalette = generatePalette(seedResult.seeds);
    setGeneratedPalette(nextPalette);
    setCanvasMode('generated');
    setStudioView('style-guide');
    setInspectorSection('accessibility');
    setRightPanelOpen(true);
  }, [selectedColors]);

  useEffect(() => {
    if (isReviewPhase || !selectionReady) {
      return;
    }

    function handleShortcut(event: KeyboardEvent) {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'TEXTAREA' ||
          (target.tagName === 'INPUT' &&
            !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(
              (target as HTMLInputElement).type,
            )))
      ) {
        return;
      }

      event.preventDefault();
      handleGenerate();
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleGenerate, isReviewPhase, selectionReady]);

  function handleFlowStepFocus(stepId: StudioFlowStepId) {
    if (stepId === 'inspire') {
      setInspirationOpenRequestId((value) => value + 1);
      return;
    }

    if (stepId === 'adjust') {
      setToolSection('colors');
      setRightPanelOpen(true);
      return;
    }

    if (stepId === 'generate') {
      setToolSection('generate');
    }
  }

  function applyCuratedInspiration(hexes: string[], styleId: string | null) {
    const suggestion = suggestSelectionFromHexes(hexes);

    if (!suggestion.ok) {
      setError(suggestion.error);
      return;
    }

    setCatalogSource('curated');
    setPaletteCatalog([...SELECTABLE_COLORS]);
    setSelectedStyleId(styleId);
    setSelectedColors(suggestion.colors);
    setGeneratedPalette(null);
    setCanvasMode('selection');
    setToolSection('colors');
    setRightPanelOpen(true);
    setError(null);
  }

  function handleSelectStyle(style: DesignStyle) {
    applyCuratedInspiration(style.seeds, style.id);
  }

  function handleImageExtractionStart() {
    setIsImageExtracting(true);
    setCatalogSource('image');
    setPaletteCatalog([]);
    setSelectedColors([]);
    setSelectedStyleId(null);
    setGeneratedPalette(null);
    setCanvasMode('selection');
    setError(null);
  }

  function handleImagePaletteExtracted(palette: ImagePaletteBuildResult) {
    setIsImageExtracting(false);
    setCatalogSource('image');
    setPaletteCatalog(palette.catalog);
    setSelectedStyleId(null);
    setSelectedColors(palette.selection);
    setGeneratedPalette(null);
    setCanvasMode('selection');
    setToolSection('colors');
    setRightPanelOpen(true);
    setError(null);
  }

  function handleImageExtractionError(message: string) {
    setIsImageExtracting(false);
    setCatalogSource('none');
    setPaletteCatalog([]);
    setSelectedColors([]);
    setError(message);
  }

  function handleToggleLock(colorId: string) {
    setLockedColorIds((current) =>
      current.includes(colorId)
        ? current.filter((id) => id !== colorId)
        : [...current, colorId],
    );
  }

  function handleReplacePaletteColor(colorId: string, newHex: string) {
    const result = replacePaletteColor(activeCatalog, selectedColors, colorId, newHex);

    if (!result) {
      return;
    }

    setPaletteCatalog(result.catalog);
    setSelectedColors(result.selected);

    const selectedIndex = selectedColors.findIndex((color) => color.id === colorId);
    const updated = result.selected[selectedIndex];

    if (updated && updated.id !== colorId) {
      setLockedColorIds((current) =>
        current.map((id) => (id === colorId ? updated.id : id)),
      );
    }
  }

  function handleAddColorByHex(hex: string, customName?: string): string | null {
    const baseCatalog = paletteCatalog.length > 0 ? paletteCatalog : [...SELECTABLE_COLORS];
    const result = addColorToPalette(baseCatalog, selectedColors, hex, { customName });

    if (!result.ok) {
      return result.error;
    }

    if (paletteCatalog.length === 0) {
      setCatalogSource('curated');
    }

    setPaletteCatalog(result.catalog);
    setSelectedColors(result.selected);
    setToolSection('colors');
    setRightPanelOpen(true);
    setError(null);

    return result.message ?? null;
  }

  function handleRenameColor(colorId: string, name: string): string | null {
    const baseCatalog = paletteCatalog.length > 0 ? paletteCatalog : [...SELECTABLE_COLORS];
    const result = renamePaletteColor(baseCatalog, selectedColors, colorId, name);

    if (!result) {
      return 'Introduce un nombre válido (1–40 caracteres).';
    }

    if (paletteCatalog.length === 0) {
      setCatalogSource('curated');
    }

    setPaletteCatalog(result.catalog);
    setSelectedColors(result.selected);
    return null;
  }

  function handleExportDesignMd() {
    if (!generatedPalette) return;
    const content = generateDesignMd({ palette: generatedPalette, pairing: selectedPairing });
    downloadTextFile('DESIGN.md', content, 'text/markdown;charset=utf-8');
  }

  function handleExportBrandKit() {
    if (!generatedPalette) return;
    const kit = buildBrandKit(generatedPalette, selectedPairing);
    downloadTextFile('brand-kit.json', serializeBrandKit(kit), 'application/json;charset=utf-8');
  }

  const showSelectionPanel = !isReviewPhase && (isImageExtracting || selectedColors.length > 0);
  const showInspectorPanel =
    isReviewPhase && !isLayoutView(studioView) && studioView !== 'colors';
  const mobileRightPanelAvailable = showSelectionPanel || showInspectorPanel;

  const mainContent = renderMainContent({
    generatedPalette,
    studioView,
    canvasMode,
    setCanvasMode,
    selectedColors,
    isImageExtracting,
    selectedPairing,
    activeCatalog,
    lockedColorIds,
    onSelectedColorsChange: setSelectedColors,
    onToggleLock: handleToggleLock,
    onReplaceColor: handleReplacePaletteColor,
    onAddColorByHex: handleAddColorByHex,
    onRenameColor: handleRenameColor,
  });

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <WorkspaceHeader
        activeView={studioView}
        onViewChange={setStudioView}
        canExport={isReviewPhase}
        onExportDesignMd={handleExportDesignMd}
        onExportBrandKit={handleExportBrandKit}
      />

      {!isReviewPhase ? (
        <StudioFlowGuide
          hasGeneratedPalette={false}
          hasSelection={selectedColors.length > 0}
          selectionReady={selectionReady}
          onStepFocus={handleFlowStepFocus}
        />
      ) : null}

      <StudioCanvas
        showRightPanel={showSelectionPanel || showInspectorPanel}
        rightPanelOpen={rightPanelOpen}
        sidebar={
          <div className="flex min-h-0 flex-1 flex-col">
            <ToolsSidebar
              activeSection={toolSection}
              onSectionChange={setToolSection}
              inspirationDefaultOpen={showInspirationByDefault}
              inspirationOpenRequestId={inspirationOpenRequestId}
              inspirationPanel={
                <StyleGallery
                  styles={DESIGN_STYLES}
                  selectedStyleId={selectedStyleId}
                  onSelectStyle={handleSelectStyle}
                  variant="embedded"
                  showHeader={false}
                />
              }
              colorsPanel={
                <ImageUploader
                  onExtractionStart={handleImageExtractionStart}
                  onPaletteExtracted={handleImagePaletteExtracted}
                  onExtractionError={handleImageExtractionError}
                  variant="embedded"
                  showHeader={false}
                />
              }
              generatePanel={
                <div className="space-y-4">
                  <p className="text-[0.8125rem] leading-relaxed text-muted">
                    Calcula roles semánticos a partir de tu selección y abre la guía de estilo al
                    generar.
                  </p>
                  <GenerateButton onClick={handleGenerate} />
                  {error ? (
                    <p role="alert" className="text-[0.8125rem] font-medium text-fail">
                      {error}
                    </p>
                  ) : null}
                  <PalettePreview palette={generatedPalette} variant="embedded" />
                </div>
              }
            />
            {isReviewPhase ? (
              <div className="shrink-0 border-t border-border p-4">
                <h2 className="text-[0.8125rem] font-semibold text-ink">Tipografía</h2>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
                  Pares sugeridos según el estilo elegido.
                </p>
                <div className="mt-3">
                  <PairingList
                    pairings={recommendedPairings}
                    selectedPairing={selectedPairing}
                    onSelectPairing={setSelectedPairing}
                  />
                </div>
              </div>
            ) : null}
          </div>
        }
        main={mainContent}
        rightPanel={
          showInspectorPanel ? (
            <InspectorPanel
              activeSection={inspectorSection}
              onSectionChange={setInspectorSection}
              accessibilityPanel={<ContrastPanel palette={generatedPalette} variant="embedded" />}
              layoutsPanel={
                <MockupPreviewGrid
                  palette={generatedPalette}
                  pairing={selectedPairing}
                  variant="compact"
                />
              }
            />
          ) : showSelectionPanel ? (
            <ColorSelectionPanel
              catalogSource={catalogSource}
              isExtracting={isImageExtracting}
              colors={paletteCatalog}
              selectedColors={selectedColors}
              onSelectedColorsChange={(colors) => {
                setSelectedColors(colors);
                setError(null);
              }}
              onAddColorByHex={handleAddColorByHex}
              onRenameColor={handleRenameColor}
            />
          ) : null
        }
      />

      {mobileRightPanelAvailable ? (
        <div className="flex shrink-0 items-center justify-end border-t border-border bg-bg px-3 py-2 xl:hidden">
          <button
            type="button"
            onClick={() => setRightPanelOpen((open) => !open)}
            aria-expanded={rightPanelOpen}
            className="rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            {rightPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}
          </button>
        </div>
      ) : null}

      <StudioStatusBar palette={generatedPalette} pairing={selectedPairing} />
    </div>
  );
}

function renderMainContent({
  generatedPalette,
  studioView,
  canvasMode,
  setCanvasMode,
  selectedColors,
  isImageExtracting,
  selectedPairing,
  activeCatalog,
  lockedColorIds,
  onSelectedColorsChange,
  onToggleLock,
  onReplaceColor,
  onAddColorByHex,
  onRenameColor,
}: {
  generatedPalette: GeneratedPalette | null;
  studioView: StudioView;
  canvasMode: PaletteCanvasMode;
  setCanvasMode: (mode: PaletteCanvasMode) => void;
  selectedColors: SelectableColor[];
  isImageExtracting: boolean;
  selectedPairing: FontPair | null;
  activeCatalog: SelectableColor[];
  lockedColorIds: string[];
  onSelectedColorsChange: (colors: SelectableColor[]) => void;
  onToggleLock: (colorId: string) => void;
  onReplaceColor: (colorId: string, newHex: string) => void;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
  onRenameColor: (colorId: string, name: string) => string | null;
}) {
  if (!generatedPalette) {
    return (
      <PaletteCanvas
        mode={canvasMode}
        onModeChange={setCanvasMode}
        selectedColors={selectedColors}
        generatedPalette={generatedPalette}
        isLoading={isImageExtracting}
        catalog={activeCatalog}
        lockedIds={lockedColorIds}
        editable={selectedColors.length > 0}
        onSelectedColorsChange={onSelectedColorsChange}
        onReplaceColor={onReplaceColor}
        onAddColorByHex={onAddColorByHex}
        onToggleLock={onToggleLock}
      />
    );
  }

  if (studioView === 'style-guide') {
    return <StyleGuideView palette={generatedPalette} pairing={selectedPairing} />;
  }

  if (studioView === 'type-scale') {
    return <TypeScaleView palette={generatedPalette} pairing={selectedPairing} />;
  }

  if (studioView === 'colors') {
    return <ColorsView palette={generatedPalette} />;
  }

  if (isLayoutView(studioView)) {
    return (
      <LayoutPreview layout={studioView} palette={generatedPalette} pairing={selectedPairing} />
    );
  }

  return null;
}
