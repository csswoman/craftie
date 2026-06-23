'use client';

import { useMemo } from 'react';

import {
  getColorDetails,
  HARMONY_TYPE_LABELS,
  type ColorDetails,
} from '@lib/color/colorDetails';
import { pickReadableTextColor } from '@lib/color/readableText';

export type ColorDetailsDrawerProps = {
  colorHex: string | null;
  open: boolean;
  onClose: () => void;
};

export function ColorDetailsDrawer({ colorHex, open, onClose }: ColorDetailsDrawerProps) {
  const details = useMemo<ColorDetails | null>(() => {
    if (!open || !colorHex) {
      return null;
    }

    try {
      return getColorDetails(colorHex);
    } catch {
      return null;
    }
  }, [colorHex, open]);

  if (!open || !colorHex || !details) {
    return null;
  }

  const headerText = pickReadableTextColor(details.hex);

  return (
    <div className="fixed inset-0 z-dropdown flex items-end justify-end bg-ink/25 p-4 sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Cerrar detalles del color"
        className="absolute inset-0"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${details.name}`}
        className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-lg"
      >
        <header
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{ backgroundColor: details.hex, color: headerText }}
        >
          <div>
            <p className="text-[0.9375rem] font-semibold">{details.name}</p>
            <p className="font-mono text-[0.8125rem] opacity-90">{details.hex}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-lg leading-none opacity-90 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DrawerSection title="Harmonies">
            <ul className="grid grid-cols-2 gap-2">
              {details.harmonies.map((harmony) => (
                <li key={harmony.type} className="rounded-lg border border-border bg-surface p-2">
                  <p className="text-[0.6875rem] font-semibold text-muted">
                    {HARMONY_TYPE_LABELS[harmony.type]}
                  </p>
                  <ul className="mt-2 flex gap-1">
                    {harmony.colors.map((hex) => (
                      <li key={`${harmony.type}-${hex}`} className="min-w-0 flex-1">
                        <div
                          className="aspect-square rounded-sm border border-border/60"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </DrawerSection>

          <DrawerSection title="Shades">
            <ul className="flex gap-1">
              {details.shades.map((hex) => (
                <li key={hex} className="min-w-0 flex-1">
                  <div
                    className="aspect-[2/5] rounded-sm border border-border/60"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                </li>
              ))}
            </ul>
          </DrawerSection>

          <DrawerSection title="Similar colors">
            <ul className="space-y-2">
              {details.similarColors.map((color) => (
                <li
                  key={color.hex}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span
                    className="size-8 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{color.name}</p>
                    <p className="font-mono text-[0.75rem] text-muted">{color.hex}</p>
                  </div>
                </li>
              ))}
            </ul>
          </DrawerSection>
        </div>
      </aside>
    </div>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-[0.8125rem] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}
