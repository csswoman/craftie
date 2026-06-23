'use client';

import { useMemo, useState } from 'react';

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
import { replaceSeeds, validateSeedsForGeneration } from '@lib/color/seeds';
import { DESIGN_STYLES, type DesignStyle } from '@lib/styles/presets';
import { getRecommendedPairings, type FontPair } from '@lib/typography/pairings';

import { ColorSelectionPanel } from '@/components/color/ColorSelectionPanel';
import { PaletteCanvas, type PaletteCanvasMode } from '@/components/color/PaletteCanvas';
import { InspectorPanel, LayoutsPlaceholder, type InspectorSection } from '@/components/color/InspectorPanel';
import { ContrastPanel } from '@/components/color-engine/ContrastPanel';
import { GenerateButton } from '@/components/color-engine/GenerateButton';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { PalettePreview } from '@/components/color-engine/PalettePreview';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { SiteHeader, type WorkspaceTab } from '@/components/layout/SiteHeader';
import { WorkspaceShell } from '@/components/layout/WorkspaceShell';
import { PairingList } from '@/components/font-pairing/PairingList';
import { TypographyPreview } from '@/components/font-pairing/TypographyPreview';
import { ToolsSidebar, type ToolSection } from '@/components/color/ToolsSidebar';

export function SelectColorsWorkspace() {
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('colors');
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

  function applyCuratedInspiration(hexes: string[], styleId: string | null) {
    const suggestion = suggestSelectionFromHexes(hexes);

    if (!suggestion.ok) {
      setError(suggestion.error);
      return;
    }

    setCatalogSource('curated');
    setPaletteCatalog(SELECTABLE_COLORS);
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

  function handleGenerate() {
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
    setInspectorSection('accessibility');
    setRightPanelOpen(true);
  }

  const isReviewPhase = generatedPalette !== null;
  const showColorsRightPanel = workspaceTab === 'colors';
  const mobileRightPanelAvailable =
    isImageExtracting || paletteCatalog.length > 0 || generatedPalette !== null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        activePath="/select-colors"
        compact
        workspaceTab={workspaceTab}
        onWorkspaceTabChange={setWorkspaceTab}
      />

      <WorkspaceShell
        showRightPanel={showColorsRightPanel}
        mobileRightPanelAvailable={mobileRightPanelAvailable}
        rightPanelOpen={rightPanelOpen}
        onRightPanelToggle={() => setRightPanelOpen((open) => !open)}
        rightPanelAriaLabel={isReviewPhase ? 'Revisión de paleta' : 'Selección de colores'}
        rightPanelToggleLabels={
          isReviewPhase
            ? { open: 'Ocultar revisión', closed: 'Mostrar revisión' }
            : { open: 'Ocultar colores', closed: 'Mostrar colores' }
        }
        sidebar={
          workspaceTab === 'colors' ? (
            <ToolsSidebar
              activeSection={toolSection}
              onSectionChange={setToolSection}
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
                    Calcula roles semánticos a partir de tu selección y revisa accesibilidad en el
                    inspector.
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
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <h2 className="text-[0.9375rem] font-semibold text-ink">Parejas tipográficas</h2>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                Pares curados según el estado de ánimo del estilo elegido. La vista previa usa tu
                paleta generada.
              </p>
              <div className="mt-4">
                <PairingList
                  pairings={recommendedPairings}
                  selectedPairing={selectedPairing}
                  onSelectPairing={setSelectedPairing}
                />
              </div>
            </div>
          )
        }
        canvas={
          workspaceTab === 'colors' ? (
            <PaletteCanvas
              mode={canvasMode}
              onModeChange={setCanvasMode}
              selectedColors={selectedColors}
              generatedPalette={generatedPalette}
              isLoading={isImageExtracting}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <TypographyPreview
                palette={generatedPalette}
                selectedPairing={selectedPairing}
                variant="canvas"
              />
            </div>
          )
        }
        rightPanel={
          isReviewPhase ? (
            <InspectorPanel
              activeSection={inspectorSection}
              onSectionChange={setInspectorSection}
              accessibilityPanel={<ContrastPanel palette={generatedPalette} variant="embedded" />}
              layoutsPanel={<LayoutsPlaceholder />}
            />
          ) : (
            <ColorSelectionPanel
              catalogSource={catalogSource}
              isExtracting={isImageExtracting}
              colors={paletteCatalog}
              selectedColors={selectedColors}
              onSelectedColorsChange={(colors) => {
                setSelectedColors(colors);
                setError(null);
              }}
            />
          )
        }
      />
    </div>
  );
}
