import Link from 'next/link';

import type { StudioView } from '@lib/export/studioViews';
import { LayoutNavigator } from '@/components/layout/LayoutNavigator';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

import {
  StudioShortcutsHelp,
  type StudioShortcutsHelpHandle,
} from '@/components/layout/StudioShortcutsHelp';

export type WorkspaceHeaderProps = {
  activeView: StudioView;
  onViewChange: (view: StudioView) => void;
  canExport: boolean;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
  shortcutsRef?: React.RefObject<StudioShortcutsHelpHandle | null>;
};

export function WorkspaceHeader({
  activeView,
  onViewChange,
  canExport,
  onExportDesignMd,
  onExportBrandKit,
  shortcutsRef,
}: WorkspaceHeaderProps) {
  return (
    <header className="relative z-sticky shrink-0 border-b border-border/70 bg-bg/90 backdrop-blur-sm">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 lg:px-5">
        <div className="flex items-center gap-2 justify-self-start">
          <Link
            href="/"
            aria-label="Configuración"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path
                fillRule="evenodd"
                d="M11.2 1.5h-2.4l-.3 1.6a6.5 6.5 0 00-1.5.9L5.6 3.3 4.3 5.6l1.3 1.3c-.1.5-.1 1 0 1.5L4.3 9.7l1.3 2.3 1.3-.7c.5.3 1 .5 1.5.7l.3 1.6h2.4l.3-1.6c.5-.2 1-.4 1.5-.7l1.3.7 1.3-2.3-1.3-1.3c.1-.5.1-1 0-1.5l1.3-1.3-1.3-2.3-1.3.7a6.5 6.5 0 00-1.5-.9l-.3-1.6zm-1.2 4a3 3 0 110 6 3 3 0 010-6z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <LayoutNavigator activeView={activeView} onViewChange={onViewChange} />
        </div>

        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[-0.01em] text-ink justify-self-center"
        >
          Craftie
        </Link>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <ThemeToggle />
          <StudioShortcutsHelp ref={shortcutsRef} />
          <button
            type="button"
            disabled={!canExport}
            onClick={onExportDesignMd}
            className="hidden rounded-md px-3 py-2 text-[0.8125rem] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45 sm:inline-flex"
          >
            Export DESIGN.md
          </button>
          <button
            type="button"
            disabled={!canExport}
            onClick={onExportBrandKit}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <DownloadIcon />
            Brand Kit
          </button>
        </div>
      </div>
    </header>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
      <path
        d="M8 2.5v7M5.5 7 8 9.5 10.5 7M3 12.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
