'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { computePopoverPosition } from '@/lib/browser/computePopoverPosition';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import { useT, useTx } from '@/context/I18nContext';

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 520;
const VIEWPORT_GAP = 8;

/** Floating panel anchored to an element, shared by the role and level editors. */
export function TypeEditPopover({
  rect,
  title,
  subtitle,
  onClose,
  children,
}: {
  rect: DOMRect | null;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const tx = useTx();
  const t = useT();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility({
    open: rect !== null && position !== null,
    dialogRef,
    onClose,
    initialFocusSelector: '[data-popover-close]',
  });

  useEffect(() => {
    // Portals need the browser document to exist.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!rect) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(null);
      return;
    }
    setPosition(computePopoverPosition(rect, POPOVER_WIDTH, POPOVER_HEIGHT));
  }, [rect]);

  useEffect(() => {
    if (!rect) {
      return;
    }
    window.addEventListener('resize', onClose);
    return () => window.removeEventListener('resize', onClose);
  }, [rect, onClose]);

  if (!mounted || !rect || !position) {
    return null;
  }

  return createPortal(
    <>
      <div className="z-modal-backdrop fixed inset-0 bg-ink/10" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="type-edit-popover-title"
        className="z-modal fixed flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-float)"
        style={{
          top: position.top,
          left: position.left,
          maxHeight: `calc(100vh - ${position.top}px - ${VIEWPORT_GAP}px)`,
        }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p id="type-edit-popover-title" className="text-chrome-label font-semibold text-ink">
              {tx(title)}
            </p>
            <p className="text-chrome-caption text-muted">{tx(subtitle)}</p>
          </div>
          <button
            type="button"
            data-popover-close
            onClick={onClose}
            aria-label={t('ui.TypeEditPopover.cerrar')}
            className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
      </div>
    </>,
    document.body,
  );
}

/** Chooses whether an edit updates the applied typography or only this role / level. */
export function TypeScopeToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const tx = useTx();
  const t = useT();
  return (
    <div className="mb-4 rounded-md bg-surface-raised px-3 py-2">
      <label className="flex min-h-8 cursor-pointer items-center gap-2 text-chrome-caption text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        {tx(label)}
      </label>
      <p className="mt-1 text-chrome-caption leading-snug text-muted">
        {checked
          ? t('ui.TypeEditPopover.solo-cambia-este-texto-el')
          : t('ui.TypeEditPopover.actualiza-tambien-los-valores-de')}
      </p>
    </div>
  );
}
