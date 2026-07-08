'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'craftie-studio-panel-layout';

const DEFAULTS = {
  sidebarWidth: 220,
  rightWidth: 400,
  sidebarCollapsed: false,
  rightCollapsed: true,
};

const LIMITS = {
  sidebar: { min: 200, max: 360 },
  right: { min: 320, max: 560 },
} as const;

type PanelLayout = {
  sidebarWidth: number;
  rightWidth: number;
  sidebarCollapsed: boolean;
  rightCollapsed: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readStoredLayout(): PanelLayout {
  if (typeof window === 'undefined') {
    return { ...DEFAULTS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULTS };
    }

    const parsed = JSON.parse(raw) as Partial<PanelLayout>;
    const storedRight = parsed.rightWidth ?? DEFAULTS.rightWidth;

    return {
      sidebarWidth: clamp(
        parsed.sidebarWidth ?? DEFAULTS.sidebarWidth,
        LIMITS.sidebar.min,
        LIMITS.sidebar.max,
      ),
      rightWidth: clamp(
        storedRight < 320 ? DEFAULTS.rightWidth : storedRight,
        LIMITS.right.min,
        LIMITS.right.max,
      ),
      sidebarCollapsed: parsed.sidebarCollapsed ?? DEFAULTS.sidebarCollapsed,
      rightCollapsed: parsed.rightCollapsed ?? DEFAULTS.rightCollapsed,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function useStudioPanelLayout() {
  const [layout, setLayout] = useState<PanelLayout>(() => ({ ...DEFAULTS }));
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    // The saved panel layout lives in localStorage, so it is only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayout(readStoredLayout());
    setLayoutReady(true);
  }, []);

  useEffect(() => {
    if (!layoutReady) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Ignore storage errors (private mode, quota, etc.).
    }
  }, [layout, layoutReady]);

  const resizeSidebar = useCallback((deltaX: number) => {
    setLayout((current) => ({
      ...current,
      sidebarWidth: clamp(current.sidebarWidth + deltaX, LIMITS.sidebar.min, LIMITS.sidebar.max),
    }));
  }, []);

  const resizeRight = useCallback((deltaX: number) => {
    setLayout((current) => ({
      ...current,
      rightWidth: clamp(current.rightWidth - deltaX, LIMITS.right.min, LIMITS.right.max),
    }));
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setLayout((current) => ({ ...current, sidebarCollapsed: !current.sidebarCollapsed }));
  }, []);

  const toggleRightCollapsed = useCallback(() => {
    setLayout((current) => ({ ...current, rightCollapsed: !current.rightCollapsed }));
  }, []);

  const setRightCollapsed = useCallback((collapsed: boolean) => {
    setLayout((current) =>
      current.rightCollapsed === collapsed ? current : { ...current, rightCollapsed: collapsed },
    );
  }, []);

  return {
    sidebarWidth: layout.sidebarWidth,
    rightWidth: layout.rightWidth,
    sidebarCollapsed: layout.sidebarCollapsed,
    rightCollapsed: layout.rightCollapsed,
    resizeSidebar,
    resizeRight,
    toggleSidebarCollapsed,
    toggleRightCollapsed,
    setRightCollapsed,
  };
}
