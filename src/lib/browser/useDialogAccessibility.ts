'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { getFocusableElements, handleFocusTrapKeyDown } from '@/lib/browser/focusTrap';

export function useDialogAccessibility({
  open,
  dialogRef,
  onClose,
  initialFocusSelector,
  lockScroll = false,
}: {
  open: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusSelector?: string;
  lockScroll?: boolean;
}) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const initialFocus =
      (initialFocusSelector
        ? dialog.querySelector<HTMLElement>(initialFocusSelector)
        : null) ?? getFocusableElements(dialog)[0];

    initialFocus?.focus();

    const previousOverflow = document.body.style.overflow;

    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      const container = dialogRef.current;

      if (!container) {
        return;
      }

      handleFocusTrapKeyDown(container, event);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = previousOverflow;
      }
      previousFocusRef.current?.focus();
    };
  }, [dialogRef, initialFocusSelector, lockScroll, onClose, open]);
}
