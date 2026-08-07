'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { computeAnchoredMenuPosition } from '@/lib/browser/computeAnchoredMenuPosition';

import { MoreActionsIcon } from './paletteToolbarIcons';

export type PaletteSlotOverflowItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

const MENU_MIN_WIDTH = 176;
const MENU_ITEM_HEIGHT = 44;
const MENU_VERTICAL_PADDING = 8;

export function PaletteSlotOverflowMenu({
  label,
  lightChrome,
  items,
}: {
  label: string;
  lightChrome: boolean;
  items: PaletteSlotOverflowItem[];
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      // Clear stale coordinates when the menu closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const measured = menuRef.current?.getBoundingClientRect();
      const height =
        measured?.height || items.length * MENU_ITEM_HEIGHT + MENU_VERTICAL_PADDING;
      const width = Math.max(measured?.width ?? 0, MENU_MIN_WIDTH);

      setMenuPosition(
        computeAnchoredMenuPosition(trigger.getBoundingClientRect(), { width, height }),
      );
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, items.length]);

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

    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, menuPosition]);

  const chromeClasses = lightChrome
    ? {
        button: open ? 'bg-white/20' : 'hover:bg-white/10',
        focus: 'focus-visible:ring-white/70',
      }
    : {
        button: open ? 'bg-black/15' : 'hover:bg-black/10',
        focus: 'focus-visible:ring-black/30',
      };

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            className="fixed z-dropdown min-w-44 overflow-hidden rounded-lg border border-border bg-bg py-1 text-ink shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  setOpen(false);
                  item.onSelect();
                }}
                className="flex min-h-11 w-full items-center px-3 text-left text-chrome-body font-medium text-ink transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:bg-surface-raised"
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative z-20 shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={`flex size-10 items-center justify-center rounded-md text-current transition-[opacity,transform,background-color] focus-visible:outline-none focus-visible:ring-2 ${chromeClasses.focus} ${chromeClasses.button}`}
      >
        <MoreActionsIcon />
      </button>
      {menu}
    </div>
  );
}
