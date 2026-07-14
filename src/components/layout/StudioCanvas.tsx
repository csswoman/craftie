'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
import {
  PanelCollapseBar,
  PanelCollapseButton,
  PanelCollapseRail,
} from '@/components/layout/StudioPanelChrome';
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
        {showSidebarCollapsed ? (
          <aside aria-label="Herramientas" className="hidden shrink-0 xl:flex">
            <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
              <PanelCollapseRail
                label="Expandir herramientas"
                direction="right"
                onClick={toggleSidebarCollapsed}
              />
            </div>
          </aside>
        ) : (
          <aside
            aria-label="Herramientas"
            className="hidden min-h-0 shrink-0 flex-col xl:flex xl:h-full"
            style={{ width: sidebarWidth }}
          >
            <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
              <PanelCollapseBar
                align="end"
                title="Herramientas"
                subtitle="Colores y tipografía."
              >
                <PanelCollapseButton
                  label="Comprimir herramientas"
                  direction="left"
                  onClick={toggleSidebarCollapsed}
                />
              </PanelCollapseBar>
              <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
            </div>
          </aside>
        )}

        {!showSidebarCollapsed ? (
          <PanelResizeHandle onResize={resizeSidebar} label="Redimensionar panel de herramientas" />
        ) : null}

        <main
          aria-label="Vista del estudio"
          className="flex min-h-0 min-w-0 flex-1 flex-col xl:min-h-0"
        >
          <div className="panel-float flex min-h-[min(52vh,560px)] flex-1 flex-col overflow-hidden xl:min-h-0">
            {main}
          </div>
        </main>

        {dockedInspector ? (
          displayRightCollapsed ? (
            <aside aria-label="Inspector" className="hidden shrink-0 xl:flex">
              <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
                <PanelCollapseRail
                  label="Expandir inspector"
                  direction="left"
                  onClick={() => updateRightCollapsed(false)}
                />
              </div>
            </aside>
          ) : (
            <>
              <PanelResizeHandle
                onResize={resizeRight}
                label="Redimensionar inspector"
              />
              <aside
                aria-label="Inspector"
                className="hidden min-h-0 shrink-0 flex-col xl:flex xl:h-full"
                style={{ width: rightWidth }}
              >
                <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
                  <PanelCollapseBar
                    align="start"
                    title="Inspector"
                    subtitle="Edita roles, contraste y vistas previas."
                    alwaysVisible
                  >
                    <PanelCollapseButton
                      label="Comprimir inspector"
                      direction="right"
                      onClick={() => updateRightCollapsed(true)}
                    />
                  </PanelCollapseBar>
                  <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
                </div>
              </aside>
            </>
          )
        ) : null}
      </div>

      {!isWideLayout && mobileToolsDock ? mobileToolsDock : null}

      {modalInspector ? (
        <div
          className={`absolute inset-0 z-30 transition-opacity duration-200 motion-reduce:transition-none ${
            displayRightCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-hidden={displayRightCollapsed}
        >
          <button
            type="button"
            aria-label="Cerrar inspector"
            className="absolute inset-0 cursor-default bg-ink/10"
            onClick={() => updateRightCollapsed(true)}
          />
          <aside
            ref={inspectorRef}
            role="dialog"
            aria-modal="true"
            aria-label="Inspector"
            className={`absolute right-4 top-4 bottom-4 flex w-[min(30rem,calc(100vw-2rem))] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[var(--shadow-float)] transition-transform duration-200 motion-reduce:transition-none ${
              displayRightCollapsed ? 'translate-x-[105%]' : 'translate-x-0'
            }`}
          >
            <PanelCollapseBar
              align="start"
              title="Inspector"
              subtitle="Edita roles, contraste y vistas previas."
              alwaysVisible
            >
              <PanelCollapseButton
                label="Cerrar inspector"
                direction="right"
                closeTarget
                onClick={() => updateRightCollapsed(true)}
              />
            </PanelCollapseBar>
            <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
