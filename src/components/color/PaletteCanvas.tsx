'use client';

import { useMemo } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import {
  buildGeneratedPaletteColumns,
  buildSelectionPaletteColumns,
} from '@lib/color/paletteDisplay';
import type { SelectableColor } from '@lib/color/selectableColors';
import { pickReadableTextColor } from '@lib/color/readableText';

export type PaletteCanvasMode = 'selection' | 'generated';

export type PaletteCanvasProps = {
  mode: PaletteCanvasMode;
  onModeChange: (mode: PaletteCanvasMode) => void;
  selectedColors: SelectableColor[];
  generatedPalette: GeneratedPalette | null;
  isLoading?: boolean;
};

export function PaletteCanvas({
  mode,
  onModeChange,
  selectedColors,
  generatedPalette,
  isLoading = false,
}: PaletteCanvasProps) {
  const canShowGenerated = generatedPalette !== null;
  const activeMode = mode === 'generated' && canShowGenerated ? 'generated' : 'selection';

  const columns = useMemo(() => {
    if (activeMode === 'generated' && generatedPalette) {
      return buildGeneratedPaletteColumns(generatedPalette);
    }

    return buildSelectionPaletteColumns(selectedColors);
  }, [activeMode, generatedPalette, selectedColors]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-[0.8125rem] font-medium text-muted">
          {isLoading
            ? 'Extrayendo colores…'
            : columns.length === 0
              ? 'Elige colores para ver tu paleta'
              : `${columns.length} color${columns.length === 1 ? '' : 'es'}`}
        </p>

        {canShowGenerated ? (
          <div
            role="group"
            aria-label="Vista de paleta"
            className="flex rounded-md border border-border bg-surface p-0.5"
          >
            <ModeToggle
              label="Selección"
              active={activeMode === 'selection'}
              onClick={() => onModeChange('selection')}
            />
            <ModeToggle
              label="Generada"
              active={activeMode === 'generated'}
              onClick={() => onModeChange('generated')}
            />
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1">
        {isLoading ? (
          <PaletteCanvasSkeleton count={6} />
        ) : columns.length === 0 ? (
          <EmptyCanvas />
        ) : (
          <ul className="flex h-full min-h-[320px]">
            {columns.map((column) => {
              const textColor = pickReadableTextColor(column.hex);

              return (
                <li key={column.id} className="flex min-w-0 flex-1">
                  <article
                    className="group relative flex w-full flex-col justify-end px-3 pb-5 pt-8"
                    style={{ backgroundColor: column.hex, color: textColor }}
                  >
                    <div className="mt-auto space-y-1">
                      <p className="text-[clamp(0.8125rem,1.8vw,1.125rem)] font-semibold tracking-[0.01em]">
                        {column.name}
                      </p>
                      <p className="font-mono text-[clamp(0.75rem,1.6vw,1rem)] font-semibold tracking-wide opacity-95">
                        {column.hex.toUpperCase()}
                      </p>
                      {column.roleLabel ? (
                        <p className="text-[0.75rem] font-medium opacity-80">{column.roleLabel}</p>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ModeToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[6px] px-2.5 py-1 text-[0.75rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active ? 'bg-bg text-ink shadow-sm' : 'text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyCanvas() {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center bg-surface-raised/40 px-6">
      <p className="max-w-xs text-center text-[0.9375rem] leading-relaxed text-muted">
        Tu paleta aparecerá aquí en columnas a pantalla completa. Sube una imagen a la izquierda
        y ajusta los colores en el panel derecho.
      </p>
    </div>
  );
}

function PaletteCanvasSkeleton({ count }: { count: number }) {
  return (
    <ul className="flex h-full min-h-[320px]" aria-busy="true" aria-label="Cargando paleta">
      {Array.from({ length: count }).map((_, index) => (
        <li key={`skeleton-${index}`} className="flex min-w-0 flex-1">
          <div className="w-full animate-pulse bg-surface-raised" />
        </li>
      ))}
    </ul>
  );
}
