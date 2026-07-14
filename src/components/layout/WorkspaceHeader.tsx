import Link from 'next/link';

import { ExportMenu } from '@/components/layout/ExportMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export type WorkspaceHeaderProps = {
  canExport: boolean;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
  flowGuideVisible?: boolean;
  onFlowGuideToggle?: () => void;
};

export function WorkspaceHeader({
  canExport,
  onExportDesignMd,
  onExportBrandKit,
  flowGuideVisible = false,
  onFlowGuideToggle,
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
          {onFlowGuideToggle ? (
            <button
              type="button"
              onClick={onFlowGuideToggle}
              aria-pressed={flowGuideVisible}
              title={flowGuideVisible ? 'Ocultar flujo de trabajo' : 'Mostrar flujo de trabajo'}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-chrome-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                flowGuideVisible
                  ? 'bg-[var(--chrome-green-soft)] text-ink hover:bg-surface-raised'
                  : 'text-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              <HintIcon />
              <span className="hidden sm:inline">Flujo</span>
            </button>
          ) : null}
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

function HintIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
      <path
        d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.25 6.35A1.9 1.9 0 0 1 8.1 5c1.05 0 1.8.62 1.8 1.5 0 .72-.42 1.13-1.05 1.5-.54.32-.85.58-.85 1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
