'use client';

import { useMemo, useState } from 'react';

import { buildSelectionPaletteColumns } from '@lib/color/paletteDisplay';
import type { SelectableColor } from '@lib/color/selectableColors';
import { pickReadableTextColor } from '@lib/color/readableText';

import { ColorDetailsDrawer } from '@/components/color-engine/ColorDetailsDrawer';
import { useT, useTx } from '@/context/I18nContext';

export type CurrentPaletteGridProps = {
  colors: SelectableColor[];
};

export function CurrentPaletteGrid({ colors }: CurrentPaletteGridProps) {
  const tx = useTx();
  const t = useT();
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);
  const columns = useMemo(() => buildSelectionPaletteColumns(colors), [colors]);

  return (
    <section aria-label={t('ui.CurrentPaletteGrid.paleta-actual')} className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">{t('ui.CurrentPaletteGrid.paleta-actual')}</h2>

      {columns.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-border bg-bg px-4 py-10 text-center text-[0.9375rem] text-muted">{t('ui.CurrentPaletteGrid.elige-colores-en-los-grupos')}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => {
            const textColor = pickReadableTextColor(column.hex);

            return (
              <li key={column.id}>
                <button
                  type="button"
                  onClick={() => setSelectedColorHex(column.hex)}
                  className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-5 text-center transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                  style={{ backgroundColor: column.hex, color: textColor }}
                >
                  <span className="text-[0.9375rem] font-semibold tracking-[0.01em]">{tx(column.name)}</span>
                  <span className="mt-1 font-mono text-[0.8125rem] font-semibold opacity-95">
                    {column.hex.toUpperCase()}
                  </span>
                  {column.roleLabel ? (
                    <span className="mt-0.5 text-[0.75rem] font-medium opacity-85">{tx(column.roleLabel)}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
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
