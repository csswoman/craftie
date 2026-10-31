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

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 500;
const VIEWPORT_GAP = 8;

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

    setPosition(computePopoverPosition(anchor.rect, POPOVER_WIDTH, POPOVER_HEIGHT));
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
            className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <SemanticTokenColorEditor
            tokenName={anchor.tokenName}
            idPrefix={`semantic-popover-${anchor.tokenName}`}
            showSwatch
          />
        </div>
      </div>
    </>,
    document.body,
  );
}
