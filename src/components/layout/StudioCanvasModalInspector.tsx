'use client';

import type { ReactNode, RefObject } from 'react';

import {
  PanelCollapseBar,
  PanelCollapseButton,
} from '@/components/layout/StudioPanelChrome';

type StudioCanvasModalInspectorProps = {
  rightPanel: ReactNode;
  collapsed: boolean;
  inspectorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export function StudioCanvasModalInspector({
  rightPanel,
  collapsed,
  inspectorRef,
  onClose,
}: StudioCanvasModalInspectorProps) {
  return (
    <div
      className={`absolute inset-0 z-30 transition-opacity duration-200 motion-reduce:transition-none ${
        collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={collapsed}
    >
      <button
        type="button"
        aria-label="Cerrar inspector"
        className="absolute inset-0 cursor-default bg-ink/10"
        onClick={onClose}
      />
      <aside
        ref={inspectorRef}
        role="dialog"
        aria-modal="true"
        aria-label="Inspector"
        className={`absolute right-4 top-4 bottom-4 flex w-[min(30rem,calc(100vw-2rem))] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-[var(--shadow-float)] transition-transform duration-200 motion-reduce:transition-none ${
          collapsed ? 'translate-x-[105%]' : 'translate-x-0'
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
            onClick={onClose}
          />
        </PanelCollapseBar>
        <div className="min-h-0 flex-1 overflow-hidden">{rightPanel}</div>
      </aside>
    </div>
  );
}
