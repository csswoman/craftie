'use client';

import { useCallback, useRef } from 'react';

export type PanelResizeHandleProps = {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
  label?: string;
  keyboardStep?: number;
  /** Current panel width in px — exposed to assistive tech as aria-valuenow. */
  value?: number;
  min?: number;
  max?: number;
  /** id of the panel this separator controls. */
  controlsId?: string;
};

export function PanelResizeHandle({
  onResize,
  onResizeEnd,
  label = 'Redimensionar panel',
  keyboardStep = 16,
  value,
  min,
  max,
  controlsId,
}: PanelResizeHandleProps) {
  const draggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!draggingRef.current) {
          return;
        }

        onResize(moveEvent.movementX);
      };

      const handlePointerUp = () => {
        if (!draggingRef.current) {
          return;
        }

        draggingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        onResizeEnd?.();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [onResize, onResizeEnd],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault();
      onResize(event.key === 'ArrowLeft' ? -keyboardStep : keyboardStep);
      onResizeEnd?.();
    },
    [keyboardStep, onResize, onResizeEnd],
  );

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-controls={controlsId}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className="group/handle relative hidden w-4 shrink-0 cursor-col-resize focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 focus-visible:ring-inset xl:block"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover/handle:bg-primary/40 group-active/handle:bg-primary/60 group-focus-visible/handle:bg-primary/60"
      />
    </div>
  );
}
