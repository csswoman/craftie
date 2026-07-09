'use client';

import { useState } from 'react';

import { copyHexToClipboard } from '@lib/color/paletteOrder';

export type ColorDetailActionRowProps = {
  hex: string;
  name: string;
  onAdd?: (hex: string) => void;
  onReplace?: (hex: string) => void;
  canAdd?: boolean;
  isCurrent?: boolean;
  variant?: 'row' | 'card';
};

export function ColorDetailActionRow({
  hex,
  name,
  onAdd,
  onReplace,
  canAdd = true,
  isCurrent = false,
  variant = 'row',
}: ColorDetailActionRowProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const success = await copyHexToClipboard(hex);

    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  if (variant === 'card') {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg bg-surface-raised/90 p-2">
        <button
          type="button"
          disabled={!onReplace || isCurrent}
          onClick={() => onReplace?.(hex)}
          className={`aspect-square w-full rounded-md ring-1 ring-inset ring-ink/8 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default dark:ring-white/12 ${
            onReplace && !isCurrent
              ? 'cursor-pointer hover:scale-[1.02] hover:ring-primary/40'
              : ''
          } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
          style={{ backgroundColor: hex }}
          aria-label={
            isCurrent
              ? `${name}, color actual`
              : onReplace
                ? `Usar ${name} para sustituir`
                : undefined
          }
        />
        <div className="min-w-0 text-center">
          <p className="truncate text-[0.75rem] font-semibold leading-tight text-ink">{name}</p>
          <p className="font-mono text-chrome-caption leading-tight text-muted">{hex.toUpperCase()}</p>
        </div>
        <div className="flex justify-center gap-1">
          <IconActionButton
            label={copied ? 'Copiado' : 'Copiar HEX'}
            onClick={() => void handleCopy()}
          >
            {copied ? '✓' : '#'}
          </IconActionButton>
          {onReplace ? (
            <IconActionButton
              label={isCurrent ? 'Color actual' : 'Sustituir por este color'}
              disabled={isCurrent}
              onClick={() => onReplace(hex)}
            >
              ↻
            </IconActionButton>
          ) : null}
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

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-raised/90 px-2 py-1.5">
      <button
        type="button"
        disabled={!onReplace || isCurrent}
        onClick={() => onReplace?.(hex)}
        className={`size-7 shrink-0 rounded-md ring-1 ring-inset ring-ink/8 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-default dark:ring-white/12 ${
          onReplace && !isCurrent ? 'cursor-pointer hover:ring-primary/40' : ''
        } ${isCurrent ? 'ring-2 ring-primary/50' : ''}`}
        style={{ backgroundColor: hex }}
        aria-label={
          isCurrent
            ? `${name}, color actual`
            : onReplace
              ? `Usar ${name} para sustituir`
              : undefined
        }
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.75rem] font-semibold leading-tight text-ink">{name}</p>
        <p className="font-mono text-chrome-caption leading-tight text-muted">{hex.toUpperCase()}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconActionButton
          label={copied ? 'Copiado' : 'Copiar HEX'}
          onClick={() => void handleCopy()}
        >
          {copied ? '✓' : '#'}
        </IconActionButton>
        {onReplace ? (
          <IconActionButton
            label={isCurrent ? 'Color actual' : 'Sustituir por este color'}
            disabled={isCurrent}
            onClick={() => onReplace(hex)}
          >
            ↻
          </IconActionButton>
        ) : null}
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
      className="flex size-7 items-center justify-center rounded-md bg-bg/90 text-[0.75rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
