import type { CSSProperties, ReactNode } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';
import { useT } from '@/context/I18nContext';

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
  const t = useT();
  return (
    <div
      data-layout-slot={slot}
      className={className}
      style={style}
      title={onEditSlot ? t('ui.PreviewSlotTarget.clic-para-editar-token-de') : undefined}
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
