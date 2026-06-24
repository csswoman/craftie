'use client';

import { useState } from 'react';

import { copyHexToClipboard } from '@lib/color/paletteOrder';

export type ColorDetailActionRowProps = {
  hex: string;
  name: string;
  onAdd?: (hex: string) => void;
  canAdd?: boolean;
};

export function ColorDetailActionRow({
  hex,
  name,
  onAdd,
  canAdd = true,
}: ColorDetailActionRowProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const success = await copyHexToClipboard(hex);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-2">
      <span
        className="size-8 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8125rem] font-semibold text-ink">{name}</p>
        <p className="font-mono text-[0.75rem] text-muted">{hex.toUpperCase()}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconActionButton label={copied ? 'Copiado' : 'Copiar HEX'} onClick={() => void handleCopy()}>
          {copied ? '✓' : '#'}
        </IconActionButton>
        {onAdd ? (
          <IconActionButton
            label="Añadir a la paleta"
            disabled={!canAdd}
            onClick={() => onAdd(hex)}
          >
            +
          </IconActionButton>
        ) : null}
      </div>
    </div>
  );
}

function IconActionButton({
  label,
  children,
  disabled = false,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md border border-border bg-bg text-[0.75rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
