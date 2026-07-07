import Link from 'next/link';

import { ThemeToggle } from '@/components/theme/ThemeToggle';

import {
  StudioShortcutsHelp,
  type StudioShortcutsHelpHandle,
} from '@/components/layout/StudioShortcutsHelp';

export type WorkspaceHeaderProps = {
  canExport: boolean;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
  shortcutsRef?: React.RefObject<StudioShortcutsHelpHandle | null>;
};

export function WorkspaceHeader({
  canExport,
  onExportDesignMd,
  onExportBrandKit,
  shortcutsRef,
}: WorkspaceHeaderProps) {
  return (
    <header className="relative z-sticky shrink-0 px-4 pt-4 lg:px-7 lg:pt-7">
      <div className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border/80 bg-bg/95 px-4 py-3 shadow-sm backdrop-blur-sm lg:px-5">
        <Link
          href="/"
          className="shrink-0 font-display text-2xl font-medium text-ink sm:text-[1.75rem]"
        >
          Craftie
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <ThemeToggle />
          <StudioShortcutsHelp ref={shortcutsRef} />
          <div className="hidden h-9 w-px bg-border sm:block" aria-hidden="true" />
          <button
            type="button"
            disabled={!canExport}
            onClick={onExportDesignMd}
            className="hidden"
          >
            Export DESIGN.md
          </button>
          <button
            type="button"
            disabled={!canExport}
            onClick={onExportBrandKit}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[0.9375rem] font-extrabold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDownIcon />
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

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
      <path
        d="M4.5 6.25 8 9.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
