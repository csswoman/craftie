'use client';

import type { ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
import {
  PanelCollapseBar,
  PanelCollapseButton,
  PanelCollapseRail,
} from '@/components/layout/StudioPanelChrome';

type StudioCanvasToolsSidebarProps = {
  sidebar: ReactNode;
  collapsed: boolean;
  width: number;
  onToggleCollapsed: () => void;
  onResize: (delta: number) => void;
};

export function StudioCanvasToolsSidebar({
  sidebar,
  collapsed,
  width,
  onToggleCollapsed,
  onResize,
}: StudioCanvasToolsSidebarProps) {
  return (
    <>
      {collapsed ? (
        <aside aria-label="Herramientas" className="hidden shrink-0 xl:flex">
          <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
            <PanelCollapseRail
              label="Expandir herramientas"
              direction="right"
              onClick={onToggleCollapsed}
            />
          </div>
        </aside>
      ) : (
        <aside
          aria-label="Herramientas"
          className="hidden min-h-0 shrink-0 flex-col xl:flex xl:h-full"
          style={{ width }}
        >
          <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
            <PanelCollapseBar
              align="end"
              title="Craftie"
              subtitle="Colores y tipografía"
            >
              <PanelCollapseButton
                label="Comprimir herramientas"
                direction="left"
                onClick={onToggleCollapsed}
              />
            </PanelCollapseBar>
            <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
          </div>
        </aside>
      )}

      {!collapsed ? (
        <PanelResizeHandle onResize={onResize} label="Redimensionar panel de herramientas" />
      ) : null}
    </>
  );
}
