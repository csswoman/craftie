'use client';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { InspirationModal } from '@/components/color/InspirationModal';
import { SelectColorsWorkspaceMain } from '@/components/color/SelectColorsWorkspaceMain';
import { SelectColorsWorkspaceRightPanel } from '@/components/color/SelectColorsWorkspaceRightPanel';
import { SelectColorsWorkspaceSidebar } from '@/components/color/SelectColorsWorkspaceSidebar';
import { useSelectColorsWorkspaceController } from '@/components/color/useSelectColorsWorkspaceController';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
import { StudioFlowGuide } from '@/components/layout/StudioFlowGuide';
import { StudioStatusBar } from '@/components/layout/StudioStatusBar';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import { RolePaletteProvider } from '@/context/RolePaletteContext';

export function SelectColorsWorkspace() {
  return (
    <RolePaletteProvider>
      <SelectColorsWorkspaceContent />
    </RolePaletteProvider>
  );
}

function SelectColorsWorkspaceContent() {
  const workspace = useSelectColorsWorkspaceController();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {workspace.statusMessage}
      </div>

      <WorkspaceHeader
        activeView={workspace.studioView}
        onViewChange={workspace.setStudioView}
        canExport={workspace.isReviewPhase}
        onExportDesignMd={workspace.handleExportDesignMd}
        onExportBrandKit={workspace.handleExportBrandKit}
        shortcutsRef={workspace.shortcutsRef}
      />

      {workspace.error ? (
        <p
          role="alert"
          className="mx-4 mt-0 border-b border-fail/20 bg-fail/5 px-3 py-2 text-[0.8125rem] font-medium text-fail lg:mx-5"
        >
          {workspace.error}
        </p>
      ) : null}

      <StudioFlowGuide
        hasGeneratedPalette={workspace.isReviewPhase}
        hasSelection={workspace.rolePalette !== null}
        selectionReady={workspace.selectionReady}
        onStepFocus={workspace.handleFlowStepFocus}
      />

      <StudioCanvas
        showRightPanel
        rightPanelOpen={workspace.rightPanelOpen}
        syncRightPanelWithActiveRole={!workspace.isReviewPhase}
        onRightPanelCollapsedChange={workspace.setRightPanelCollapsed}
        sidebar={
          <SelectColorsWorkspaceSidebar
            generatedPalette={workspace.generatedPalette}
            isReviewPhase={workspace.isReviewPhase}
            recommendedPairings={workspace.recommendedPairings}
            rolePaletteAvailable={workspace.rolePalette !== null}
            selectedPairing={workspace.selectedPairing}
            onAddColorByHex={workspace.handleAddColorByHex}
            onEditSelection={() => workspace.handleFlowStepFocus('adjust')}
            onImageExtractionError={workspace.handleImageExtractionError}
            onImageExtractionStart={workspace.handleImageExtractionStart}
            onImagePaletteExtracted={workspace.handleImagePaletteExtracted}
            onImageRegenerateStart={workspace.handleImageRegenerateStart}
            onOpenInspiration={() => workspace.setInspirationModalOpen(true)}
            onReplacePreviewColor={workspace.handleReplacePreviewColor}
            onSelectPairing={workspace.setSelectedPairing}
          />
        }
        main={
          <SelectColorsWorkspaceMain
            generatedPalette={workspace.generatedPalette}
            studioView={workspace.studioView}
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            selectedPairing={workspace.selectedPairing}
            onAddColorByHex={workspace.handleAddColorByHex}
          />
        }
        rightPanel={
          <SelectColorsWorkspaceRightPanel
            catalogSource={workspace.catalogSource}
            generatedPalette={workspace.generatedPalette}
            inspectorSection={workspace.inspectorSection}
            isGenerating={workspace.isGenerating}
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            isReviewPhase={workspace.isReviewPhase}
            paletteCatalog={workspace.paletteCatalog}
            rightPanelCollapsed={workspace.rightPanelCollapsed}
            selectedPairing={workspace.selectedPairing}
            onAddColorByHex={workspace.handleAddColorByHex}
            onGenerate={workspace.handleGenerate}
            onRenameColor={workspace.handleRenameColor}
            onReplacePreviewColor={workspace.handleReplacePreviewColor}
            onSectionChange={workspace.setInspectorSection}
          />
        }
      />

      <div className="flex shrink-0 items-center justify-end border-t border-border bg-bg px-3 py-2 xl:hidden">
        <button
          type="button"
          onClick={() => workspace.setRightPanelOpen((open) => !open)}
          aria-expanded={workspace.rightPanelOpen}
          className="rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          {workspace.rightPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}
        </button>
      </div>

      <StudioStatusBar palette={workspace.generatedPalette} pairing={workspace.selectedPairing} />

      <InspirationModal
        open={workspace.inspirationModalOpen && !workspace.isReviewPhase}
        onClose={() => workspace.setInspirationModalOpen(false)}
      >
        <StyleGallery
          styles={DESIGN_STYLES}
          selectedStyleId={workspace.selectedStyleId}
          onSelectStyle={workspace.handleSelectStyle}
          variant="embedded"
          showHeader={false}
        />
      </InspirationModal>
    </div>
  );
}
