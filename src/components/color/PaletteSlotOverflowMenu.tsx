'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { MoreActionsIcon } from './paletteToolbarIcons';

export type PaletteSlotOverflowItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

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
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
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
  }, [open]);

  const chromeClasses = lightChrome
    ? {
        button: open ? 'bg-white/20' : 'hover:bg-white/10',
        focus: 'focus-visible:ring-white/70',
      }
    : {
        button: open ? 'bg-black/15' : 'hover:bg-black/10',
        focus: 'focus-visible:ring-black/30',
      };

  return (
    <div ref={rootRef} className="relative z-20 shrink-0">
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

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-44 overflow-hidden rounded-lg border border-border bg-bg py-1 text-ink shadow-lg"
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
        </div>
      ) : null}
    </div>
  );
}
