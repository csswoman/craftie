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
  /** Colapsa el panel derecho al elegir un rol; lo expande al volver a asignar. */
  syncRightPanelWithActiveRole?: boolean;
  onRightPanelCollapsedChange?: (collapsed: boolean) => void;
};

export function StudioCanvas({
  sidebar,
  main,
  rightPanel,
  showRightPanel = false,
  syncRightPanelWithActiveRole = false,
  onRightPanelCollapsedChange,
}: StudioCanvasProps) {
  const rolePaletteContext = useRolePaletteOptional();
  const activeRole = rolePaletteContext?.activeRole ?? null;
  const previousActiveRole = useRef(activeRole);

  const {
    sidebarWidth,
    sidebarCollapsed,
    rightCollapsed,
    resizeSidebar,
    toggleSidebarCollapsed,
    setRightCollapsed,
  } = useStudioPanelLayout();

  useEffect(() => {
    if (!syncRightPanelWithActiveRole) {
      return;
    }

    const previous = previousActiveRole.current;

    if (activeRole !== null && previous === null) {
      setRightCollapsed(false);
    }

    if (activeRole === null && previous !== null) {
      setRightCollapsed(true);
    }

    previousActiveRole.current = activeRole;
  }, [activeRole, setRightCollapsed, syncRightPanelWithActiveRole]);

  useEffect(() => {
    onRightPanelCollapsedChange?.(rightCollapsed);
  }, [onRightPanelCollapsedChange, rightCollapsed]);

  const showRight = showRightPanel && rightPanel;

  return (
    <div className="canvas-dots relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:gap-5 lg:p-6 xl:flex-row">
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
      </div>

      {showRight ? (
        <div
          className={`absolute inset-0 z-30 transition-opacity duration-200 ${
            rightCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-hidden={rightCollapsed}
        >
          <button
            type="button"
            aria-label="Cerrar inspector"
            className="absolute inset-0 cursor-default bg-ink/10 backdrop-blur-[1px]"
            onClick={() => setRightCollapsed(true)}
          />
          <aside
            aria-label="Inspector"
            className={`absolute right-4 top-4 bottom-4 flex w-[min(30rem,calc(100vw-2rem))] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_24px_80px_rgba(58,65,57,0.18)] transition-transform duration-200 motion-reduce:transition-none ${
              rightCollapsed ? 'translate-x-[105%]' : 'translate-x-0'
            }`}
          >
            <PanelCollapseBar
              align="start"
              title="Inspector"
              subtitle="Rol activo con edición y contraste."
            >
              <PanelCollapseButton
                label="Cerrar inspector"
                direction="right"
                onClick={() => setRightCollapsed(true)}
              />
            </PanelCollapseBar>
            <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
          </aside>
        </div>
      ) : null}
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
