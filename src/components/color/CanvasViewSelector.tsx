'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getCanvasViewMeta, type CanvasViewId } from '@lib/color/canvasViews';

import { CanvasViewPickerList } from './CanvasViewPickerList';
import { ViewThumbnail } from './ViewThumbnail';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = getCanvasViewMeta(activeId);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
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

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-dropdown overflow-y-auto rounded-xl border border-border bg-bg p-2 shadow-[0_12px_32px_rgb(20_38_31/12%),0_2px_6px_rgb(20_38_31/6%)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PAD * 2),
              maxHeight: menuPosition.maxHeight,
            }}
          >
            <CanvasViewPickerList
              activeId={activeId}
              palette={palette}
              autoFocusActive
              onSelect={(id) => {
                onSelect(id);
                setOpen(false);
              }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 max-w-full items-center gap-2.5 rounded-lg border border-border bg-bg px-2.5 py-1.5 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
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

export { ViewThumbnail } from './ViewThumbnail';
