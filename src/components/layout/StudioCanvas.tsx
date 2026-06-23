'use client';

import type { ReactNode } from 'react';

export type StudioCanvasProps = {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  showRightPanel?: boolean;
  rightPanelOpen?: boolean;
};

export function StudioCanvas({
  sidebar,
  main,
  rightPanel,
  showRightPanel = false,
  rightPanelOpen = true,
}: StudioCanvasProps) {
  return (
    <div className="canvas-dots relative flex min-h-0 flex-1 flex-col">
      <div
        className={`grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:gap-5 lg:p-5 ${
          showRightPanel
            ? 'xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,300px)]'
            : 'xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]'
        }`}
      >
        <aside aria-label="Herramientas" className="min-h-0 xl:max-h-[calc(100vh-5.5rem)]">
          <div className="panel-float flex h-full max-h-[min(70vh,640px)] min-h-[280px] flex-col overflow-hidden xl:max-h-none xl:min-h-0">
            {sidebar}
          </div>
        </aside>

        <main aria-label="Vista del estudio" className="min-h-[min(420px,55vh)] min-w-0 xl:min-h-0">
          <div className="panel-float flex h-full min-h-[320px] flex-col overflow-hidden">{main}</div>
        </main>

        {showRightPanel && rightPanel ? (
          <aside
            aria-label="Inspector"
            className={`min-h-0 xl:max-h-[calc(100vh-5.5rem)] max-xl:order-last ${
              rightPanelOpen ? 'flex' : 'hidden xl:flex'
            } flex-col`}
          >
            <div className="panel-float flex h-full max-h-[min(50vh,480px)] min-h-[240px] flex-col overflow-hidden xl:max-h-none xl:min-h-0">
              {rightPanel}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
