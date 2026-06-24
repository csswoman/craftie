'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import {
  buildGeneratedPaletteColumns,
  buildSelectionPaletteColumns,
} from '@lib/color/paletteDisplay';
import { getInsertableCatalogColors, insertSelectedColor, moveSelectedColor } from '@lib/color/paletteOrder';
import type { SelectableColor } from '@lib/color/selectableColors';
import { SELECTABLE_COLORS } from '@lib/color/selectableColors';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';

import { PaletteAddGap } from './PaletteAddGap';
import { PaletteColumn } from './PaletteColumn';

export type PaletteCanvasMode = 'selection' | 'generated';

export type PaletteCanvasProps = {
  mode: PaletteCanvasMode;
  onModeChange: (mode: PaletteCanvasMode) => void;
  selectedColors: SelectableColor[];
  generatedPalette: GeneratedPalette | null;
  isLoading?: boolean;
  catalog?: SelectableColor[];
  lockedIds?: string[];
  editable?: boolean;
  onSelectedColorsChange?: (colors: SelectableColor[]) => void;
  onReplaceColor?: (colorId: string, newHex: string) => void;
  onAddColorByHex?: (hex: string, customName?: string) => string | null;
  onToggleLock?: (colorId: string) => void;
};

export function PaletteCanvas({
  mode,
  onModeChange,
  selectedColors,
  generatedPalette,
  isLoading = false,
  catalog = SELECTABLE_COLORS,
  lockedIds = [],
  editable = false,
  onSelectedColorsChange,
  onReplaceColor,
  onAddColorByHex,
  onToggleLock,
}: PaletteCanvasProps) {
  const [shadesOpenId, setShadesOpenId] = useState<string | null>(null);
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const canShowGenerated = generatedPalette !== null;
  const activeMode = mode === 'generated' && canShowGenerated ? 'generated' : 'selection';
  const isEditable = editable && activeMode === 'selection';

  const columns = useMemo(() => {
    if (activeMode === 'generated' && generatedPalette) {
      return buildGeneratedPaletteColumns(generatedPalette);
    }

    return buildSelectionPaletteColumns(selectedColors);
  }, [activeMode, generatedPalette, selectedColors]);

  const insertOptions = useMemo(
    () => getInsertableCatalogColors(catalog, selectedColors),
    [catalog, selectedColors],
  );

  const lockedSet = useMemo(() => new Set(lockedIds), [lockedIds]);

  function handleMove(fromIndex: number, toIndex: number) {
    if (!onSelectedColorsChange || !isEditable) {
      return;
    }

    const moved = moveSelectedColor(selectedColors, fromIndex, toIndex);
    onSelectedColorsChange(moved);
  }

  function handleInsert(index: number, color: SelectableColor) {
    if (!onSelectedColorsChange || !isEditable) {
      return;
    }

    const next = insertSelectedColor(selectedColors, index, color);

    if (next) {
      onSelectedColorsChange(next);
    }
  }

  function handleApplyShade(colorId: string, newHex: string) {
    if (!isEditable || lockedSet.has(colorId)) {
      return;
    }

    if (onReplaceColor) {
      onReplaceColor(colorId, newHex);
      setShadesOpenId(null);
      return;
    }

    if (!onSelectedColorsChange) {
      return;
    }

    setShadesOpenId(null);
  }

  async function handleCopyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      setCopyMessage('HEX copiado');
      window.setTimeout(() => setCopyMessage(null), 1500);
    } catch {
      setCopyMessage('No se pudo copiar');
      window.setTimeout(() => setCopyMessage(null), 1500);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-[0.8125rem] font-medium text-muted">
          {copyMessage ??
            (isLoading
              ? 'Extrayendo colores…'
              : columns.length === 0
                ? 'Elige colores para ver tu paleta'
                : `${columns.length} color${columns.length === 1 ? '' : 'es'}`)}
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
            {columns.map((column, index) => (
              <li key={column.id} className="group/column-wrap relative flex min-w-0 flex-1">
                <PaletteColumn
                  column={column}
                  index={index}
                  total={columns.length}
                  locked={lockedSet.has(column.id)}
                  showShades={shadesOpenId === column.id}
                  editable={isEditable}
                  onToggleLock={() => onToggleLock?.(column.id)}
                  onMoveLeft={() => handleMove(index, index - 1)}
                  onMoveRight={() => handleMove(index, index + 1)}
                  onCopyHex={() => void handleCopyHex(column.hex)}
                  onToggleShades={() =>
                    setShadesOpenId((current) => (current === column.id ? null : column.id))
                  }
                  onOpenInfo={() => setSelectedColorHex(column.hex)}
                  onSelectColor={setSelectedColorHex}
                  onApplyShade={(newHex) => handleApplyShade(column.id, newHex)}
                />
                {isEditable && index < columns.length - 1 ? (
                  <PaletteAddGap
                    insertIndex={index + 1}
                    options={insertOptions}
                    onInsert={handleInsert}
                    className="pointer-events-none absolute right-0 top-1/2 h-0 w-0"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={() => setSelectedColorHex(null)}
        onAddColor={onAddColorByHex}
      />
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
        active ? 'bg-bg text-ink' : 'text-muted hover:text-ink'
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
