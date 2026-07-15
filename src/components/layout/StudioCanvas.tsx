'use client';

import type { ReactNode } from 'react';

import { StudioCanvasToolsSidebar } from '@/components/layout/StudioCanvasToolsSidebar';
import { useStudioPanelLayout } from '@/components/layout/useStudioPanelLayout';
import { useMinWidthQuery } from '@/lib/browser/useMinWidthQuery';

export type StudioCanvasProps = {
  sidebar: ReactNode;
  main: ReactNode;
  mobileToolsDock?: ReactNode;
};

export function StudioCanvas({ sidebar, main, mobileToolsDock }: StudioCanvasProps) {
  // Keep the fixed tools column for layouts with enough room for the canvas.
  // Tablets use the same bottom sheet as phones so the preview stays primary.
  const isWideLayout = useMinWidthQuery(1280);
  const {
    sidebarWidth,
    sidebarCollapsed,
    resizeSidebar,
    toggleSidebarCollapsed,
  } = useStudioPanelLayout();
  const showSidebarCollapsed = isWideLayout && sidebarCollapsed;

  return (
    <div className="canvas-dots relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] xl:flex-row xl:gap-5 xl:p-6 xl:pb-6">
        <StudioCanvasToolsSidebar
          sidebar={sidebar}
          collapsed={showSidebarCollapsed}
          width={sidebarWidth}
          onToggleCollapsed={toggleSidebarCollapsed}
          onResize={resizeSidebar}
        />

        <main
          aria-label="Vista del estudio"
          className="flex min-h-0 min-w-0 flex-1 flex-col xl:min-h-0"
        >
          <div className="panel-float flex min-h-[min(52vh,560px)] flex-1 flex-col overflow-hidden xl:min-h-0">
            {main}
          </div>
        </main>
      </div>

      {!isWideLayout && mobileToolsDock ? mobileToolsDock : null}
    </div>
  );
}
