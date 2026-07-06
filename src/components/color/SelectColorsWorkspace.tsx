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
import { isLayoutView, type StudioView } from '@lib/export/studioViews';
import type { StudioFlowStepId } from '@lib/studio/studioFlow';
import {
  isGenerateShortcut,
  isShortcutsHelpShortcut,
  shouldIgnoreStudioShortcut,
} from '@lib/studio/studioShortcuts';

import { ColorSelectionPanel } from '@/components/color/ColorSelectionPanel';
import { PaletteCanvas } from '@/components/color/PaletteCanvas';
import { RoleActiveSelector } from '@/components/color/RoleActiveSelector';
import { RoleInspector } from '@/components/color/RoleInspector';
import { InspectorPanel, type InspectorSection } from '@/components/color/InspectorPanel';
import { ContrastPanel } from '@/components/color-engine/ContrastPanel';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PalettePreview } from '@/components/color-engine/PalettePreview';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
import { StudioFlowGuide } from '@/components/layout/StudioFlowGuide';
import { StudioStatusBar } from '@/components/layout/StudioStatusBar';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import type { StudioShortcutsHelpHandle } from '@/components/layout/StudioShortcutsHelp';
import { PairingList } from '@/components/font-pairing/PairingList';
import { StyleGuideView } from '@/components/style-guide/StyleGuideView';
import { MockupPreviewGrid } from '@/components/brand-preview/MockupPreviewGrid';
import {
  ColorsView,
  LayoutPreview,
  TypeScaleView,
} from '@/components/style-guide/StudioViews';
import { InspirationModal } from '@/components/color/InspirationModal';
import { ReviewPhaseControls } from '@/components/color/ReviewPhaseControls';
import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import { Button } from '@/components/ui/Button';
import { RolePaletteProvider, useRolePalette } from '@/context/RolePaletteContext';

export function SelectColorsWorkspace() {
  const [generatedPalette, setGeneratedPalette] = useState<GeneratedPalette | null>(null);

  return (
    <RolePaletteProvider>
      <SelectColorsWorkspaceContent
        generatedPalette={generatedPalette}
        setGeneratedPalette={setGeneratedPalette}
      />
    </RolePaletteProvider>
  );
}

function SelectColorsWorkspaceContent({
  generatedPalette,
  setGeneratedPalette,
}: {
  generatedPalette: GeneratedPalette | null;
  setGeneratedPalette: (palette: GeneratedPalette | null) => void;
}) {
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

  const isReviewPhase = generatedPalette !== null;

  useEffect(() => {
    if (!rolePalette || !isReviewPhase) {
      return;
    }

    setGeneratedPalette(generatePaletteFromRolePalette(rolePalette));
  }, [rolePalette, isReviewPhase, setGeneratedPalette]);

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
  }, [rolePalette, setGeneratedPalette]);

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

  const showInspectorPanel = isReviewPhase;

  const mainContent = renderMainContent({
    generatedPalette,
    studioView,
    isImageExtracting,
    isImageRegenerating,
    selectedPairing,
    onAddColorByHex: handleAddColorByHex,
  });

  const mobileRightPanelAvailable = true;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <WorkspaceHeader
        activeView={studioView}
        onViewChange={setStudioView}
        canExport={isReviewPhase}
        onExportDesignMd={handleExportDesignMd}
        onExportBrandKit={handleExportBrandKit}
        shortcutsRef={shortcutsRef}
      />

      {error ? (
        <p
          role="alert"
          className="mx-4 mt-0 border-b border-fail/20 bg-fail/5 px-3 py-2 text-[0.8125rem] font-medium text-fail lg:mx-5"
        >
          {error}
        </p>
      ) : null}

      <StudioFlowGuide
        hasGeneratedPalette={isReviewPhase}
        hasSelection={rolePalette !== null}
        selectionReady={selectionReady}
        onStepFocus={handleFlowStepFocus}
      />

      <StudioCanvas
        showRightPanel
        rightPanelOpen={rightPanelOpen}
        syncRightPanelWithActiveRole={!isReviewPhase}
        onRightPanelCollapsedChange={setRightPanelCollapsed}
        sidebar={
          <div className="flex h-full min-h-0 flex-1 flex-col">
            <StudioToolsPanel>
              {isReviewPhase ? (
                <>
                  <ReviewPhaseControls onEditSelection={() => handleFlowStepFocus('adjust')} />
                  {generatedPalette ? (
                    <PalettePreview
                      palette={generatedPalette}
                      variant="embedded"
                      onReplaceColor={handleReplacePreviewColor}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  {rolePalette ? <RoleActiveSelector /> : null}
                  <RoleInspector />
                  <ImageUploader
                    onExtractionStart={handleImageExtractionStart}
                    onRegenerateStart={handleImageRegenerateStart}
                    onPaletteExtracted={handleImagePaletteExtracted}
                    onExtractionError={handleImageExtractionError}
                    variant="embedded"
                    showHeader={false}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
                    onClick={() => setInspirationModalOpen(true)}
                  >
                    Elegir inspiración
                  </Button>
                </>
              )}
            </StudioToolsPanel>
            {isReviewPhase ? (
              <div className="shrink-0 border-t border-border px-4 py-3">
                <CollapsibleSection title="Tipografía" defaultOpen={recommendedPairings.length > 0}>
                  <PairingList
                    pairings={recommendedPairings}
                    selectedPairing={selectedPairing}
                    onSelectPairing={setSelectedPairing}
                  />
                </CollapsibleSection>
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
              accessibilityPanel={
                <ContrastPanel
                  palette={generatedPalette}
                  variant="embedded"
                  onApplyForeground={(role, hex) => {
                    void handleReplacePreviewColor(role, hex);
                  }}
                />
              }
              layoutsPanel={
                <MockupPreviewGrid
                  palette={generatedPalette}
                  pairing={selectedPairing}
                  variant="compact"
                />
              }
            />
          ) : (
            <ColorSelectionPanel
              catalogSource={catalogSource}
              isExtracting={isImageExtracting}
              isRegenerating={isImageRegenerating}
              colors={paletteCatalog}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              onAddColorByHex={handleAddColorByHex}
              onRenameColor={handleRenameColor}
              rightPanelCollapsed={rightPanelCollapsed}
            />
          )
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

      <InspirationModal
        open={inspirationModalOpen && !isReviewPhase}
        onClose={() => setInspirationModalOpen(false)}
      >
        <StyleGallery
          styles={DESIGN_STYLES}
          selectedStyleId={selectedStyleId}
          onSelectStyle={handleSelectStyle}
          variant="embedded"
          showHeader={false}
        />
      </InspirationModal>
    </div>
  );
}

function renderMainContent({
  generatedPalette,
  studioView,
  isImageExtracting,
  isImageRegenerating,
  selectedPairing,
  onAddColorByHex,
}: {
  generatedPalette: GeneratedPalette | null;
  studioView: StudioView;
  isImageExtracting: boolean;
  isImageRegenerating: boolean;
  selectedPairing: FontPair | null;
  onAddColorByHex: (hex: string, customName?: string) => string | null;
}) {
  if (!generatedPalette) {
    return (
      <PaletteCanvas
        isLoading={isImageExtracting}
        isUpdating={isImageRegenerating}
        editable
        onAddColorByHex={onAddColorByHex}
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
