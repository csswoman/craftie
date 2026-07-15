'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  SEMANTIC_TOKEN_LABELS,
} from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName } from '@lib/color/semanticTokens';

import { computePopoverPosition } from '@/lib/browser/computePopoverPosition';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import { SemanticTokenColorEditor } from './SemanticTokenColorEditor';

export type SemanticTokenPopoverAnchor = {
  tokenName: SemanticTokenName;
  rect: DOMRect;
};

export function SemanticTokenColorPopover({
  anchor,
  onClose,
}: {
  anchor: SemanticTokenPopoverAnchor | null;
  onClose: () => void;
}) {
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
        aria-labelledby="semantic-token-popover-title"
        className="z-modal fixed max-h-[min(420px,calc(100vh-16px))] w-72 overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-float)]"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p id="semantic-token-popover-title" className="text-chrome-label font-semibold text-ink">
              {SEMANTIC_TOKEN_LABELS[anchor.tokenName]}
            </p>
            <p className="text-chrome-caption text-muted">Editar token semántico</p>
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
        <SemanticTokenColorEditor
          tokenName={anchor.tokenName}
          idPrefix={`semantic-popover-${anchor.tokenName}`}
          showSwatch
        />
      </div>
    </>,
    document.body,
  );
}
