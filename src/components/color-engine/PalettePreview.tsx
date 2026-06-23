'use client';

import { useMemo, useState } from 'react';

import type { GeneratedPalette } from '@lib/color/formulas';
import { summarizeOklch } from '@lib/color/formatOklch';
import { buildGeneratedPaletteColumns } from '@lib/color/paletteDisplay';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';

interface PalettePreviewProps {
  palette: GeneratedPalette | null;
  variant?: 'default' | 'embedded';
}

export function PalettePreview({ palette, variant = 'default' }: PalettePreviewProps) {
  const isEmbedded = variant === 'embedded';
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const columns = useMemo(
    () => (palette ? buildGeneratedPaletteColumns(palette) : []),
    [palette],
  );

  return (
    <section
      aria-label="Vista previa de paleta generada"
      className={isEmbedded ? 'space-y-3' : 'rounded-lg border border-border bg-bg p-5'}
    >
      <h2 className="text-base font-semibold text-ink">Paleta generada</h2>

      {palette === null ? (
        <p className="mt-4 rounded-md border border-dashed border-border bg-surface px-4 py-8 text-center text-[0.9375rem] text-muted">
          Aún no hay paleta. Introduce tus semillas y pulsa «Generar paleta».
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {columns.map((column) => (
            <li key={column.id}>
              <button
                type="button"
                onClick={() => setSelectedColorHex(column.hex)}
                className="flex w-full items-center gap-4 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-md border border-border"
                  style={{ backgroundColor: column.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-semibold text-ink">{column.name}</span>
                  <span className="block font-mono text-[0.9375rem] font-semibold text-ink">
                    {column.hex.toUpperCase()}
                  </span>
                  {column.roleLabel ? (
                    <span className="mt-0.5 block text-[0.8125rem] font-medium text-muted">
                      {column.roleLabel}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block text-[0.8125rem] text-muted">
                    {summarizeOklch(column.hex)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ColorDetailsDrawer
        colorHex={selectedColorHex}
        open={selectedColorHex !== null}
        onClose={() => setSelectedColorHex(null)}
      />
    </section>
  );
}
