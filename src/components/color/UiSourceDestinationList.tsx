'use client';

import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useT, useTx } from '@/context/I18nContext';

export function UiSourceDestinationList({
  label,
  onBack,
  children,
}: {
  label: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const tx = useTx();
  const t = useT();
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-1.5 inline-flex min-h-9 items-center gap-1 rounded-md px-1.5 text-tools-body-sm font-semibold text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={2.25} />{t('ui.UiSourceDestinationList.volver')}</button>
      <ul className="space-y-0.5" aria-label={tx(label)}>
        {children}
      </ul>
    </div>
  );
}

export function UiSourceDestinationButton({
  label,
  currentHex,
  disabled = false,
  onClick,
}: {
  label: string;
  currentHex: string | null;
  disabled?: boolean;
  onClick: () => void;
}) {
  const tx = useTx();
  const t = useT();
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors hover:bg-line-soft/70 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
        <span
          className={`size-6 shrink-0 rounded-full ${
            currentHex
              ? 'ring-1 ring-inset ring-ink/10'
              : 'border border-dashed border-muted'
          }`}
          style={currentHex ? { backgroundColor: currentHex } : undefined}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-tools-body-sm font-medium text-ink">
          {tx(label)}
        </span>
        {!currentHex ? (
          <span className="text-tools-micro font-medium text-muted">{t('ui.UiSourceDestinationList.vacio')}</span>
        ) : null}
      </button>
    </li>
  );
}
