'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type ExportMenuProps = {
  canExport: boolean;
  onExportBrandKit: () => void;
  onExportDesignMd: () => void;
};

const EXPORT_OPTIONS = [
  {
    id: 'brand-kit',
    label: 'Brand kit (.json)',
    description: 'Colores, tipografía y tokens en un JSON listo para usar.',
  },
  {
    id: 'design-md',
    label: 'DESIGN.md',
    description: 'Guía de diseño en Markdown para documentación.',
  },
] as const;

const TRIGGER_BASE =
  'inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25';
const TRIGGER_READY = `${TRIGGER_BASE} bg-primary px-4 py-2 text-chrome-body text-white hover:bg-primary-hover`;
const TRIGGER_GATED = `${TRIGGER_BASE} border border-border bg-transparent px-3 py-2 text-chrome-label text-muted disabled:cursor-not-allowed`;

export function ExportMenu({ canExport, onExportBrandKit, onExportDesignMd }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: string; left: string } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      const menuWidth = 320;
      const left = Math.min(
        Math.max(16, rect.right - menuWidth),
        window.innerWidth - menuWidth - 16,
      );

      setMenuPosition({
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
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
    if (!open || !menuPosition) {
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
        return;
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
        return;
      }

      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
      );
      if (items.length === 0) {
        return;
      }

      event.preventDefault();
      const currentIndex = items.findIndex((item) => item === document.activeElement);
      let nextIndex = currentIndex;

      if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = items.length - 1;
      } else if (event.key === 'ArrowDown') {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
      } else {
        nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
      }

      items[nextIndex]?.focus();
    }

    const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]');
    firstItem?.focus();

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, menuPosition]);

  function handleSelect(optionId: (typeof EXPORT_OPTIONS)[number]['id']) {
    setOpen(false);
    if (optionId === 'brand-kit') {
      onExportBrandKit();
      return;
    }
    onExportDesignMd();
  }

  const disabledHintId = `${menuId}-hint`;
  const exportHint = canExport
    ? 'Descargar Brand kit (.json) o DESIGN.md'
    : 'Se habilita al crear la guía de marca';

  return (
    <div className="relative z-dropdown flex min-w-0 items-center gap-2">
      {!canExport ? (
        <>
          <span id={disabledHintId} className="sr-only">
            Se habilita al crear la guía de marca
          </span>
          <span
            aria-hidden="true"
            className="hidden max-w-[9.5rem] text-right text-chrome-caption leading-snug text-muted sm:block"
          >
            Se habilita al crear la guía
          </span>
        </>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        disabled={!canExport}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-describedby={!canExport ? disabledHintId : undefined}
        title={exportHint}
        onClick={() => {
          if (canExport) setOpen((value) => !value);
        }}
        className={canExport ? TRIGGER_READY : TRIGGER_GATED}
      >
        <DownloadIcon />
        <span className="hidden sm:inline">Exportar</span>
        {canExport ? <ChevronDownIcon open={open} /> : null}
      </button>

      {open && menuPosition ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Opciones de exportación"
          className="fixed z-dropdown w-[min(100vw-2rem,320px)] rounded-xl border border-border bg-bg p-2"
          style={{ ...menuPosition, boxShadow: 'var(--shadow-float)' }}
        >
          <ul className="space-y-0.5">
            {EXPORT_OPTIONS.map((option) => (
              <li key={option.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(option.id)}
                  className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  <DownloadIcon />
                  <span>
                    <span className="block text-chrome-label font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                      {option.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0" fill="none">
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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
      fill="none"
    >
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
