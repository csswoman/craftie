'use client';

import { useEffect, type ReactNode } from 'react';

export type InspirationModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function InspirationModal({ open, onClose, children }: InspirationModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-center justify-center bg-ink/20 p-4">
      <button
        type="button"
        aria-label="Cerrar inspiración"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Elegir inspiración"
        className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-float)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
          <div>
            <h2 className="text-[0.9375rem] font-semibold text-ink">Elegir inspiración</h2>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted">
              Selecciona un estilo curado para cargar sus colores semilla.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
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
