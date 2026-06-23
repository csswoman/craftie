'use client';

import { useId, useState, type ReactNode } from 'react';

export type InspirationDrawerProps = {
  children: ReactNode;
  defaultOpen?: boolean;
};

export function InspirationDrawer({ children, defaultOpen = false }: InspirationDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="shrink-0 border-t border-border bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 focus-visible:ring-inset"
      >
        <span className="text-[0.9375rem] font-semibold text-ink">Elegir inspiración</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          id={panelId}
          className="max-h-[min(50vh,420px)] overflow-y-auto border-t border-border bg-bg p-4"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
