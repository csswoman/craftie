'use client';

import { useRef, type ReactNode } from 'react';

import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

export type InspirationModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function InspirationModal({ open, onClose, children }: InspirationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    open,
    dialogRef,
    onClose,
    initialFocusSelector: '[data-style-card]',
    lockScroll: true,
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-center justify-center overscroll-contain bg-ink/20 p-4">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspiration-modal-title"
        className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-float)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
          <div>
            <h2 id="inspiration-modal-title" className="text-chrome-title">
              Elegir inspiración
            </h2>
            <p className="prose-measure mt-0.5 text-chrome-label leading-relaxed text-muted">
              Elige un estilo para cargar colores semilla en tu paleta.
            </p>
          </div>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
