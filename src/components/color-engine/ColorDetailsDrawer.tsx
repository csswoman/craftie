'use client';

import { useMemo, useState } from 'react';

import {
  getColorDetails,
  getNamedColorShades,
  HARMONY_TYPE_LABELS,
  type ColorDetails,
} from '@lib/color/colorDetails';
import { copyHexToClipboard } from '@lib/color/paletteOrder';
import { nameForHex } from '@lib/color/naming';
import { pickReadableTextColor } from '@lib/color/readableText';

import { ColorDetailActionRow } from './ColorDetailActionRow';

export type ColorDetailsDrawerProps = {
  colorHex: string | null;
  open: boolean;
  onClose: () => void;
  onAddColor?: (hex: string) => string | null;
};

export function ColorDetailsDrawer({
  colorHex,
  open,
  onClose,
  onAddColor,
}: ColorDetailsDrawerProps) {
  const [headerCopied, setHeaderCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  const namedShades = useMemo(
    () => (details ? getNamedColorShades(details.hex, 10) : []),
    [details],
  );

  if (!open || !colorHex || !details) {
    return null;
  }

  const headerText = pickReadableTextColor(details.hex);

  async function handleCopyHeaderHex() {
    const success = await copyHexToClipboard(details!.hex);

    if (success) {
      setHeaderCopied(true);
      window.setTimeout(() => setHeaderCopied(false), 1500);
    }
  }

  function handleAdd(hex: string) {
    const message = onAddColor?.(hex) ?? null;
    setActionMessage(message);
  }

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
          className="flex items-start justify-between gap-3 px-4 py-3"
          style={{ backgroundColor: details.hex, color: headerText }}
        >
          <div className="min-w-0">
            <p className="text-[0.9375rem] font-semibold">{details.name}</p>
            <p className="font-mono text-[0.8125rem] opacity-90">{details.hex}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void handleCopyHeaderHex()}
              aria-label={headerCopied ? 'HEX copiado' : 'Copiar HEX'}
              title={headerCopied ? 'HEX copiado' : 'Copiar HEX'}
              className="rounded-md px-2 py-1 text-[0.75rem] font-semibold opacity-90 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {headerCopied ? 'Copiado' : 'Copiar'}
            </button>
            {onAddColor ? (
              <button
                type="button"
                onClick={() => handleAdd(details.hex)}
                aria-label="Añadir color a la paleta"
                title="Añadir a la paleta"
                className="rounded-md px-2 py-1 text-[0.75rem] font-semibold opacity-90 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Añadir
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-md px-2 py-1 text-lg leading-none opacity-90 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              ×
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DrawerSection title="Harmonies">
            <div className="space-y-3">
              {details.harmonies.map((harmony) => (
                <div key={harmony.type}>
                  <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
                    {HARMONY_TYPE_LABELS[harmony.type]}
                  </p>
                  <ul className="space-y-2">
                    {harmony.colors.map((hex) => (
                      <li key={`${harmony.type}-${hex}`}>
                        <ColorDetailActionRow
                          hex={hex}
                          name={nameForHex(hex, [{ hex }], { style: 'creative' })}
                          onAdd={onAddColor ? handleAdd : undefined}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Shades">
            <ul className="space-y-2">
              {namedShades.map((shade) => (
                <li key={shade.hex}>
                  <ColorDetailActionRow
                    hex={shade.hex}
                    name={shade.name}
                    onAdd={onAddColor ? handleAdd : undefined}
                  />
                </li>
              ))}
            </ul>
          </DrawerSection>

          <DrawerSection title="Similar colors">
            <ul className="space-y-2">
              {details.similarColors.map((color) => (
                <li key={color.hex}>
                  <ColorDetailActionRow
                    hex={color.hex}
                    name={color.name}
                    onAdd={onAddColor ? handleAdd : undefined}
                  />
                </li>
              ))}
            </ul>
          </DrawerSection>
        </div>
        {actionMessage ? (
          <p className="border-t border-border px-4 py-3 text-[0.8125rem] font-medium text-muted" role="status">
            {actionMessage}
          </p>
        ) : null}
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
