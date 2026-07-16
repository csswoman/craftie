'use client';

import { useMemo } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import { resolvePaletteDisplayNames } from '@lib/color/paletteDisplay';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokens } from '@lib/color/semanticTokens';
import { rolesBySourceHex } from '@lib/color/uiColorPanel';

export function UiSourceColorGrid({
  colors,
  tokens,
  onOpen,
}: {
  colors: SelectableColor[];
  tokens: SemanticTokens;
  onOpen: () => void;
}) {
  const uniqueColors = useMemo(() => uniqueByHex(colors), [colors]);
  const names = useMemo(() => resolvePaletteDisplayNames(uniqueColors), [uniqueColors]);
  const roleIndex = useMemo(() => rolesBySourceHex(tokens), [tokens]);

  return (
    <>
      <div className="grid grid-cols-6 gap-x-2 gap-y-2.5" aria-label="Colores extraídos">
        {uniqueColors.map((color) => {
          const hex = normalizeHex(color.hex);
          const name = names.get(color.id) ?? color.name;
          const assigned = (roleIndex.get(hex)?.length ?? 0) > 0;

          return (
            <button
              key={color.id}
              type="button"
              onClick={onOpen}
              title={`${name} · ${hex.toUpperCase()}`}
              aria-label={`${name}, ${hex}${assigned ? ', asignado' : ', disponible'}`}
              className="relative aspect-square rounded-full ring-1 ring-inset ring-ink/10 transition duration-200 hover:scale-110 hover:shadow-[0_4px_12px_rgb(15_43_30_/_0.18)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/30 motion-reduce:transition-none"
              style={{ backgroundColor: hex }}
            >
              {assigned ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.75)]"
                >✓</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 min-h-10 text-left text-tools-body-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
        Ver detalle y asignar ›
      </button>
    </>
  );
}

function uniqueByHex(colors: SelectableColor[]): SelectableColor[] {
  const seen = new Set<string>();
  return colors.filter((color) => {
    const hex = normalizeHex(color.hex);
    if (seen.has(hex)) return false;
    seen.add(hex);
    return true;
  });
}
