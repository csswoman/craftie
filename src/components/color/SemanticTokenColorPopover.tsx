'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  SEMANTIC_TOKEN_LABELS,
} from '@lib/color/semanticTokenTargets';
import type { SemanticTokenName } from '@lib/color/semanticTokens';

import { computePopoverPosition } from '@/lib/browser/computePopoverPosition';
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    function handleScroll() {
      onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', onClose);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  if (!mounted || !anchor || !position) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-ink/15 backdrop-blur-[1px]"
        aria-label="Cerrar editor de color"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="semantic-token-popover-title"
        className="fixed z-50 max-h-[min(420px,calc(100vh-16px))] w-72 overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-float)]"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p id="semantic-token-popover-title" className="text-[0.875rem] font-semibold text-ink">
              {SEMANTIC_TOKEN_LABELS[anchor.tokenName]}
            </p>
            <p className="text-[0.6875rem] text-muted">Editar token semántico</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
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
