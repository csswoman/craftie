'use client';

import { useMemo, useState } from 'react';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { ExtractedColor } from '@lib/color/imageTypes';
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
import { useApplyContrastFix } from './useApplyContrastFix';
import { PaletteCanvasToolbar } from './PaletteCanvasToolbar';
import { CanvasVisionFilterDefs, colorVisionStyle } from './CanvasVisionFilter';
import { CanvasSystemView } from './CanvasSystemView';
import { PaintPaletteCanvas } from './PaintPaletteCanvas';
import { TonalScalesView } from './TonalScalesView';
import { ImageColorPicker } from './image-picker/ImageColorPicker';
import { useCanvasColorDetails } from './useCanvasColorDetails';
import { useT } from '@/context/I18nContext';

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
  /** Set when the image colors can be picked by hand; opens the picker from the thumbnail. */
  onImageSourceColorsChange?: (colors: ExtractedColor[]) => void;
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
  onImageSourceColorsChange,
}: PaletteCanvasProps) {
  const t = useT();
  const {
    rolePalette,
    activeTheme,
    setActiveTheme,
    lockedRoles,
    lockedRolesByTheme,
    replaceRole,
    replaceRoles,
    replaceSemanticToken,
  } = useRolePalette();
  const { activeView, activeMode, selectView, visionMode, showAccents, setShowAccents } = useCanvasView();

  const [previewEditMode, setPreviewEditMode] = useState<PreviewEditMode>('locked');
  const isMockupView = !['paint', 'colors', 'style-guide', 'type-scale', 'scales', 'illustration'].includes(activeView);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const { columns, paintColors, contrastReports, hasPalette } = usePaletteCanvasModel(paletteCatalog);
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;
  const contrastFix = useApplyContrastFix({
    activeTheme,
    setActiveTheme,
    replaceRoles,
    lockedRolesByTheme,
  });

  const details = useCanvasColorDetails({ rolePalette, columns, lockedSet, replaceRole, replaceSemanticToken });
  const canPickFromImage = imagePreviewUrl !== null && onImageSourceColorsChange !== undefined;
  const showImagePicker = imagePickerOpen && canPickFromImage;

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
          onToggleAccents={() => setShowAccents(!showAccents)}
          onSelectView={selectView}
          onImageFileSelected={onImageFileSelected}
          onImageRegenerate={onImageRegenerate}
          imagePickerOpen={showImagePicker}
          onToggleImagePicker={canPickFromImage ? () => setImagePickerOpen(!showImagePicker) : undefined}
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {hasPalette ? (
          <PaletteCanvasNotices
            activeTheme={activeTheme}
            reports={contrastReports}
            onApplyFix={canReplace ? contrastFix.applyFix : undefined}
            onApplyAll={canReplace ? contrastFix.applyAll : undefined}
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
              {showImagePicker ? (
                <ImageColorPicker
                  previewUrl={imagePreviewUrl}
                  fileName={imageFileName}
                  onChange={onImageSourceColorsChange}
                  onClose={() => setImagePickerOpen(false)}
                />
              ) : activeView === 'paint' ? (
                <PaintPaletteCanvas colors={paintColors} />
              ) : activeView === 'colors' ? (
                <PaletteView
                  editable={editable}
                  showAccents={showAccents}
                  onOpenRoleDetails={details.openRoleDetails}
                  onOpenAccentDetails={details.openAccentDetails}
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
        colorHex={details.selectedColorHex}
        open={details.selectedColorHex !== null}
        onClose={details.closeDetails}
        onAddColor={!canReplace ? onAddColorByHex : undefined}
        onReplaceColor={canReplace ? details.replaceFromDrawer : undefined}
      />
    </div>
  );
}
