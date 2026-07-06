'use client';

import { useMemo, useState } from 'react';

import {
  getColorDetails,
  getNamedColorShades,
  HARMONY_TYPE_LABELS,
  type ColorDetails,
} from '@lib/color/colorDetails';
import { copyHexToClipboard } from '@lib/color/paletteOrder';
import { normalizeHex } from '@lib/color/normalizeHex';
import { nameForHex } from '@lib/color/naming';
import { pickReadableTextColor } from '@lib/color/readableText';

import { ColorDetailActionRow } from './ColorDetailActionRow';

export type ColorDetailsDrawerProps = {
  colorHex: string | null;
  open: boolean;
  onClose: () => void;
  onAddColor?: (hex: string) => string | null;
  onReplaceColor?: (hex: string) => string | null;
};

export function ColorDetailsDrawer({
  colorHex,
  open,
  onClose,
  onAddColor,
  onReplaceColor,
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

  function handleReplace(hex: string) {
    const message = onReplaceColor?.(hex) ?? null;
    setActionMessage(message ?? 'Color sustituido.');
  }

  function isCurrentColor(hex: string): boolean {
    if (!colorHex) {
      return false;
    }

    try {
      return normalizeHex(hex) === normalizeHex(colorHex);
    } catch {
      return false;
    }
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-end justify-end bg-ink/20 p-3 sm:items-center sm:justify-center sm:p-4">
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
        className="relative z-10 flex max-h-[min(88vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-float)]"
      >
        <header
          className="flex items-start justify-between gap-2 px-3 py-2.5"
          style={{ backgroundColor: details.hex, color: headerText }}
        >
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-semibold">{details.name}</p>
            <p className="font-mono text-[0.6875rem] opacity-90">{details.hex}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <HeaderAction onClick={() => void handleCopyHeaderHex()}>
              {headerCopied ? 'Copiado' : 'Copiar'}
            </HeaderAction>
            {onAddColor ? (
              <HeaderAction onClick={() => handleAdd(details.hex)}>Añadir</HeaderAction>
            ) : null}
            <HeaderAction onClick={onClose} ariaLabel="Cerrar">
              ×
            </HeaderAction>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <DrawerSection title="Harmonies">
            <div className="space-y-3">
              {details.harmonies.map((harmony) => (
                <div key={harmony.type}>
                  <p className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
                    {HARMONY_TYPE_LABELS[harmony.type]}
                  </p>
                  <ul className="flex gap-2">
                    {harmony.colors.map((hex) => (
                      <li key={`${harmony.type}-${hex}`} className="min-w-0 flex-1">
                        <ColorDetailActionRow
                          variant="card"
                          hex={hex}
                          name={nameForHex(hex, [{ hex }], { style: 'creative' })}
                          onAdd={onAddColor && !onReplaceColor ? handleAdd : undefined}
                          onReplace={onReplaceColor ? handleReplace : undefined}
                          isCurrent={isCurrentColor(hex)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Shades">
            <ul className="grid grid-cols-2 gap-1.5">
              {namedShades.map((shade) => (
                <li key={shade.hex}>
                  <ColorDetailActionRow
                    hex={shade.hex}
                    name={shade.name}
                    onAdd={onAddColor && !onReplaceColor ? handleAdd : undefined}
                    onReplace={onReplaceColor ? handleReplace : undefined}
                    isCurrent={isCurrentColor(shade.hex)}
                  />
                </li>
              ))}
            </ul>
          </DrawerSection>

          <DrawerSection title="Similar colors">
            <ul className="grid grid-cols-2 gap-1.5">
              {details.similarColors.map((color) => (
                <li key={color.hex}>
                  <ColorDetailActionRow
                    hex={color.hex}
                    name={color.name}
                    onAdd={onAddColor && !onReplaceColor ? handleAdd : undefined}
                    onReplace={onReplaceColor ? handleReplace : undefined}
                    isCurrent={isCurrentColor(color.hex)}
                  />
                </li>
              ))}
            </ul>
          </DrawerSection>
        </div>
        {actionMessage ? (
          <p
            className="border-t border-white/8 px-3 py-2 text-[0.75rem] font-medium text-muted dark:border-white/8"
            role="status"
          >
            {actionMessage}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function HeaderAction({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof children === 'string' ? children : undefined)}
      className="rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold opacity-90 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {children}
    </button>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3.5 last:mb-0">
      <h3 className="mb-1.5 text-[0.75rem] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}
