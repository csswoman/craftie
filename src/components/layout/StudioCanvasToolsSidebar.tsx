'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
import {
  PanelCollapseBar,
  PanelCollapseButton,
  PanelCollapseRail,
} from '@/components/layout/StudioPanelChrome';
import { STUDIO_PANEL_WIDTH_LIMITS } from '@/components/layout/useStudioPanelLayout';

type StudioCanvasToolsSidebarProps = {
  sidebar: ReactNode;
  headerExtra?: ReactNode;
  collapsed: boolean;
  width: number;
  onToggleCollapsed: () => void;
  onResize: (delta: number) => void;
};

export function StudioCanvasToolsSidebar({
  sidebar,
  headerExtra,
  collapsed,
  width,
  onToggleCollapsed,
  onResize,
}: StudioCanvasToolsSidebarProps) {
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousCollapsed = useRef(collapsed);

  useEffect(() => {
    if (previousCollapsed.current === collapsed) {
      return;
    }

    previousCollapsed.current = collapsed;
    toggleRef.current?.focus();
  }, [collapsed]);

  return (
    <>
      <aside
        id={panelId}
        aria-label="Herramientas"
        className={
          collapsed
            ? 'hidden shrink-0 xl:flex'
            : 'hidden min-h-0 shrink-0 flex-col xl:flex xl:h-full'
        }
        style={collapsed ? undefined : { width }}
      >
        <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
          {collapsed ? (
            <PanelCollapseRail
              ref={toggleRef}
              label="Expandir herramientas"
              direction="right"
              expanded={false}
              onClick={onToggleCollapsed}
            />
          ) : (
            <>
              <PanelCollapseBar align="end">
                {headerExtra}
                <PanelCollapseButton
                  ref={toggleRef}
                  label="Comprimir herramientas"
                  direction="left"
                  expanded
                  onClick={onToggleCollapsed}
                />
              </PanelCollapseBar>
              <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
            </>
          )}
        </div>
      </aside>

      {!collapsed ? (
        <PanelResizeHandle
          onResize={onResize}
          label="Redimensionar panel de herramientas"
          controlsId={panelId}
          value={width}
          min={STUDIO_PANEL_WIDTH_LIMITS.sidebar.min}
          max={STUDIO_PANEL_WIDTH_LIMITS.sidebar.max}
        />
      ) : null}
    </>
  );
}
