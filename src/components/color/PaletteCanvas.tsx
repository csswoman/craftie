'use client';

import { useMemo, useState } from 'react';
import { buildRolePaletteColumnsWithContrast, hasRolePaletteContrastFailure } from '@lib/color/rolePaletteContrast';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isPaletteRoleId, type PaletteRoleId } from '@lib/color/rolePalette';
import type { FontPair } from '@lib/typography/pairings';
import type { AppliedTypography } from '@lib/typography/typeState';
import type { TypeScaleBase, TypeScaleRatio } from '@lib/typography/typeScale';
import type { CanvasViewId } from '@lib/color/canvasViews';
import type { SelectableColor } from '@lib/color/selectableColors';
import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useRolePalette } from '@/context/RolePaletteContext';
import { PaletteView } from './PaletteView';
import { PaletteThemeToggle } from './PaletteThemeToggle';
import { PreviewView } from './PreviewView';
import {
  openRoleColorPopover,
  RoleColorPopover,
  type RoleColorPopoverAnchor,
} from './RoleColorPopover';
import { EmptyCanvas, PaletteCanvasSkeleton } from './PaletteCanvasEmptyStates';
import { PaletteCanvasNotices } from './PaletteCanvasNotices';
import { CanvasSystemView } from './CanvasSystemView';
import { CanvasViewSelector } from './CanvasViewSelector';
import { PaintPaletteCanvas } from './PaintPaletteCanvas';
import { PaletteImageBlock } from './PaletteImageBlock';

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
    activeTheme,
    lockedRoles,
    replaceRole,
    setActiveRole,
    setActiveTheme,
  } = useRolePalette();

  const [activeView, setActiveView] = useState<CanvasViewId>('colors');
  const [activeMode, setActiveMode] = useState<'dashboard' | 'landing' | 'media' | 'analytics'>('dashboard');
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [colorPopover, setColorPopover] = useState<RoleColorPopoverAnchor | null>(null);
  const liveRolePalette = previewRolePalette ?? rolePalette;
  const columns = useMemo(
    () => (liveRolePalette ? buildRolePaletteColumnsWithContrast(liveRolePalette) : []),
    [liveRolePalette],
  );

  const contrastFailure = liveRolePalette ? hasRolePaletteContrastFailure(liveRolePalette) : false;
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const canReplace = editable && rolePalette !== null;
  const hasPalette = columns.length > 0 && liveRolePalette !== null;

  function handleReplaceFromDrawer(newHex: string): string | null {
    if (!selectedColorHex || !rolePalette) {
      return 'No se puede sustituir este color.';
    }

    let normalized: string;

    try {
      normalized = normalizeHex(newHex);
    } catch {
      return 'Introduce un código HEX válido.';
    }

    if (normalizeHex(selectedColorHex) === normalized) {
      return null;
    }

    const role = columns.find((column) => {
      try {
        return normalizeHex(column.hex) === normalizeHex(selectedColorHex);
      } catch {
        return false;
      }
    })?.id;

    if (!role || !isPaletteRoleId(role)) {
      return 'No se puede sustituir este color.';
    }

    if (lockedSet.has(role)) {
      return 'Desbloquea el color para sustituirlo.';
    }

    replaceRole(role, normalized);
    setSelectedColorHex(normalized);
    return null;
  }

  function handleEditRole(role: PaletteRoleId, element: HTMLElement) {
    openRoleColorPopover(role, element, setActiveRole, setColorPopover);
  }

  function handleCloseColorPopover() {
    setColorPopover(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {hasPalette ? (
        <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-3 border-b border-border px-3 py-1.5 sm:min-h-13 sm:px-6">
          <div className="min-w-0">
              <p className="truncate text-chrome-label font-semibold text-ink">Paleta de roles</p>
              <p className="truncate text-chrome-caption text-muted">Edita colores y revisa el contraste.</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5 max-[620px]:ml-0 max-[620px]:w-full max-[620px]:justify-between">
            <CanvasViewSelector
              activeId={activeView}
              palette={columns.map((column) => column.hex)}
              onSelect={(view) => {
                setActiveView(view);
                if (view === 'dashboard' || view === 'landing' || view === 'analytics') setActiveMode(view);
                if (view === 'player') setActiveMode('media');
              }}
            />
            {imagePreviewUrl && onImageFileSelected && onImageRegenerate ? (
              <>
                <span aria-hidden="true" className="h-[30px] w-px bg-line" />
                <PaletteImageBlock
                  previewUrl={imagePreviewUrl}
                  fileName={imageFileName}
                  imageFingerprint={imageFingerprint}
                  isRegenerating={isUpdating}
                  onFileSelected={onImageFileSelected}
                  onRegenerate={onImageRegenerate}
                />
              </>
            ) : null}
          </div>
          <div className="max-[620px]:ml-auto">
            <PaletteThemeToggle activeTheme={activeTheme} onChange={setActiveTheme} />
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {hasPalette ? (
          <PaletteCanvasNotices contrastFailure={contrastFailure} />
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
                <PaintPaletteCanvas colors={paletteCatalog} />
              ) : activeView === 'colors' ? (
                <PaletteView
                  editable={editable}
                  onOpenDetails={setSelectedColorHex}
                  onEditRole={handleEditRole}
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
                  onEditRole={handleEditRole}
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
        onClose={() => setSelectedColorHex(null)}
        onAddColor={!canReplace ? onAddColorByHex : undefined}
        onReplaceColor={canReplace ? handleReplaceFromDrawer : undefined}
      />

      <RoleColorPopover anchor={colorPopover} onClose={handleCloseColorPopover} />
    </div>
  );
}
