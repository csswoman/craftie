import type { ReactNode } from 'react';

/**
 * Neutral browser window around a desktop mockup. The chrome uses the app's
 * own UI tokens, not the palette, so it reads as the device and never competes
 * with the colors being previewed.
 */
export function PreviewBrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="min-w-0 w-full overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border px-4 py-2.5" aria-hidden="true">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-sm items-center justify-center gap-1.5 rounded-md border border-border bg-bg px-3 text-chrome-caption text-muted">
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
        <div className="w-[3.25rem]" />
      </div>
      {children}
    </div>
  );
}
