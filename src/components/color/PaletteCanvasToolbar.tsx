'use client';

import type { CanvasViewId } from '@lib/color/canvasViews';

import { CanvasViewSelector } from './CanvasViewSelector';
import { PaletteHistoryControls } from './PaletteHistoryControls';
import { PaletteImageBlock } from './PaletteImageBlock';
import { PaletteRandomizeButton } from './PaletteRandomizeButton';

export function PaletteCanvasToolbar({
  activeView,
  showAccents,
  editable,
  palette,
  imagePreviewUrl,
  imageFileName,
  imageFingerprint,
  isUpdating,
  onToggleAccents,
  onSelectView,
  onImageFileSelected,
  onImageRegenerate,
}: {
  activeView: CanvasViewId;
  showAccents: boolean;
  editable: boolean;
  palette: string[];
  imagePreviewUrl?: string | null;
  imageFileName?: string | null;
  imageFingerprint?: string | null;
  isUpdating: boolean;
  onToggleAccents: () => void;
  onSelectView: (view: CanvasViewId) => void;
  onImageFileSelected?: (file: File) => void;
  onImageRegenerate?: () => void;
}) {
  const accentsActive = activeView === 'colors' && showAccents;
  const showAccentsToggle = activeView === 'colors';

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1 border-b border-line/60 px-2.5 py-3 sm:gap-3 sm:px-6 sm:py-1.5">
      {showAccentsToggle ? (
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-chrome-label font-semibold text-ink">
            {accentsActive ? 'Paleta de acentos' : 'Paleta de roles'}
          </p>
          <p className="truncate text-chrome-caption text-muted">
            {accentsActive
              ? 'El 1 se usa en UI; 2–6 en gráficos.'
              : 'Edita colores y revisa el contraste.'}
          </p>
        </div>
      ) : null}
      {editable ? (
        <>
          <PaletteHistoryControls />
          <PaletteRandomizeButton />
        </>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {showAccentsToggle ? (
          <button
            type="button"
            aria-pressed={accentsActive}
            onClick={onToggleAccents}
            className={`inline-flex h-11 shrink-0 items-center rounded-lg border px-3 text-chrome-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              accentsActive
                ? 'border-[var(--chrome-green)] bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]'
                : 'border-line bg-transparent text-ink hover:bg-surface-raised'
            }`}
          >
            {accentsActive ? 'Ver roles' : 'Ver acentos'}
          </button>
        ) : null}
        <div className="hidden shrink-0 lg:block [&>div]:min-w-0">
          <CanvasViewSelector activeId={activeView} palette={palette} onSelect={onSelectView} />
        </div>
        {imagePreviewUrl && onImageFileSelected && onImageRegenerate ? (
          <>
            <span aria-hidden="true" className="hidden h-[30px] w-px bg-line sm:block" />
            <PaletteImageBlock
              previewUrl={imagePreviewUrl}
              fileName={imageFileName ?? null}
              imageFingerprint={imageFingerprint ?? null}
              isRegenerating={isUpdating}
              onFileSelected={onImageFileSelected}
              onRegenerate={onImageRegenerate}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
