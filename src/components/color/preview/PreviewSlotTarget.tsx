import type { CSSProperties, ReactNode } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';

export type PreviewSlotEditHandler = (slot: UiLayoutSlot, element: HTMLElement) => void;

export function PreviewSlotTarget({
  slot,
  onEditSlot,
  children,
  className,
  style,
}: {
  slot: UiLayoutSlot;
  onEditSlot?: PreviewSlotEditHandler;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-layout-slot={slot}
      className={className}
      style={style}
      title={onEditSlot ? 'Clic para editar token de color' : undefined}
      onClick={(event) => {
        if (!onEditSlot) {
          return;
        }

        const nearest = (event.target as HTMLElement).closest<HTMLElement>('[data-layout-slot]');

        if (nearest !== event.currentTarget) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        onEditSlot(slot, event.currentTarget);
      }}
    >
      {children}
    </div>
  );
}
