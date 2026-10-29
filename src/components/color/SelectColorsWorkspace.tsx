'use client';

import { useCallback, useState } from 'react';

import { DESIGN_STYLES } from '@lib/styles/presets';
import type { LocalProject } from '@lib/studio/projectModel';

import { ConfirmResetWorkspaceDialog } from '@/components/layout/ConfirmResetWorkspaceDialog';
import { MyProjectsDrawer } from '@/components/projects/MyProjectsDrawer';
import { useLocalProjects } from '@/components/projects/useLocalProjects';
import { InspirationModal } from '@/components/color/InspirationModal';
import { OnboardingHint } from '@/components/color/OnboardingHint';
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
import { CanvasViewProvider, useCanvasView } from '@/context/CanvasViewContext';
import { RolePaletteProvider } from '@/context/RolePaletteContext';

export function SelectColorsWorkspace() {
  return (
    <RolePaletteProvider>
      <CanvasViewProvider>
        <SelectColorsWorkspaceContent />
      </CanvasViewProvider>
    </RolePaletteProvider>
  );
}

function SelectColorsWorkspaceContent() {
  const workspace = useSelectColorsWorkspaceController();
  const hasInspirationSource = workspace.catalogSource !== 'none';
  const projects = useLocalProjects(workspace.getShareSnapshot, hasInspirationSource);
  const { handleOpenProject } = workspace;
  const { setCurrent } = projects;
  const openProject = useCallback(
    (project: LocalProject) => {
      handleOpenProject(project);
      setCurrent(project.id);
    },
    [handleOpenProject, setCurrent],
  );
  const [myProjectsOpen, setMyProjectsOpen] = useState(false);
  const { activeTab, setActiveTab } = useToolsTabState();
  const { selectView } = useCanvasView();
  const handleToolsTabChange = useCallback((tab: 'colors' | 'typography') => {
    setActiveTab(tab);
    selectView(tab === 'typography' ? 'type-scale' : 'colors');
  }, [selectView, setActiveTab]);

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
    onBodyWeightChange: workspace.setBodyWeight,
    typeScaleOverrides: workspace.typeScaleOverrides,
    typographySpacing: workspace.typographySpacing,
    largerTypeScaleSteps: workspace.largerTypeScaleSteps,
    smallerTypeScaleSteps: workspace.smallerTypeScaleSteps,
    onTypeScaleOverridesChange: workspace.setTypeScaleOverrides,
    onTypographySpacingChange: workspace.setTypographySpacing,
    onAddLargerTypeScaleStep: workspace.addLargerTypeScaleStep,
    onAddSmallerTypeScaleStep: workspace.addSmallerTypeScaleStep,
    imagePaletteType: workspace.imagePaletteType,
    paletteTypeOverride: workspace.paletteTypeOverride,
    onPaletteTypeChange: workspace.handlePaletteTypeChange,
    onApplyCustomFont: workspace.applyCustomFont,
    isGenerating: workspace.isGenerating,
    selectionReady: workspace.selectionReady,
    onGenerate: () => {
      if (workspace.handleGenerate()) {
        selectView('style-guide');
      }
    },
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
        projectName={projects.currentProject?.name ?? null}
        saveStatus={projects.saveStatus}
        onCraftieHome={workspace.requestCraftieHome}
        onOpenMyProjects={() => setMyProjectsOpen(true)}
        onExportCss={workspace.handleExportCss}
        onCopyCss={workspace.handleCopyCss}
        onExportTokensJson={workspace.handleExportTokensJson}
        onExportFigmaTokens={workspace.handleExportFigmaTokens}
        onExportDesignMd={workspace.handleExportDesignMd}
        onExportBrandKit={workspace.handleExportBrandKit}
        onExportImage={workspace.handleExportImage}
        onCopyShareLink={workspace.handleCopyShareLink}
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

      <MyProjectsDrawer
        open={myProjectsOpen}
        onClose={() => setMyProjectsOpen(false)}
        projects={projects.projects}
        loading={projects.loading}
        canSave={workspace.selectionReady}
        currentProject={projects.currentProject}
        onSaveAsNew={projects.saveAsNew}
        onRename={projects.rename}
        onDuplicate={projects.duplicate}
        onOpenProject={openProject}
        onDeleteProject={(project) => void projects.deleteProject(project.id)}
      />
    </>
  );

  if (!hasInspirationSource) {
    return (
      <div className="canvas-dots flex h-dvh flex-col overflow-hidden">
        {sharedChrome}

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-8">
          <EmptyWorkspaceCard
            fileName={workspace.imageFileName}
            hasPreview={workspace.imagePreviewUrl !== null}
            imagePreviewUrl={workspace.imagePreviewUrl}
            isImageBusy={workspace.isImageBusy}
            onImageFileSelected={workspace.handleImageFileSelected}
            onImageRegenerate={workspace.handleImageRegenerate}
            onOpenInspiration={() => workspace.setInspirationModalOpen(true)}
            onStartFromHex={workspace.handleStartFromHex}
            recentProjects={projects.projects}
            onOpenProject={openProject}
          />
        </div>

        {inspirationModal}
      </div>
    );
  }

  return (
    <div className="canvas-dots flex min-h-dvh flex-col lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      {sharedChrome}

      {workspace.onboardingHintVisible ? (
        <OnboardingHint onDismiss={workspace.dismissOnboardingHint} />
      ) : null}

      <StudioCanvas
        sidebar={
          <SelectColorsWorkspaceSidebar
            {...toolSectionsInput}
            activeTab={activeTab}
            onActiveTabChange={handleToolsTabChange}
          />
        }
        sidebarHeaderExtra={<ToolsTabToggle activeTab={activeTab} onActiveTabChange={handleToolsTabChange} />}
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
            typeScaleOverrides={workspace.typeScaleOverrides}
            typographySpacing={workspace.typographySpacing}
            largerTypeScaleSteps={workspace.largerTypeScaleSteps}
            smallerTypeScaleSteps={workspace.smallerTypeScaleSteps}
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
