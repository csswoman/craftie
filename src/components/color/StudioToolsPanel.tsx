'use client';

import type { ReactNode } from 'react';

export type StudioToolsPanelProps = {
  children: ReactNode;
};

export function StudioToolsPanel({ children }: StudioToolsPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}
