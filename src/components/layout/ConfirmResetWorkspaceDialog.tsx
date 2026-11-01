'use client';

import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import { useT } from '@/context/I18nContext';

export type ConfirmResetWorkspaceDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmResetWorkspaceDialog({
  open,
  onCancel,
  onConfirm,
}: ConfirmResetWorkspaceDialogProps) {
  const t = useT();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    open,
    dialogRef,
    onClose: onCancel,
    initialFocusSelector: '[data-confirm-cancel]',
    lockScroll: true,
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-center justify-center overscroll-contain bg-ink/20 p-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reset-title"
        aria-describedby="confirm-reset-desc"
        className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-float)]"
      >
        <h2 id="confirm-reset-title" className="text-chrome-title text-ink">{t('ui.ConfirmResetWorkspaceDialog.empezar-de-nuevo')}</h2>
        <p id="confirm-reset-desc" className="mt-2 text-chrome-label leading-relaxed text-muted">{t('ui.ConfirmResetWorkspaceDialog.se-perdera-el-progreso-de')}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            data-confirm-cancel
            className="min-h-11"
            onClick={onCancel}
          >{t('ui.ConfirmResetWorkspaceDialog.cancelar')}</Button>
          <Button type="button" variant="primary" className="min-h-11" onClick={onConfirm}>{t('ui.ConfirmResetWorkspaceDialog.empezar-de-nuevo-2')}</Button>
        </div>
      </div>
    </div>
  );
}
