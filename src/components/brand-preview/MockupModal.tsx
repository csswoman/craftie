'use client';

import { useEffect, useRef } from 'react';

export type MockupModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function MockupModal({ open, title, onClose, children }: MockupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleDialogClose() {
    onClose();
    lastFocusedRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={handleDialogClose}
      onCancel={(event) => {
        event.preventDefault();
        handleDialogClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleDialogClose();
        }
      }}
      className="mockup-dialog fixed inset-0 z-dropdown m-0 max-h-none w-full max-w-none border-0 bg-transparent p-4 open:flex open:items-end open:justify-center sm:open:items-center"
    >
      <div
        className="relative flex max-h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-bg"
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={handleDialogClose}
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            ×
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </dialog>
  );
}
