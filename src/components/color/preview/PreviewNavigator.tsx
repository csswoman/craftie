'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import type { UiLayoutModeId } from '@lib/color/layoutModes';
import {
  getPreviewFamily,
  PREVIEW_FAMILIES,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';

export type PreviewNavigatorProps = {
  activeFamily: PreviewFamilyId;
  activeMode: UiLayoutModeId;
  onSelectUi: (mode: UiLayoutModeId) => void;
  onSelectIllustration: () => void;
};

export function PreviewNavigator({
  activeFamily,
  activeMode,
  onSelectUi,
  onSelectIllustration,
}: PreviewNavigatorProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: string; left: string } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const uiFamily = getPreviewFamily('ui');
  const illustrationFamily = getPreviewFamily('illustration');
  const illustrationSelectable =
    illustrationFamily.id === 'illustration' && illustrationFamily.styles.length > 0;

  const activeLabel =
    activeFamily === 'illustration'
      ? illustrationFamily.label
      : (uiFamily.modes.find((mode) => mode.id === activeMode)?.label ?? 'Dashboard');

  useLayoutEffect(() => {
    if (!open) {
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
        left: `${Math.max(16, Math.min(rect.left, window.innerWidth - 320 - 16))}px`,
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
    if (!open) {
      return;
    }

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

  if (PREVIEW_FAMILIES.filter((family) => family.id === 'ui' || family.id === 'illustration').length <= 1) {
    return null;
  }

  return (
    <div className="relative z-dropdown w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2 text-left shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <PreviewItemIcon
          kind={activeFamily === 'illustration' ? 'illustration' : 'ui'}
          mode={activeMode}
        />
        <span className="min-w-0 flex-1 truncate text-chrome-label font-semibold text-ink">
          {activeLabel}
        </span>
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
          <MenuSection title="Maquetas UI">
            <ul className="space-y-0.5">
              {uiFamily.modes.map((mode) => {
                const selected = activeFamily === 'ui' && activeMode === mode.id;

                return (
                  <li key={mode.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelectUi(mode.id);
                        setOpen(false);
                      }}
                      className={menuItemClass(selected)}
                    >
                      <PreviewItemIcon kind="ui" mode={mode.id} />
                      <span className="min-w-0">
                        <span className="block text-chrome-label font-semibold">{mode.label}</span>
                        <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                          {mode.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </MenuSection>

          {illustrationSelectable ? (
            <MenuSection title="Ilustración">
              <ul className="space-y-0.5">
                {illustrationFamily.styles.map((style) => {
                  const selected = activeFamily === 'illustration';

                  return (
                    <li key={style.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onSelectIllustration();
                          setOpen(false);
                        }}
                        className={menuItemClass(selected)}
                      >
                        <PreviewItemIcon kind="illustration" />
                        <span className="min-w-0">
                          <span className="block text-chrome-label font-semibold">{style.label}</span>
                          <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                            {style.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </MenuSection>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

function menuItemClass(selected: boolean) {
  return `flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
    selected ? 'bg-surface-raised text-ink' : 'text-ink hover:bg-surface'
  }`;
}

function PreviewItemIcon({
  kind,
  mode = 'dashboard',
}: {
  kind: 'ui' | 'illustration';
  mode?: UiLayoutModeId;
}) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-surface">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-4 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={kind === 'illustration' ? ILLUSTRATION_ICON : UI_MODE_ICONS[mode]} />
      </svg>
    </span>
  );
}

const UI_MODE_ICONS: Record<UiLayoutModeId, string> = {
  dashboard: 'M4 4h5v5H4V4zm7 0h5v5h-5V4zM4 11h5v5H4v-5zm7 0h5v5h-5v-5z',
  landing: 'M4 5h12v10H4V5zm0 3h12M7 12h6',
  media: 'M6 4h8v12H6V4zm2 5h4v2H8V9z',
  analytics: 'M4 14h2V9H4v5zm4 0h2V6H8v8zm4 0h2V4h-2v10zm4 0h2V11h-2v3',
};

const ILLUSTRATION_ICON = 'M4 4h5v7H4V4zm7 0h5v4h-5V4zM4 13h7v3H4v-3zm9 0h3v3h-3v-3z';

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
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
