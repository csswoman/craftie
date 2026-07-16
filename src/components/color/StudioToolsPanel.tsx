'use client';

import type { ReactNode } from 'react';

export type StudioToolsPanelProps = {
  children: ReactNode;
};

export function StudioToolsPanel({ children }: StudioToolsPanelProps) {
  return (
    <section
      aria-label="Herramientas del estudio"
      className="studio-tools-panel flex h-full min-h-0 flex-1 flex-col text-ink"
    >
      <h2 className="sr-only">Herramientas del estudio</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-[var(--chrome-space-3)] overflow-hidden px-[var(--chrome-space-3)] py-[var(--chrome-space-3)]">
        {children}
      </div>
    </section>
  );
}
