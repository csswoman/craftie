'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { computePopoverPosition } from '@/lib/browser/computePopoverPosition';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

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
    setPosition(computePopoverPosition(rect));
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
        className="z-modal fixed max-h-[min(520px,calc(100vh-16px))] w-72 overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-(--shadow-float)"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p id="type-edit-popover-title" className="text-chrome-label font-semibold text-ink">
              {title}
            </p>
            <p className="text-chrome-caption text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            data-popover-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </header>
        {children}
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
  return (
    <div className="mb-4 rounded-md bg-surface-raised px-3 py-2">
      <label className="flex min-h-8 cursor-pointer items-center gap-2 text-chrome-caption text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        {label}
      </label>
      <p className="mt-1 text-chrome-caption leading-snug text-muted">
        {checked
          ? 'Solo cambia este texto. El tipo aplicado no se modifica.'
          : 'Actualiza también los valores de «Aplicado» y el resto de textos.'}
      </p>
    </div>
  );
}
