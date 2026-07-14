'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { StudioCanvasDockedInspector } from '@/components/layout/StudioCanvasDockedInspector';
import { StudioCanvasModalInspector } from '@/components/layout/StudioCanvasModalInspector';
import { StudioCanvasToolsSidebar } from '@/components/layout/StudioCanvasToolsSidebar';
import { useStudioPanelLayout } from '@/components/layout/useStudioPanelLayout';
import { useRolePaletteOptional } from '@/context/RolePaletteContext';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import { useMinWidthQuery } from '@/lib/browser/useMinWidthQuery';

export type StudioCanvasProps = {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  mobileToolsDock?: ReactNode;
  showRightPanel?: boolean;
  /** Abre el inspector al elegir un rol; en viewport estrecho también lo cierra al soltarlo. */
  syncRightPanelWithActiveRole?: boolean;
  rightPanelCollapsed?: boolean;
  onRightPanelCollapsedChange?: (collapsed: boolean) => void;
};

export function StudioCanvas({
  sidebar,
  main,
  rightPanel,
  mobileToolsDock,
  showRightPanel = false,
  syncRightPanelWithActiveRole = false,
  rightPanelCollapsed,
  onRightPanelCollapsedChange,
}: StudioCanvasProps) {
  const rolePaletteContext = useRolePaletteOptional();
  const activeRole = rolePaletteContext?.activeRole ?? null;
  const previousActiveRole = useRef(activeRole);
  const inspectorRef = useRef<HTMLElement>(null);
  const isWideLayout = useMinWidthQuery(1280);

  const {
    sidebarWidth,
    rightWidth,
    sidebarCollapsed,
    rightCollapsed,
    resizeSidebar,
    resizeRight,
    toggleSidebarCollapsed,
    setRightCollapsed,
  } = useStudioPanelLayout();

  const displayRightCollapsed = rightPanelCollapsed ?? rightCollapsed;

  const updateRightCollapsed = useCallback(
    (collapsed: boolean) => {
      setRightCollapsed(collapsed);
      onRightPanelCollapsedChange?.(collapsed);
    },
    [onRightPanelCollapsedChange, setRightCollapsed],
  );

  useEffect(() => {
    if (rightPanelCollapsed !== undefined) {
      return;
    }

    onRightPanelCollapsedChange?.(rightCollapsed);
  }, [onRightPanelCollapsedChange, rightCollapsed, rightPanelCollapsed]);

  useEffect(() => {
    if (!syncRightPanelWithActiveRole) {
      return;
    }

    const previous = previousActiveRole.current;

    if (activeRole !== null && previous === null) {
      updateRightCollapsed(false);
    }

    // En desktop el inspector dockeado debe seguir visible para asignar roles.
    if (activeRole === null && previous !== null && !isWideLayout) {
      updateRightCollapsed(true);
    }

    previousActiveRole.current = activeRole;
  }, [activeRole, isWideLayout, syncRightPanelWithActiveRole, updateRightCollapsed]);

  const showSidebarCollapsed = isWideLayout && sidebarCollapsed;
  const showRight = Boolean(showRightPanel && rightPanel);
  const dockedInspector = showRight && isWideLayout;
  const modalInspector = showRight && !isWideLayout;
  const inspectorOpen = Boolean(modalInspector && !displayRightCollapsed);

  useDialogAccessibility({
    open: inspectorOpen,
    dialogRef: inspectorRef,
    onClose: () => updateRightCollapsed(true),
    initialFocusSelector: '[data-inspector-close]',
    lockScroll: true,
  });

  return (
    <div className="canvas-dots relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:gap-5 lg:p-6 lg:pb-6 xl:flex-row xl:pb-6">
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

        {dockedInspector ? (
          <StudioCanvasDockedInspector
            rightPanel={rightPanel}
            collapsed={displayRightCollapsed}
            width={rightWidth}
            onExpand={() => updateRightCollapsed(false)}
            onCollapse={() => updateRightCollapsed(true)}
            onResize={resizeRight}
          />
        ) : null}
      </div>

      {!isWideLayout && mobileToolsDock ? mobileToolsDock : null}

      {modalInspector ? (
        <StudioCanvasModalInspector
          rightPanel={rightPanel}
          collapsed={displayRightCollapsed}
          inspectorRef={inspectorRef}
          onClose={() => updateRightCollapsed(true)}
        />
      ) : null}
    </div>
  );
}
