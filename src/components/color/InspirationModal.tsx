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
    <div className="fixed inset-0 z-dropdown flex items-center justify-center overscroll-contain bg-ink/20 p-3 sm:p-4">
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
        className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-float)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/30 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <h2
              id="inspiration-modal-title"
              className="text-balance text-chrome-title"
            >
              Elegir inspiración
            </h2>
            <p className="prose-measure mt-1 text-chrome-label leading-relaxed text-muted">
              Elige un estilo para cargar colores semilla en tu paleta.
            </p>
          </div>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-[color,background-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 active:scale-95 motion-reduce:transition-colors motion-reduce:active:scale-100"
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

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
