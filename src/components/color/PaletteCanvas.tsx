'use client';

import { useMemo, useState } from 'react';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SizeOverrides } from '@/components/font-pairing/FineTuneSizes';
import type { TypographySpacing } from '@/components/font-pairing/SpacingControls';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useCanvasView } from '@/context/CanvasViewContext';
import { useRolePalette } from '@/context/RolePaletteContext';
import { PaletteView } from './PaletteView';
import type { PreviewEditMode } from './PreviewEditModeToggle';
import { PreviewView } from './PreviewView';
import { EmptyCanvas, PaletteCanvasSkeleton } from './PaletteCanvasEmptyStates';
import { PaletteCanvasNotices } from './PaletteCanvasNotices';
import { usePaletteCanvasModel } from './usePaletteCanvasModel';
import { PaletteCanvasToolbar } from './PaletteCanvasToolbar';
import { CanvasVisionFilterDefs, colorVisionStyle } from './CanvasVisionFilter';
import { CanvasSystemView } from './CanvasSystemView';
import { PaintPaletteCanvas } from './PaintPaletteCanvas';
import { TonalScalesView } from './TonalScalesView';
import { replacePaletteColorFromDrawer } from './replacePaletteColorFromDrawer';
import { useT, useTx } from '@/context/I18nContext';

export type PaletteCanvasProps = {
  isLoading?: boolean;
  isUpdating?: boolean;
  editable?: boolean;
  onAddColorByHex?: (hex: string, customName?: string) => string | null;
  recommendedPairings?: FontPair[];
  selectedPairing?: FontPair | null;
  appliedTypography?: AppliedTypography;
  hoveredPairing?: FontPair | null;
  isTypePreviewing?: boolean;
  typeScaleBase?: TypeScaleBase;
  typeScaleRatio?: TypeScaleRatio;
  typeScaleOverrides?: SizeOverrides;
  typographySpacing?: TypographySpacing;
  largerTypeScaleSteps?: number;
  smallerTypeScaleSteps?: number;
  paletteCatalog?: SelectableColor[];
  imagePreviewUrl?: string | null;
  imageFileName?: string | null;
  imageFingerprint?: string | null;
  onImageFileSelected?: (file: File) => void;
  onImageRegenerate?: () => void;
};

