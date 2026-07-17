'use client';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { ConfirmResetWorkspaceDialog } from '@/components/layout/ConfirmResetWorkspaceDialog';
import { InspirationModal } from '@/components/color/InspirationModal';
import { SelectColorsWorkspaceMain } from '@/components/color/SelectColorsWorkspaceMain';
import { EmptyWorkspaceCard } from '@/components/color/EmptyWorkspaceCard';
import {
  SelectColorsWorkspaceSidebar,
  ToolsTabToggle,
  useSelectColorsWorkspaceToolSections,
  useToolsTabState,
} from '@/components/color/SelectColorsWorkspaceSidebar';
import { StudioToolsMobileDock } from '@/components/color/StudioToolsMobileDock';
import { useSelectColorsWorkspaceController } from '@/components/color/useSelectColorsWorkspaceController';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
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
  const { activeTab, setActiveTab } = useToolsTabState();

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
    appliedTypography: workspace.appliedTypography,
    selectedCatalogPairId: workspace.selectedCatalogPairId,
    pinHeading: workspace.pinHeading,
    pinBody: workspace.pinBody,
    typeScaleBase: workspace.typeScaleBase,
    typeScaleRatio: workspace.typeScaleRatio,
    onImageFileSelected: workspace.handleImageFileSelected,
    onImageRegenerate: workspace.handleImageRegenerate,
    onOpenInspiration: () => workspace.setInspirationModalOpen(true),
    onSelectPairing: workspace.setSelectedPairing,
    onPreviewPairing: workspace.previewPairing,
    onClearPreview: workspace.clearTypePreview,
    onTogglePinHeading: workspace.togglePinHeading,
    onTogglePinBody: workspace.togglePinBody,
    onTypeScaleBaseChange: workspace.setTypeScaleBase,
    onTypeScaleRatioChange: workspace.setTypeScaleRatio,
    onHeadingWeightChange: workspace.setHeadingWeight,
    customFonts: workspace.customFonts,
    imagePaletteType: workspace.imagePaletteType,
    paletteTypeOverride: workspace.paletteTypeOverride,
    onPaletteTypeChange: workspace.handlePaletteTypeChange,
    onApplyCustomFont: workspace.applyCustomFont,
    isGenerating: workspace.isGenerating,
    selectionReady: workspace.selectionReady,
    onGenerate: workspace.handleGenerate,
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
        canExport={workspace.canExport}
        exportBlockedReason={workspace.exportBlockedReason}
        onCraftieHome={workspace.requestCraftieHome}
        onExportCss={workspace.handleExportCss}
        onExportTokensJson={workspace.handleExportTokensJson}
        onExportFigmaTokens={workspace.handleExportFigmaTokens}
        onExportDesignMd={workspace.handleExportDesignMd}
        onExportBrandKit={workspace.handleExportBrandKit}
      />

      {workspace.error ? (
        <p
          role="alert"
          className="mx-4 mt-0 border-b border-fail/20 bg-fail/5 px-3 py-2 text-chrome-label font-medium text-fail lg:mx-5"
        >
          {workspace.error}
        </p>
      ) : null}

      <ConfirmResetWorkspaceDialog
        open={workspace.resetConfirmOpen}
        onCancel={workspace.cancelResetWorkspace}
        onConfirm={workspace.confirmResetWorkspace}
      />
    </>
  );

  if (!hasInspirationSource) {
    return (
      <div className="canvas-dots flex h-dvh flex-col overflow-hidden">
        {sharedChrome}

        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <EmptyWorkspaceCard
            fileName={workspace.imageFileName}
            hasPreview={workspace.imagePreviewUrl !== null}
            imagePreviewUrl={workspace.imagePreviewUrl}
            isImageBusy={workspace.isImageBusy}
            onImageFileSelected={workspace.handleImageFileSelected}
            onImageRegenerate={workspace.handleImageRegenerate}
            onOpenInspiration={() => workspace.setInspirationModalOpen(true)}
          />
        </div>

        {inspirationModal}
      </div>
    );
  }

  return (
    <div className="canvas-dots flex min-h-dvh flex-col xl:h-dvh xl:min-h-0 xl:overflow-hidden">
      {sharedChrome}

      <StudioCanvas
        sidebar={
          <SelectColorsWorkspaceSidebar
            {...toolSectionsInput}
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
          />
        }
        sidebarHeaderExtra={<ToolsTabToggle activeTab={activeTab} onActiveTabChange={setActiveTab} />}
        mobileToolsDock={<StudioToolsMobileDock sections={mobileToolSections} />}
        main={
          <SelectColorsWorkspaceMain
            isImageExtracting={workspace.isImageExtracting}
            isImageRegenerating={workspace.isImageRegenerating}
            recommendedPairings={workspace.recommendedPairings}
            selectedPairing={workspace.selectedPairing}
            appliedTypography={workspace.appliedTypography}
            hoveredPairing={workspace.hoveredPairing}
            isTypePreviewing={workspace.isTypePreviewing}
            typeScaleBase={workspace.typeScaleBase}
            typeScaleRatio={workspace.typeScaleRatio}
            onAddColorByHex={workspace.handleAddColorByHex}
            paletteCatalog={workspace.paletteCatalog}
            imagePreviewUrl={workspace.imagePreviewUrl}
            imageFileName={workspace.imageFileName}
            imageFingerprint={workspace.imageFingerprint}
            onImageFileSelected={workspace.handleImageFileSelected}
            onImageRegenerate={workspace.handleImageRegenerate}
          />
        }
      />

      {inspirationModal}
    </div>
  );
}
