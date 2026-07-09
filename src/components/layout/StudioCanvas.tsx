'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
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
  /** Colapsa el panel derecho al elegir un rol; lo expande al volver a asignar. */
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
    sidebarCollapsed,
    rightCollapsed,
    resizeSidebar,
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

    if (activeRole === null && previous !== null) {
      updateRightCollapsed(true);
    }

    previousActiveRole.current = activeRole;
  }, [activeRole, syncRightPanelWithActiveRole, updateRightCollapsed]);

  const showSidebarCollapsed = isWideLayout && sidebarCollapsed;
  const showRight = showRightPanel && rightPanel;
  const inspectorOpen = Boolean(showRight && !displayRightCollapsed);

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
      </div>

      {!isWideLayout && mobileToolsDock ? mobileToolsDock : null}

      {showRight ? (
        <div
          className={`absolute inset-0 z-30 transition-opacity duration-200 ${
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
            className={`absolute right-4 top-4 bottom-4 flex w-[min(30rem,calc(100vw-2rem))] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_24px_80px_rgba(58,65,57,0.18)] transition-transform duration-200 motion-reduce:transition-none ${
              displayRightCollapsed ? 'translate-x-[105%]' : 'translate-x-0'
            }`}
          >
            <PanelCollapseBar
              align="start"
              title="Inspector"
              subtitle="Edición de rol, contraste y vistas previas."
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
          <p className="truncate text-chrome-label font-semibold text-ink">{title}</p>
          {subtitle ? <p className="truncate text-chrome-caption text-muted">{subtitle}</p> : null}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

function PanelCollapseButton({
  label,
  direction,
  closeTarget = false,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  closeTarget?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-inspector-close={closeTarget ? '' : undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
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
      className="flex h-full min-h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
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
