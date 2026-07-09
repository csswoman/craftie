'use client';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { InspirationModal } from '@/components/color/InspirationModal';
import { SelectColorsWorkspaceMain } from '@/components/color/SelectColorsWorkspaceMain';
import { SelectColorsWorkspaceRightPanel } from '@/components/color/SelectColorsWorkspaceRightPanel';
import { SelectColorsWorkspaceSidebar } from '@/components/color/SelectColorsWorkspaceSidebar';
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
          className="mx-4 mt-0 border-b border-fail/20 bg-fail/5 px-3 py-2 text-[0.8125rem] font-medium text-fail lg:mx-5"
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
        onRightPanelCollapsedChange={workspace.setRightPanelCollapsed}
        sidebar={
          <SelectColorsWorkspaceSidebar
            catalogSource={workspace.catalogSource}
            fileName={workspace.imageFileName}
            hasPreview={workspace.imagePreviewUrl !== null}
            isReviewPhase={workspace.isReviewPhase}
            isImageBusy={workspace.isImageBusy}
            imagePreviewUrl={workspace.imagePreviewUrl}
            paletteCatalog={workspace.paletteCatalog}
            onImageFileSelected={workspace.handleImageFileSelected}
            onImageRegenerate={workspace.handleImageRegenerate}
            onOpenInspiration={() => workspace.setInspirationModalOpen(true)}
          />
        }
        main={
          <SelectColorsWorkspaceMain
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            fontPairings={workspace.fontPairings}
            recommendedPairings={workspace.recommendedPairings}
            selectedPairing={workspace.selectedPairing}
            onAddColorByHex={workspace.handleAddColorByHex}
            onSelectPairing={workspace.setSelectedPairing}
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
    <section className="w-full max-w-xl rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mx-auto max-w-md">
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
    </section>
  );
}
