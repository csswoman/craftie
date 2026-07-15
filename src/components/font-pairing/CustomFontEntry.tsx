'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import type { CustomFont } from '@lib/typography/customFonts';
import type { CustomFontRole } from '@lib/typography/customFonts';

import { CustomFontModal, type CustomFontSubmitInput } from './CustomFontModal';

export type { CustomFontSubmitInput };

export type CustomFontEntryProps = {
  customFonts: CustomFont[];
  onApply: (input: CustomFontSubmitInput) => Promise<void>;
};

export function CustomFontEntry({ customFonts, onApply }: CustomFontEntryProps) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function applyExisting(font: CustomFont, role: CustomFontRole) {
    setBusyId(`${font.id}:${role}`);
    try {
      await onApply({ family: font.family, source: font.source, role });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-transparent px-3 py-2.5 text-[11px] font-semibold text-muted transition-colors hover:border-ink/30 hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <Plus size={14} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
        Fuente personalizada
      </button>

      {customFonts.length > 0 ? (
        <ul className="space-y-1.5">
          {customFonts.map((font) => (
            <li
              key={font.id}
              className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-surface-raised/40 px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-tools-meta text-ink" title={font.family}>
                  {font.family}
                </p>
                <p className="text-[10px] text-muted">
                  {font.source === 'google' ? 'Google' : 'Local'}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <RoleApplyButton
                  label="Titular"
                  busy={busyId === `${font.id}:heading`}
                  disabled={busyId !== null}
                  onClick={() => void applyExisting(font, 'heading')}
                />
                <RoleApplyButton
                  label="Cuerpo"
                  busy={busyId === `${font.id}:body`}
                  disabled={busyId !== null}
                  onClick={() => void applyExisting(font, 'body')}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <CustomFontModal open={open} onClose={() => setOpen(false)} onApply={onApply} />
    </div>
  );
}

function RoleApplyButton({
  label,
  busy,
  disabled,
  onClick,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      {busy ? '…' : label}
    </button>
  );
}
