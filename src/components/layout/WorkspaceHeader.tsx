'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

import {
  STUDIO_VIEWS,
  getStudioViewMeta,
  type StudioView,
} from '@lib/export/studioViews';

export type LayoutNavigatorProps = {
  activeView: StudioView;
  onViewChange: (view: StudioView) => void;
};

export function LayoutNavigator({ activeView, onViewChange }: LayoutNavigatorProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = getStudioViewMeta(activeView);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const designSystemViews = STUDIO_VIEWS.filter((view) => view.group === 'design-system');
  const layoutViews = STUDIO_VIEWS.filter((view) => view.group === 'layouts');

  return (
    <div className="relative z-dropdown">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2 text-[0.8125rem] font-semibold text-ink shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <ViewIcon view={activeView} />
        <span>{active.label}</span>
        <ChevronDown open={open} />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fixed z-dropdown mt-2 w-[min(100vw-2rem,320px)] rounded-xl border border-border bg-bg p-2 shadow-lg"
          style={getMenuPosition(triggerRef.current)}
        >
          <MenuSection
            title="Sistema de diseño"
            views={designSystemViews}
            activeView={activeView}
            onSelect={(view) => {
              onViewChange(view);
              setOpen(false);
            }}
          />
          <MenuSection
            title="Maquetas"
            views={layoutViews}
            activeView={activeView}
            onSelect={(view) => {
              onViewChange(view);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function getMenuPosition(trigger: HTMLButtonElement | null) {
  if (!trigger) {
    return { top: '4.5rem', left: '1rem' };
  }

  const rect = trigger.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    left: `${Math.max(16, rect.left)}px`,
  };
}

function MenuSection({
  title,
  views,
  activeView,
  onSelect,
}: {
  title: string;
  views: typeof STUDIO_VIEWS;
  activeView: StudioView;
  onSelect: (view: StudioView) => void;
}) {
  return (
    <div className="py-1">
      <p className="px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted">
        {title}
      </p>
      <ul className="space-y-0.5">
        {views.map((view) => (
          <li key={view.id} role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => onSelect(view.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                activeView === view.id
                  ? 'bg-surface-raised text-ink'
                  : 'text-ink hover:bg-surface'
              }`}
            >
              <ViewIcon view={view.id} />
              <span>
                <span className="block text-[0.8125rem] font-semibold">{view.label}</span>
                <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted">
                  {view.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ViewIcon({ view }: { view: StudioView }) {
  const paths: Record<StudioView, string> = {
    'style-guide':
      'M3 4h4v4H3V4zm0 8h4v4H3v-4zm8-8h4v4h-4V4zm0 8h4v4h-4v-4z',
    'type-scale': 'M4 6h12M4 10h10M4 14h8M4 18h6',
    colors: 'M4 8h12M4 12h12M4 16h12',
    website: 'M4 5h12v10H4V5zm0 3h12',
    'ui-grid': 'M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z',
    slides: 'M5 4h10v8H5V4zm2 2h6v4H7V6z',
    social: 'M8 3h4v14H8V3z',
    newsletter: 'M4 5h12v2H4V5zm0 4h8v2H4V9zm0 4h10v2H4v-2z',
    resume: 'M6 4h6v12H6V4zm0 3h6',
    'business-card': 'M4 7h12v6H4V7zm2 2h4v2H6V9z',
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 size-5 shrink-0 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[view]} />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type WorkspaceHeaderProps = {
  activeView: StudioView;
  onViewChange: (view: StudioView) => void;
  canExport: boolean;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
};

export function WorkspaceHeader({
  activeView,
  onViewChange,
  canExport,
  onExportDesignMd,
  onExportBrandKit,
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