export function PaletteCanvas({
  isLoading = false,
  isUpdating = false,
  editable = false,
  onAddColorByHex,
  recommendedPairings = [],
  selectedPairing = null,
  appliedTypography,
  hoveredPairing = null,
  isTypePreviewing = false,
  typeScaleBase = 16,
  typeScaleRatio = 1.25,
  typeScaleOverrides = {},
  typographySpacing = { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
  largerTypeScaleSteps = 0,
  smallerTypeScaleSteps = 0,
  paletteCatalog = [],
  imagePreviewUrl = null,
  imageFileName = null,
  imageFingerprint = null,
  onImageFileSelected,
  onImageRegenerate,
}: PaletteCanvasProps) {
  const tx = useTx();
  const t = useT();
  const {
    rolePalette,
    activeTheme,
    setActiveTheme,
    lockedRoles,
    replaceRole,
    replaceSemanticToken,
  } = useRolePalette();
  const { activeView, activeMode, selectView, visionMode } = useCanvasView();

  const [showAccents, setShowAccents] = useState(false);
  const [previewEditMode, setPreviewEditMode] = useState<PreviewEditMode>('locked');
  const isMockupView = !['paint', 'colors', 'style-guide', 'type-scale', 'scales', 'illustration'].includes(activeView);
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [selectedAccentSlot, setSelectedAccentSlot] = useState<number | null>(null);
  const { columns, paintColors, contrastReports, hasPalette } = usePaletteCanvasModel(paletteCatalog);
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;

  function handleOpenRoleDetails(hex: string) {
    setSelectedAccentSlot(null);
    setSelectedColorHex(hex);
  }

  function handleOpenAccentDetails(hex: string, slotIndex: number) {
    setSelectedAccentSlot(slotIndex);
    setSelectedColorHex(hex);
  }

  function handleCloseDetails() {
    setSelectedColorHex(null);
    setSelectedAccentSlot(null);
  }

  function handleReplaceFromDrawer(newHex: string): string | null {
    if (!rolePalette) {
      return tx('No se puede sustituir este color.');
    }

    return replacePaletteColorFromDrawer({
      newHex,
      selectedColorHex,
      selectedAccentSlot,
      columns,
      lockedSet,
      replaceRole,
      replaceSemanticToken,
      setSelectedColorHex,
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasPalette ? (
        <PaletteCanvasToolbar
          activeView={activeView}
          showAccents={showAccents}
          editable={editable}
          palette={columns.map((column) => column.hex)}
          imagePreviewUrl={imagePreviewUrl}
          imageFileName={imageFileName}
          imageFingerprint={imageFingerprint}
          isUpdating={isUpdating}
          previewEditMode={isMockupView ? previewEditMode : undefined}
          onPreviewEditModeChange={setPreviewEditMode}
          onToggleAccents={() => setShowAccents((visible) => !visible)}
          onSelectView={selectView}
          onImageFileSelected={onImageFileSelected}
          onImageRegenerate={onImageRegenerate}
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {hasPalette ? (
          <PaletteCanvasNotices
            activeTheme={activeTheme}
            reports={contrastReports}
            onSwitchTheme={setActiveTheme}
          />
        ) : null}
        {isLoading && !hasPalette ? (
          <PaletteCanvasSkeleton />
        ) : !hasPalette ? (
          <EmptyCanvas />
        ) : (
          <>
            <CanvasVisionFilterDefs mode={visionMode} />
            <div
              id="canvas-panel"
              role="tabpanel"
              aria-label={t('ui.PaletteCanvas.vista-activa-del-lienzo')}
              tabIndex={0}
              style={colorVisionStyle(visionMode)}
              className={`relative flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${isUpdating ? 'opacity-60' : 'opacity-100'
                }`}
            >
              {activeView === 'paint' ? (
                <PaintPaletteCanvas colors={paintColors} />
              ) : activeView === 'colors' ? (
                <PaletteView
                  editable={editable}
                  showAccents={showAccents}
                  onOpenRoleDetails={handleOpenRoleDetails}
                  onOpenAccentDetails={handleOpenAccentDetails}
                />
              ) : activeView === 'scales' ? (
                <TonalScalesView />
              ) : activeView === 'style-guide' || activeView === 'type-scale' ? (
                <CanvasSystemView
                  view={activeView}
                  base={typeScaleBase}
                  ratio={typeScaleRatio}
                  overrides={typeScaleOverrides}
                  spacing={typographySpacing}
                  largerSteps={largerTypeScaleSteps}
                  smallerSteps={smallerTypeScaleSteps}
                  selectedPairing={selectedPairing}
                  appliedTypography={appliedTypography}
                  recommendedPairings={recommendedPairings}
                />
              ) : (
                <PreviewView
                  recommendedPairings={recommendedPairings}
                  selectedPairing={selectedPairing}
                  hoveredPairing={hoveredPairing}
                  isTypePreviewing={isTypePreviewing}
                  typeScaleBase={typeScaleBase}
                  typeScaleRatio={typeScaleRatio}
                  activeMode={activeMode}
                  activeFamily={activeView === 'illustration' ? 'illustration' : 'ui'}
                  editMode={previewEditMode}
                />
              )}
            </div>
            {isUpdating ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-bg/20"
              />
            ) : null}
          </>
        )}
      </div>

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={handleCloseDetails}
        onAddColor={!canReplace ? onAddColorByHex : undefined}
        onReplaceColor={canReplace ? handleReplaceFromDrawer : undefined}
      />
    </div>
  );
}
