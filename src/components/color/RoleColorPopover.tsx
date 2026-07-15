'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ROLE_LABELS, type PaletteRoleId } from '@lib/color/rolePalette';

import { computePopoverPosition } from '@/lib/browser/computePopoverPosition';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import { RoleColorEditor } from './RoleColorEditor';

export type RoleColorPopoverAnchor = {
  role: PaletteRoleId;
  rect: DOMRect;
};

export type RoleColorPopoverProps = {
  anchor: RoleColorPopoverAnchor | null;
  onClose: () => void;
};

export function RoleColorPopover({ anchor, onClose }: RoleColorPopoverProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = anchor !== null && position !== null;

  useDialogAccessibility({
    open: isOpen,
    dialogRef,
    onClose,
    initialFocusSelector: '[data-popover-close]',
  });

  useEffect(() => {
    // Portals need to wait until the browser document exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!anchor) {
      // Clear stale coordinates when the popover closes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(null);
      return;
    }

    setPosition(computePopoverPosition(anchor.rect));
  }, [anchor]);

  useEffect(() => {
    if (!anchor) {
      return;
    }

    function handleScroll() {
      onClose();
    }

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', onClose);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  if (!mounted || !anchor || !position) {
    return null;
  }

  return createPortal(
    <>
      <div
        className="z-modal-backdrop fixed inset-0 bg-ink/15"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-color-popover-title"
        className="z-modal fixed w-72 max-h-[min(420px,calc(100vh-16px))] overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-float)]"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p id="role-color-popover-title" className="text-chrome-label font-semibold text-ink">
              {ROLE_LABELS[anchor.role]}
            </p>
            <p className="text-chrome-caption text-muted">Editar color del rol</p>
          </div>
          <button
            type="button"
            data-popover-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </header>
        <RoleColorEditor
          role={anchor.role}
          idPrefix={`popover-${anchor.role}`}
          showSwatch
          showContrast
          showLock
        />
      </div>
    </>,
    document.body,
  );
}

export function openRoleColorPopover(
  role: PaletteRoleId,
  element: HTMLElement,
  setActiveRole: (role: PaletteRoleId) => void,
  setAnchor: (anchor: RoleColorPopoverAnchor | null) => void,
): void {
  setActiveRole(role);
  setAnchor({ role, rect: element.getBoundingClientRect() });
}
