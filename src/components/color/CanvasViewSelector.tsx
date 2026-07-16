'use client';

import { Check, ChevronDown, ChartNoAxesColumn, Image as ImageIcon, LayoutDashboard, Music2, Palette, PanelsTopLeft, Type, BookOpen } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import {
  CANVAS_VIEWS,
  CANVAS_VIEW_GROUP_LABEL,
  getCanvasViewMeta,
  type CanvasViewGroup,
  type CanvasViewId,
} from '@lib/color/canvasViews';

const GROUPS: CanvasViewGroup[] = ['mode', 'system', 'layout', 'preview'];
const MENU_WIDTH = 290;
const MENU_GAP = 6;
const VIEWPORT_PAD = 16;

export function CanvasViewSelector({
  activeId,
  palette,
  onSelect,
}: {
  activeId: CanvasViewId;
  palette: string[];
  onSelect: (id: CanvasViewId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    maxHeight: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<CanvasViewId, HTMLButtonElement | null>>(
    {} as Record<CanvasViewId, HTMLButtonElement | null>,
  );
  const active = getCanvasViewMeta(activeId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
      // Prefer aligning to the trigger's right edge (selector sits on the canvas right).
      let left = rect.right - width;
      left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));

      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_PAD;
      const spaceAbove = rect.top - MENU_GAP - VIEWPORT_PAD;
      const placeBelow = spaceBelow >= 220 || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(180, placeBelow ? spaceBelow : spaceAbove);
      const top = placeBelow
        ? rect.bottom + MENU_GAP
        : Math.max(VIEWPORT_PAD, rect.top - MENU_GAP - maxHeight);

      setMenuPosition({ top, left, maxHeight });
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

  useEffect(() => {
    if (open) itemRefs.current[activeId]?.focus();
  }, [open, activeId]);

  function handleItemKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, id: CanvasViewId) {
    const index = CANVAS_VIEWS.findIndex((view) => view.id === id);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex =
        (index + (event.key === 'ArrowDown' ? 1 : -1) + CANVAS_VIEWS.length) % CANVAS_VIEWS.length;
      itemRefs.current[CANVAS_VIEWS[nextIndex]!.id]?.focus();
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : CANVAS_VIEWS.length - 1;
      itemRefs.current[CANVAS_VIEWS[nextIndex]!.id]?.focus();
    }
  }

  const menu =
    open && menuPosition && mounted
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Vistas del lienzo"
            className="fixed z-dropdown overflow-y-auto rounded-xl border border-border bg-bg p-2 shadow-[0_12px_32px_rgb(20_38_31/12%),0_2px_6px_rgb(20_38_31/6%)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PAD * 2),
              maxHeight: menuPosition.maxHeight,
            }}
          >
            {GROUPS.map((group) => (
              <div key={group} className={group === 'layout' ? 'mt-1.5' : undefined}>
                <p className="px-2.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-muted">
                  {CANVAS_VIEW_GROUP_LABEL[group]}
                </p>
                {CANVAS_VIEWS.filter((view) => view.group === group).map((view) => {
                  const selected = activeId === view.id;
                  return (
                    <button
                      key={view.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      ref={(element) => {
                        itemRefs.current[view.id] = element;
                      }}
                      tabIndex={selected ? 0 : -1}
                      onKeyDown={(event) => handleItemKeyDown(event, view.id)}
                      onClick={() => {
                        onSelect(view.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                        selected
                          ? 'bg-primary/10 text-primary'
                          : 'text-ink hover:bg-surface-raised'
                      }`}
                    >
                      <ViewThumbnail id={view.id} palette={palette} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-chrome-label font-semibold leading-tight">
                          {view.id === 'colors' ? 'UI' : view.name}
                        </span>
                        <span className="mt-0.5 block truncate text-chrome-caption text-muted">
                          {view.description}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative z-dropdown">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <ViewThumbnail id={activeId} palette={palette} />
        <span className="max-w-[9rem] truncate">{active.name}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {menu}
    </div>
  );
}

function PaletteSwatches({ palette }: { palette: string[] }) {
  return (
    <span className="flex h-full w-full">
      {palette.slice(0, 4).map((color, index) => (
        <i key={`${color}-${index}`} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export function ViewThumbnail({ id, palette }: { id: CanvasViewId; palette: string[] }) {
  const hasSwatches = palette.length > 0;
  const icon: Record<CanvasViewId, ReactNode> = {
    paint: hasSwatches ? (
      <PaletteSwatches palette={palette} />
    ) : (
      <Palette className="size-3.5" aria-hidden="true" />
    ),
    'style-guide': <BookOpen className="size-3.5" aria-hidden="true" />,
    'type-scale': <Type className="size-3.5" aria-hidden="true" />,
    colors: hasSwatches ? (
      <PaletteSwatches palette={palette} />
    ) : (
      <Palette className="size-3.5" aria-hidden="true" />
    ),
    dashboard: <LayoutDashboard className="size-3.5" aria-hidden="true" />,
    landing: <PanelsTopLeft className="size-3.5" aria-hidden="true" />,
    player: <Music2 className="size-3.5" aria-hidden="true" />,
    analytics: <ChartNoAxesColumn className="size-3.5" aria-hidden="true" />,
    illustration: <ImageIcon className="size-3.5" aria-hidden="true" />,
  };
  return (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-surface text-muted">
      {icon[id]}
    </span>
  );
}
