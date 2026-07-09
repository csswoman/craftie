'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

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
  const [menuPosition, setMenuPosition] = useState<{ top: string; left: string } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = getStudioViewMeta(activeView);
  const activeGroupLabel = active.group === 'layouts' ? 'Maquetas' : 'Sistema';

  useLayoutEffect(() => {
    if (!open) {
      // Drop fixed coordinates after the menu closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: `${rect.bottom + 8}px`,
        left: `${Math.max(16, rect.left)}px`,
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
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
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-bg px-3.5 py-2 text-chrome-body font-semibold text-ink shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <ViewIcon view={activeView} />
        <span className="max-w-[9rem] truncate sm:max-w-none">{activeGroupLabel}</span>
        <ChevronDown open={open} />
      </button>

      {open && menuPosition ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fixed z-dropdown w-[min(100vw-2rem,320px)] rounded-xl border border-border bg-bg p-2"
          style={{ ...menuPosition, boxShadow: 'var(--shadow-float)' }}
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
      <p className="px-2.5 py-1.5 text-chrome-caption font-semibold text-muted">{title}</p>
      <ul className="space-y-0.5">
        {views.map((view) => (
          <li key={view.id} role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => onSelect(view.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                activeView === view.id ? 'bg-surface-raised text-ink' : 'text-ink hover:bg-surface'
              }`}
            >
              <ViewIcon view={view.id} />
              <span>
                <span className="block text-chrome-label font-semibold">{view.label}</span>
                <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
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
    'style-guide': 'M3 4h4v4H3V4zm0 8h4v4H3v-4zm8-8h4v4h-4V4zm0 8h4v4h-4v-4z',
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
      className="size-4 shrink-0 text-ink"
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
