'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
import { useStudioPanelLayout } from '@/components/layout/useStudioPanelLayout';
import { useRolePaletteOptional } from '@/context/RolePaletteContext';

export type StudioCanvasProps = {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel?: ReactNode;
  showRightPanel?: boolean;
  rightPanelOpen?: boolean;
  /** Colapsa el panel derecho al elegir un rol; lo expande al volver a asignar. */
  syncRightPanelWithActiveRole?: boolean;
  onRightPanelCollapsedChange?: (collapsed: boolean) => void;
};

export function StudioCanvas({
  sidebar,
  main,
  rightPanel,
  showRightPanel = false,
  rightPanelOpen = true,
  syncRightPanelWithActiveRole = false,
  onRightPanelCollapsedChange,
}: StudioCanvasProps) {
  const rolePaletteContext = useRolePaletteOptional();
  const activeRole = rolePaletteContext?.activeRole ?? null;
  const previousActiveRole = useRef(activeRole);

  const {
    sidebarWidth,
    rightWidth,
    sidebarCollapsed,
    rightCollapsed,
    resizeSidebar,
    resizeRight,
    toggleSidebarCollapsed,
    toggleRightCollapsed,
    setRightCollapsed,
  } = useStudioPanelLayout();

  useEffect(() => {
    if (!syncRightPanelWithActiveRole) {
      return;
    }

    const previous = previousActiveRole.current;

    if (activeRole !== null && previous === null) {
      setRightCollapsed(true);
    }

    if (activeRole === null && previous !== null) {
      setRightCollapsed(false);
    }

    previousActiveRole.current = activeRole;
  }, [activeRole, setRightCollapsed, syncRightPanelWithActiveRole]);

  useEffect(() => {
    onRightPanelCollapsedChange?.(rightCollapsed);
  }, [onRightPanelCollapsedChange, rightCollapsed]);

  const showRight = showRightPanel && rightPanel;
  const showRightOnMobile = showRight && rightPanelOpen;

  return (
    <div className="canvas-dots relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:gap-5 lg:p-6 xl:flex-row xl:gap-5">
        {sidebarCollapsed ? (
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
            className="flex min-h-0 shrink-0 flex-col xl:h-full"
            style={{ width: sidebarWidth }}
          >
            <div className="panel-float flex h-full max-h-[min(70vh,640px)] min-h-[240px] flex-col overflow-hidden xl:max-h-none xl:min-h-0">
              <PanelCollapseBar
                align="end"
                title="Herramientas"
                subtitle="Roles, imagen e inspiración."
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

        {!sidebarCollapsed ? (
          <PanelResizeHandle onResize={resizeSidebar} label="Redimensionar panel de herramientas" />
        ) : null}

        <main aria-label="Vista del estudio" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="panel-float flex min-h-0 flex-1 flex-col overflow-hidden">{main}</div>
        </main>

        {showRight ? (
          <>
            {!rightCollapsed ? (
              <PanelResizeHandle onResize={resizeRight} label="Redimensionar panel inspector" />
            ) : null}

            {rightCollapsed ? (
              <aside aria-label="Inspector" className="hidden shrink-0 xl:flex">
                <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
                  <PanelCollapseRail
                    label="Expandir inspector"
                    direction="left"
                    onClick={toggleRightCollapsed}
                  />
                </div>
              </aside>
            ) : (
              <aside
                aria-label="Inspector"
                className={`flex min-h-0 shrink-0 flex-col xl:h-full max-xl:order-last ${
                  showRightOnMobile ? 'flex' : 'hidden xl:flex'
                }`}
                style={{ width: rightWidth }}
              >
                <div className="panel-float flex h-full max-h-[min(50vh,480px)] min-h-[200px] flex-col overflow-hidden xl:max-h-none xl:min-h-0">
                  <PanelCollapseBar
                    align="start"
                    title="Inspector"
                    subtitle="Rol activo con edición y contraste."
                  >
                    <PanelCollapseButton
                      label="Comprimir inspector"
                      direction="right"
                      onClick={toggleRightCollapsed}
                    />
                  </PanelCollapseBar>
                  <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
                </div>
              </aside>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function PanelCollapseBar({
  align,
  title,
  subtitle,
  children,
}: {
  align: 'start' | 'end';
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`hidden shrink-0 items-center border-b border-border/40 px-2.5 py-1.5 xl:flex ${
        align === 'end' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className={`min-w-0 ${align === 'end' ? 'text-right' : 'text-left'}`}>
          <p className="truncate text-[0.8125rem] font-semibold text-ink">{title}</p>
          {subtitle ? <p className="truncate text-[0.6875rem] text-muted">{subtitle}</p> : null}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

function PanelCollapseButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function PanelCollapseRail({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-full w-9 items-center justify-center text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4';

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
