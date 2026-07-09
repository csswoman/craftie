import Link from 'next/link';

import { ExportMenu } from '@/components/layout/ExportMenu';
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
      <div className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3 lg:px-5">
        <Link
          href="/"
          className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <h1 className="font-display text-[var(--chrome-text-display)] font-medium leading-none">
            Craftie
          </h1>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <ThemeToggle />
          <StudioShortcutsHelp ref={shortcutsRef} />
          <div className="hidden h-9 w-px bg-border sm:block" aria-hidden="true" />
          <ExportMenu
            canExport={canExport}
            onExportBrandKit={onExportBrandKit}
            onExportDesignMd={onExportDesignMd}
          />
        </div>
      </div>
    </header>
  );
}
