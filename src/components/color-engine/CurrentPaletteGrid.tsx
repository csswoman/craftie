'use client';

import type { SelectableColor } from '@lib/color/selectableColors';
import { pickReadableTextColor } from '@lib/color/readableText';

export type CurrentPaletteGridProps = {
  colors: SelectableColor[];
};

export function CurrentPaletteGrid({ colors }: CurrentPaletteGridProps) {
  return (
    <section aria-label="Paleta actual" className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">Paleta actual</h2>

      {colors.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-border bg-bg px-4 py-10 text-center text-[0.9375rem] text-muted">
          Elige colores en los grupos de la izquierda para construir tu paleta.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((color) => {
            const textColor = pickReadableTextColor(color.hex);

            return (
              <li key={color.id}>
                <article
                  className="flex min-h-28 items-center justify-center rounded-lg px-4 py-6 text-center"
                  style={{ backgroundColor: color.hex, color: textColor }}
                >
                  <h3 className="text-[0.9375rem] font-semibold tracking-[0.01em]">{color.name}</h3>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
