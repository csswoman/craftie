'use client';

import { useCallback, useRef } from 'react';

export type PanelResizeHandleProps = {
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
  label?: string;
};

export function PanelResizeHandle({
  onResize,
  onResizeEnd,
  label = 'Redimensionar panel',
}: PanelResizeHandleProps) {
  const draggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!draggingRef.current) {
          return;
        }

        onResize(moveEvent.movementX);
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(upEvent.pointerId);
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

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      onPointerDown={handlePointerDown}
      className="group/handle relative hidden w-2 shrink-0 cursor-col-resize xl:block"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover/handle:bg-primary/40 group-active/handle:bg-primary/60"
      />
    </div>
  );
}
