'use client';

import type { CanvasViewId } from '@lib/color/canvasViews';

import { CanvasViewSelector } from './CanvasViewSelector';
import { PaletteHistoryControls } from './PaletteHistoryControls';
import { PaletteImageBlock } from './PaletteImageBlock';

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

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line/60 px-4 py-3 sm:min-h-13 sm:gap-3 sm:px-6 sm:py-1.5">
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
      {editable ? <PaletteHistoryControls /> : null}
      <button
        type="button"
        aria-pressed={accentsActive}
        onClick={onToggleAccents}
        className={`min-h-10 rounded-lg border px-3 text-[0.86rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
          accentsActive
            ? 'border-[var(--chrome-green)] bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]'
            : 'border-border bg-bg text-muted hover:bg-surface-raised hover:text-ink'
        }`}
      >
        {accentsActive ? 'Ver roles' : 'Ver acentos'}
      </button>
      <div className="flex w-full flex-wrap items-center gap-2.5 sm:ml-auto sm:w-auto sm:gap-2.5">
        <CanvasViewSelector activeId={activeView} palette={palette} onSelect={onSelectView} />
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
