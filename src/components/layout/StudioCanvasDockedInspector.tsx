'use client';

import type { ReactNode } from 'react';

import { PanelResizeHandle } from '@/components/layout/PanelResizeHandle';
import {
  PanelCollapseBar,
  PanelCollapseButton,
  PanelCollapseRail,
} from '@/components/layout/StudioPanelChrome';

type StudioCanvasDockedInspectorProps = {
  rightPanel: ReactNode;
  collapsed: boolean;
  width: number;
  onExpand: () => void;
  onCollapse: () => void;
  onResize: (delta: number) => void;
};

export function StudioCanvasDockedInspector({
  rightPanel,
  collapsed,
  width,
  onExpand,
  onCollapse,
  onResize,
}: StudioCanvasDockedInspectorProps) {
  if (collapsed) {
    return (
      <aside aria-label="Inspector" className="hidden shrink-0 xl:flex">
        <div className="panel-float flex h-full min-h-0 flex-col overflow-hidden">
          <PanelCollapseRail
            label="Expandir inspector"
            direction="left"
            onClick={onExpand}
          />
        </div>
      </aside>
    );
  }

  return (
    <>
      <PanelResizeHandle onResize={onResize} label="Redimensionar inspector" />
      <aside
        aria-label="Inspector"
        className="hidden min-h-0 shrink-0 flex-col xl:flex xl:h-full"
        style={{ width }}
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
              onClick={onCollapse}
            />
          </PanelCollapseBar>
          <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
        </div>
      </aside>
    </>
  );
}
