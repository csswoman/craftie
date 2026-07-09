'use client';

import { useMemo } from 'react';

import { buildRolePaletteColumns } from '@lib/color/paletteDisplay';
import { pickReadableTextColor } from '@lib/color/readableText';
import type { RolePalette } from '@lib/color/rolePalette';

export type SelectionPaletteStripProps = {
  rolePalette: RolePalette;
};

export function SelectionPaletteStrip({ rolePalette }: SelectionPaletteStripProps) {
  const columns = useMemo(() => buildRolePaletteColumns(rolePalette), [rolePalette]);

  return (
    <section aria-label="Paleta por roles">
      <p className="text-chrome-caption font-semibold text-muted">7 roles asignados</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {columns.map((column) => {
          const textColor = pickReadableTextColor(column.hex);

          return (
            <li key={column.id} className="min-w-[calc(50%-0.375rem)] flex-1 basis-[calc(50%-0.375rem)]">
              <div
                className="flex w-full flex-col items-center rounded-md px-2 py-2 text-center ring-1 ring-inset ring-ink/8 dark:ring-white/12"
                style={{ backgroundColor: column.hex, color: textColor }}
                title={`${column.roleLabel ?? column.name} · ${column.hex}`}
              >
                <span className="w-full truncate text-chrome-caption font-semibold">
                  {column.roleLabel ?? column.name}
                </span>
                <span className="font-mono text-chrome-caption opacity-85">{column.hex.slice(1)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
