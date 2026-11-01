'use client';

import { useState } from 'react';

import { copyHexToClipboard } from '@lib/color/paletteOrder';
import { useT, useTx } from '@/context/I18nContext';

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
  const tx = useTx();
  const t = useT();
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
              ? t('ui.ColorDetailActionRow.color-actual', { name: tx(name) })
              : onReplace
                ? t('ui.ColorDetailActionRow.usar-para-sustituir', { name: tx(name) })
                : undefined
          }
        />
        <div className="min-w-0 text-center">
          <p className="truncate text-[0.75rem] font-semibold leading-tight text-ink">{tx(name)}</p>
          <p className="font-mono text-chrome-caption leading-tight text-muted">{hex.toUpperCase()}</p>
        </div>
        <div className="flex justify-center gap-1">
          <IconActionButton
            label={copied ? t('ui.ColorDetailActionRow.copiado') : t('ui.ColorDetailActionRow.copiar-hex')}
            onClick={() => void handleCopy()}
          >
            {tx(copied ? '✓' : '#')}
          </IconActionButton>
          {onReplace ? (
            <IconActionButton
              label={isCurrent ? t('ui.ColorDetailActionRow.color-actual-2') : t('ui.ColorDetailActionRow.sustituir-por-este-color')}
              disabled={isCurrent}
              onClick={() => onReplace(hex)}
            >
              ↻
            </IconActionButton>
          ) : null}
          {onAdd ? (
            <IconActionButton
              label={t('ui.ColorDetailActionRow.anadir-a-la-paleta')}
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
            ? t('ui.ColorDetailActionRow.color-actual', { name: tx(name) })
            : onReplace
              ? t('ui.ColorDetailActionRow.usar-para-sustituir', { name: tx(name) })
              : undefined
        }
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.75rem] font-semibold leading-tight text-ink">{tx(name)}</p>
        <p className="font-mono text-chrome-caption leading-tight text-muted">{hex.toUpperCase()}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconActionButton
          label={copied ? t('ui.ColorDetailActionRow.copiado') : t('ui.ColorDetailActionRow.copiar-hex')}
          onClick={() => void handleCopy()}
        >
          {tx(copied ? '✓' : '#')}
        </IconActionButton>
        {onReplace ? (
          <IconActionButton
            label={isCurrent ? t('ui.ColorDetailActionRow.color-actual-2') : t('ui.ColorDetailActionRow.sustituir-por-este-color')}
            disabled={isCurrent}
            onClick={() => onReplace(hex)}
          >
            ↻
          </IconActionButton>
        ) : null}
        {onAdd ? (
          <IconActionButton
            label={t('ui.ColorDetailActionRow.anadir-a-la-paleta')}
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
  const tx = useTx();
  return (
    <button
      type="button"
      aria-label={tx(label)}
      title={tx(label)}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md bg-bg/90 text-[0.75rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
