'use client';

import type { ReactNode } from 'react';

import { StudioCanvasToolsSidebar } from '@/components/layout/StudioCanvasToolsSidebar';
import { useStudioPanelLayout } from '@/components/layout/useStudioPanelLayout';
import { useMinWidthQuery } from '@/lib/browser/useMinWidthQuery';

export type StudioCanvasProps = {
  sidebar: ReactNode;
  sidebarHeaderExtra?: ReactNode;
  main: ReactNode;
  mobileToolsDock?: ReactNode;
};

export function StudioCanvas({ sidebar, sidebarHeaderExtra, main, mobileToolsDock }: StudioCanvasProps) {
  // The workspace has enough room for its fixed tools column from the desktop breakpoint.
  // Below it, tools remain in the touch-first bottom sheet.
  const isWideLayout = useMinWidthQuery(1024);
  const { sidebarCollapsed, toggleSidebarCollapsed } = useStudioPanelLayout();
  const showSidebarCollapsed = isWideLayout && sidebarCollapsed;

  return (
    <div className="canvas-dots relative flex flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      <div className="flex flex-1 flex-col gap-3 p-2 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:min-h-0 lg:flex-row lg:gap-4 lg:p-4">
        <StudioCanvasToolsSidebar
          sidebar={sidebar}
          headerExtra={sidebarHeaderExtra}
          collapsed={showSidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />

        <main
          aria-label="Vista del estudio"
          className="flex min-w-0 flex-1 flex-col lg:min-h-0"
        >
          <div className="panel-float flex min-h-[min(52vh,560px)] flex-1 flex-col overflow-visible lg:min-h-0 lg:overflow-hidden">
            {main}
          </div>
        </main>
      </div>

      {!isWideLayout && mobileToolsDock ? mobileToolsDock : null}
    </div>
  );
}
