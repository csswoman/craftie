'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { CanvasViewId } from '@lib/color/canvasViews';

export type PreviewActiveMode = 'dashboard' | 'landing' | 'media' | 'analytics';

export type CanvasViewContextValue = {
  activeView: CanvasViewId;
  activeMode: PreviewActiveMode;
  selectView: (view: CanvasViewId) => void;
};

const CanvasViewContext = createContext<CanvasViewContextValue | null>(null);

export function CanvasViewProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<CanvasViewId>('colors');
  const [activeMode, setActiveMode] = useState<PreviewActiveMode>('dashboard');

  const selectView = useCallback((view: CanvasViewId) => {
    setActiveView(view);
    if (view === 'dashboard' || view === 'landing' || view === 'analytics') {
      setActiveMode(view);
    }
    if (view === 'player') {
      setActiveMode('media');
    }
  }, []);

  const value = useMemo(
    () => ({ activeView, activeMode, selectView }),
    [activeView, activeMode, selectView],
  );

  return <CanvasViewContext.Provider value={value}>{children}</CanvasViewContext.Provider>;
}

export function useCanvasView(): CanvasViewContextValue {
  const context = useContext(CanvasViewContext);
  if (!context) {
    throw new Error('useCanvasView must be used within CanvasViewProvider');
  }
  return context;
}

export function useCanvasViewOptional(): CanvasViewContextValue | null {
  return useContext(CanvasViewContext);
}
