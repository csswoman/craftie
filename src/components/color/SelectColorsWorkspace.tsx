'use client';

import { useEffect, useState } from 'react';

import { DESIGN_STYLES } from '@lib/styles/presets';

import { InspirationModal } from '@/components/color/InspirationModal';
import { SelectColorsWorkspaceMain } from '@/components/color/SelectColorsWorkspaceMain';
import { EmptyWorkspaceCard } from '@/components/color/EmptyWorkspaceCard';
import {
  SelectColorsWorkspaceSidebar,
  useSelectColorsWorkspaceToolSections,
} from '@/components/color/SelectColorsWorkspaceSidebar';
import { StudioToolsMobileDock } from '@/components/color/StudioToolsMobileDock';
import { useSelectColorsWorkspaceController } from '@/components/color/useSelectColorsWorkspaceController';
import { StyleGallery } from '@/components/color-engine/StyleGallery';
import { StudioCanvas } from '@/components/layout/StudioCanvas';
import { StudioFlowGuide } from '@/components/layout/StudioFlowGuide';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import { RolePaletteProvider } from '@/context/RolePaletteContext';
import {
  readFlowGuideDismissed,
  writeFlowGuideDismissed,
} from '@/lib/browser/flowGuideDismiss';

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
  const [flowGuideDismissed, setFlowGuideDismissed] = useState(false);

  useEffect(() => {
    // The flow hint preference lives in localStorage, so it is only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlowGuideDismissed(readFlowGuideDismissed());
  }, []);

  function handleFlowGuideToggle() {
    setFlowGuideDismissed((current) => {
      const next = !current;
      writeFlowGuideDismissed(next);
      return next;
    });
  }

  function handleFlowGuideDismiss() {
    writeFlowGuideDismissed(true);
    setFlowGuideDismissed(true);
  }

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
        canExport={workspace.isReviewPhase}
        flowGuideVisible={hasInspirationSource && !flowGuideDismissed}
        onFlowGuideToggle={hasInspirationSource ? handleFlowGuideToggle : undefined}
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
            onOpenInspiration={() => workspace.setInspirationModalOpen(true)}
          />
        </div>

        {inspirationModal}
      </div>
    );
  }

  return (
    <div className="canvas-dots flex h-dvh flex-col overflow-hidden">
      {sharedChrome}

      {!flowGuideDismissed ? (
        <StudioFlowGuide
          hasGeneratedPalette={workspace.generatedPalette !== null}
          hasSelection={workspace.rolePalette !== null}
          selectionReady={workspace.selectionReady}
          onStepFocus={workspace.handleFlowStepFocus}
          onDismiss={handleFlowGuideDismiss}
        />
      ) : null}

      <StudioCanvas
        sidebar={<SelectColorsWorkspaceSidebar {...toolSectionsInput} />}
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
