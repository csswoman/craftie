'use client';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { InspirationModal } from '@/components/color/InspirationModal';
import { SelectColorsWorkspaceMain } from '@/components/color/SelectColorsWorkspaceMain';
import { SelectColorsWorkspaceRightPanel } from '@/components/color/SelectColorsWorkspaceRightPanel';
import {
  SelectColorsWorkspaceSidebar,
  useSelectColorsWorkspaceToolSections,
} from '@/components/color/SelectColorsWorkspaceSidebar';
import { StudioToolsMobileDock } from '@/components/color/StudioToolsMobileDock';
import { useSelectColorsWorkspaceController } from '@/components/color/useSelectColorsWorkspaceController';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
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
  const hasInspirationSource = workspace.catalogSource !== 'none';
  const toolSectionsInput = {
    catalogSource: workspace.catalogSource,
    fileName: workspace.imageFileName,
    hasPreview: workspace.imagePreviewUrl !== null,
    isReviewPhase: workspace.isReviewPhase,
    isImageBusy: workspace.isImageBusy,
    imagePreviewUrl: workspace.imagePreviewUrl,
    fontPairings: workspace.fontPairings,
    paletteCatalog: workspace.paletteCatalog,
    recommendedPairings: workspace.recommendedPairings,
    selectedPairing: workspace.selectedPairing,
    onImageFileSelected: workspace.handleImageFileSelected,
    onImageRegenerate: workspace.handleImageRegenerate,
    onOpenInspiration: () => workspace.setInspirationModalOpen(true),
    onSelectPairing: workspace.setSelectedPairing,
  };
  const mobileToolSections = useSelectColorsWorkspaceToolSections(toolSectionsInput, 'mobile');
  const inspirationModal = (
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
  );

  const sharedChrome = (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {workspace.statusMessage}
      </div>

      <WorkspaceHeader
        canExport={workspace.isReviewPhase}
        onExportDesignMd={workspace.handleExportDesignMd}
        onExportBrandKit={workspace.handleExportBrandKit}
        shortcutsRef={workspace.shortcutsRef}
      />

      {workspace.error ? (
        <p
          role="alert"
          className="mx-4 mt-0 border-b border-fail/20 bg-fail/5 px-3 py-2 text-chrome-label font-medium text-fail lg:mx-5"
        >
          {workspace.error}
        </p>
      ) : null}
    </>
  );

  if (!hasInspirationSource) {
    return (
      <div className="canvas-dots flex h-dvh flex-col overflow-hidden">
        {sharedChrome}

        <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:p-6">
          <EmptyWorkspaceCard
            fileName={workspace.imageFileName}
            hasPreview={workspace.imagePreviewUrl !== null}
            imagePreviewUrl={workspace.imagePreviewUrl}
            isImageBusy={workspace.isImageBusy}
            onImageFileSelected={workspace.handleImageFileSelected}
            onImageRegenerate={workspace.handleImageRegenerate}
          />
        </div>

        {inspirationModal}
      </div>
    );
  }

  return (
    <div className="canvas-dots flex h-dvh flex-col overflow-hidden">
      {sharedChrome}

      <StudioCanvas
        showRightPanel
        syncRightPanelWithActiveRole
        rightPanelCollapsed={workspace.rightPanelCollapsed}
        onRightPanelCollapsedChange={workspace.setRightPanelCollapsed}
        sidebar={<SelectColorsWorkspaceSidebar {...toolSectionsInput} />}
        mobileToolsDock={<StudioToolsMobileDock sections={mobileToolSections} />}
        main={
          <SelectColorsWorkspaceMain
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            recommendedPairings={workspace.recommendedPairings}
            selectedPairing={workspace.selectedPairing}
            onAddColorByHex={workspace.handleAddColorByHex}
          />
        }
        rightPanel={
          <SelectColorsWorkspaceRightPanel
            catalogSource={workspace.catalogSource}
            isGenerating={workspace.isGenerating}
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            paletteCatalog={workspace.paletteCatalog}
            rightPanelCollapsed={workspace.rightPanelCollapsed}
            onAddColorByHex={workspace.handleAddColorByHex}
            onGenerate={workspace.handleGenerate}
            onRenameColor={workspace.handleRenameColor}
          />
        }
      />

      <StudioStatusBar
        palette={workspace.generatedPalette}
        pairing={workspace.selectedPairing}
        mobileDockOffset
      />

      {inspirationModal}
    </div>
  );
}

function EmptyWorkspaceCard({
  fileName,
  hasPreview,
  imagePreviewUrl,
  isImageBusy,
  onImageFileSelected,
  onImageRegenerate,
}: {
  fileName: string | null;
  hasPreview: boolean;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
}) {
  return (
    <section
      aria-labelledby="workspace-empty-title"
      className="w-full max-w-xl rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <div className="mx-auto max-w-md">
        <h2 id="workspace-empty-title" className="text-chrome-title font-semibold text-ink">
          Empieza con una inspiración
        </h2>
        <p className="prose-measure mt-1 text-chrome-label text-muted">
          Sube una imagen o elige un estilo curado. Craftie extraerá colores y te ayudará a
          asignarlos a los 7 roles de tu marca.
        </p>
        <div className="mt-4">
        <ImageUploader
          fileName={fileName}
          hasPreview={hasPreview}
          isLoading={isImageBusy}
          previewUrl={imagePreviewUrl}
          onFileSelected={onImageFileSelected}
          onRegenerate={onImageRegenerate}
          variant="embedded"
          showHeader={false}
          showDropzone={!hasPreview}
          showChangeImageControl={false}
        />
        </div>
      </div>
    </section>
  );
}
