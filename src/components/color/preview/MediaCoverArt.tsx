import type { ReactNode } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

/**
 * Album art made of the palette itself: four solid colors in overlapping
 * shapes, no transparency, so the cover reads as color even in light mode.
 * `seed` rotates which color leads, to tell covers apart in a list.
 */
export function MediaCoverArt({
  colors,
  seed = 0,
  className = '',
  onEditSlot,
  children,
}: {
  colors: ResolvedLayoutColors;
  seed?: number;
  className?: string;
  onEditSlot?: PreviewSlotEditHandler;
  children?: ReactNode;
}) {
  const pool = [colors.brand1, colors.brand2, colors.brand3, colors.accent];
  const pick = (index: number) => pool[(index + seed) % pool.length]!;

  return (
    <PreviewSlotTarget
      slot="accent"
      onEditSlot={onEditSlot}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundColor: pick(0) }}
    >
      <span aria-hidden="true" className="absolute -right-[22%] -top-[22%] size-[88%] rounded-full" style={{ backgroundColor: pick(1) }} />
      <span aria-hidden="true" className="absolute bottom-0 left-0 h-[46%] w-[62%] rounded-tr-full" style={{ backgroundColor: pick(2) }} />
      <span aria-hidden="true" className="absolute left-[14%] top-[16%] size-[24%] rounded-full" style={{ backgroundColor: pick(3) }} />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: 'repeating-radial-gradient(circle at 72% 28%, transparent 0 9px, rgb(0 0 0 / 0.07) 9px 10px)' }}
      />
      {children}
    </PreviewSlotTarget>
  );
}
