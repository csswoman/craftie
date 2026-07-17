'use client';

import { useMemo, useState } from 'react';
import {
  buildRolePaletteColumnsWithContrast,
  getRolePaletteContrastWarnings,
  hasRolePaletteContrastFailure,
} from '@lib/color/rolePaletteContrast';
import { PALETTE_ROLE_ORDER } from '@lib/color/rolePalette';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { CanvasViewId } from '@lib/color/canvasViews';
import type { SelectableColor } from '@lib/color/selectableColors';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useRolePalette } from '@/context/RolePaletteContext';
import { PaletteView } from './PaletteView';
import { PreviewView } from './PreviewView';
import { EmptyCanvas, PaletteCanvasSkeleton } from './PaletteCanvasEmptyStates';
import { PaletteCanvasNotices } from './PaletteCanvasNotices';
import { PaletteCanvasToolbar } from './PaletteCanvasToolbar';
import { CanvasSystemView } from './CanvasSystemView';
import { PaintPaletteCanvas } from './PaintPaletteCanvas';
import { replacePaletteColorFromDrawer } from './replacePaletteColorFromDrawer';

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
  paletteCatalog = [],
  imagePreviewUrl = null,
  imageFileName = null,
  imageFingerprint = null,
  onImageFileSelected,
  onImageRegenerate,
}: PaletteCanvasProps) {
  const {
    rolePalette,
    previewRolePalette,
    lockedRoles,
    replaceRole,
    replaceSemanticToken,
  } = useRolePalette();

  const [activeView, setActiveView] = useState<CanvasViewId>('colors');
  const [showAccents, setShowAccents] = useState(false);
  const [activeMode, setActiveMode] = useState<'dashboard' | 'landing' | 'media' | 'analytics'>('dashboard');
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [selectedAccentSlot, setSelectedAccentSlot] = useState<number | null>(null);
  const liveRolePalette = previewRolePalette ?? rolePalette;
  const columns = useMemo(
    () => (liveRolePalette ? buildRolePaletteColumnsWithContrast(liveRolePalette) : []),
    [liveRolePalette],
  );
  const paintColors = useMemo<SelectableColor[]>(() => {
    if (liveRolePalette) {
      return PALETTE_ROLE_ORDER.map((role) => ({
        id: `role-${role}`,
        name: liveRolePalette[role].name,
        hex: liveRolePalette[role].hex,
        group: 'bold',
      }));
    }

    return paletteCatalog;
  }, [liveRolePalette, paletteCatalog]);

  const contrastFailure = liveRolePalette ? hasRolePaletteContrastFailure(liveRolePalette) : false;
  const contrastWarnings = liveRolePalette ? getRolePaletteContrastWarnings(liveRolePalette) : [];
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;
  const hasPalette = columns.length > 0 && liveRolePalette !== null;

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
      return 'No se puede sustituir este color.';
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
          onToggleAccents={() => {
            if (activeView !== 'colors') {
              setActiveView('colors');
              setShowAccents(true);
              return;
            }
            setShowAccents((visible) => !visible);
          }}
          onSelectView={(view) => {
            setActiveView(view);
            if (view === 'dashboard' || view === 'landing' || view === 'analytics') setActiveMode(view);
            if (view === 'player') setActiveMode('media');
          }}
          onImageFileSelected={onImageFileSelected}
          onImageRegenerate={onImageRegenerate}
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {hasPalette ? (
          <PaletteCanvasNotices contrastFailure={contrastFailure} warnings={contrastWarnings} />
        ) : null}
        {isLoading && !hasPalette ? (
          <PaletteCanvasSkeleton />
        ) : !hasPalette ? (
          <EmptyCanvas />
        ) : (
          <>
            <div
              id="canvas-panel"
              role="tabpanel"
              aria-label="Vista activa del lienzo"
              tabIndex={0}
              className={`relative flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${
                isUpdating ? 'opacity-60' : 'opacity-100'
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
              ) : activeView === 'style-guide' || activeView === 'type-scale' ? (
                <CanvasSystemView
                  view={activeView}
                  base={typeScaleBase}
                  ratio={typeScaleRatio}
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
