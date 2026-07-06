'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import {
  buildGeneratedPaletteColumns,
  buildSelectionAwarePaletteColumns,
} from '@lib/color/paletteDisplay';
import { normalizeHex } from '@lib/color/normalizeHex';
import type { SelectableColor } from '@lib/color/selectableColors';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { CollapsibleSection } from '@/components/layout/CollapsibleSection';

type SelectedPaletteColumn = {
  id: string;
  hex: string;
};

interface PalettePreviewProps {
  palette: GeneratedPalette | null;
  sourceColors?: SelectableColor[];
  variant?: 'default' | 'embedded';
  onReplaceColor?: (columnId: string, newHex: string) => string | null;
}

export function PalettePreview({
  palette,
  sourceColors = [],
  variant = 'default',
  onReplaceColor,
}: PalettePreviewProps) {
  const isEmbedded = variant === 'embedded';
  const [selectedColumn, setSelectedColumn] = useState<SelectedPaletteColumn | null>(null);
  const columns = useMemo(() => {
    if (!palette) {
      return [];
    }

    if (sourceColors.length > 0) {
      return buildSelectionAwarePaletteColumns(palette, sourceColors);
    }

    return buildGeneratedPaletteColumns(palette);
  }, [palette, sourceColors]);

  const content =
    palette === null ? (
      <p className="rounded-md border border-dashed border-border bg-surface px-3 py-4 text-center text-[0.75rem] text-muted">
        Aún no hay paleta generada.
      </p>
    ) : (
      <ul className="flex flex-col gap-1">
        {columns.map((column) => (
          <li key={column.id}>
            <button
              type="button"
              onClick={() => setSelectedColumn({ id: column.id, hex: column.hex })}
              className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              <span
                className={`shrink-0 rounded-md border border-border/80 ${
                  isEmbedded ? 'size-7' : 'size-9'
                }`}
                style={{ backgroundColor: column.hex }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="truncate text-[0.8125rem] font-semibold text-ink">
                    {column.name}
                  </span>
                  {column.roleLabel ? (
                    <span className="shrink-0 text-[0.6875rem] font-medium text-muted">
                      {column.roleLabel}
                    </span>
                  ) : null}
                </span>
                <span className="block font-mono text-[0.6875rem] text-muted">
                  {column.hex.toUpperCase()}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  function handleReplaceColor(newHex: string): string | null {
    if (!selectedColumn || !onReplaceColor) {
      return null;
    }

    try {
      if (normalizeHex(newHex) === normalizeHex(selectedColumn.hex)) {
        return null;
      }
    } catch {
      return 'Introduce un código HEX válido.';
    }

    const message = onReplaceColor(selectedColumn.id, newHex);

    try {
      setSelectedColumn({ id: selectedColumn.id, hex: normalizeHex(newHex) });
    } catch {
      setSelectedColumn(null);
    }

    return message;
  }

  const drawer = (
    <ColorDetailsDrawer
      colorHex={selectedColumn?.hex ?? null}
      open={selectedColumn !== null}
      onClose={() => setSelectedColumn(null)}
      onReplaceColor={onReplaceColor ? handleReplaceColor : undefined}
    />
  );

  if (isEmbedded) {
    return (
      <>
        <CollapsibleSection title="Paleta generada" defaultOpen={palette !== null}>
          {content}
        </CollapsibleSection>

        {drawer}
      </>
    );
  }

  return (
    <section
      aria-label="Vista previa de paleta generada"
      className="rounded-lg border border-border bg-bg p-5"
    >
      <h2 className="text-base font-semibold text-ink">Paleta generada</h2>
      <div className="mt-4">{content}</div>

      {drawer}
    </section>
  );
}
