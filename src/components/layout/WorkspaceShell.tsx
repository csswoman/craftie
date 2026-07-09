'use client';

import type { ReactNode } from 'react';

export type WorkspaceShellProps = {
  sidebar: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
  rightPanelOpen: boolean;
  onRightPanelToggle: () => void;
  showRightPanel?: boolean;
  mobileRightPanelAvailable?: boolean;
  rightPanelAriaLabel?: string;
  rightPanelToggleLabels?: { open: string; closed: string };
};

export function WorkspaceShell({
  sidebar,
  canvas,
  rightPanel,
  rightPanelOpen,
  onRightPanelToggle,
  showRightPanel = false,
  mobileRightPanelAvailable = false,
  rightPanelAriaLabel = 'Panel lateral',
  rightPanelToggleLabels = { open: 'Ocultar inspector', closed: 'Mostrar inspector' },
}: WorkspaceShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className={`grid min-h-0 flex-1 grid-cols-1 ${
          showRightPanel
            ? 'lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(260px,320px)]'
            : 'lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]'
        }`}
      >
        <aside
          aria-label="Herramientas de paleta"
          className="flex min-h-0 flex-col border-b border-border bg-surface lg:border-b-0 lg:border-r"
        >
          {sidebar}
        </aside>

        <main
          aria-label="Visor de paleta"
          className="relative flex min-h-[min(420px,50vh)] min-w-0 flex-col bg-bg lg:min-h-0"
        >
          {canvas}
        </main>

        <aside
          aria-label={rightPanelAriaLabel}
          className={`min-h-0 flex-col border-t border-border bg-surface lg:border-t-0 lg:border-l ${
            showRightPanel
              ? rightPanelOpen
                ? 'flex'
                : 'hidden lg:flex'
              : 'hidden'
          }`}
        >
          {rightPanel}
        </aside>
      </div>

      {showRightPanel && mobileRightPanelAvailable ? (
        <div className="flex shrink-0 items-center justify-end border-t border-border bg-surface px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={onRightPanelToggle}
            aria-expanded={rightPanelOpen}
            className="rounded-md px-3 py-1.5 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            {rightPanelOpen ? rightPanelToggleLabels.open : rightPanelToggleLabels.closed}
          </button>
        </div>
      ) : null}
    </div>
  );
}
