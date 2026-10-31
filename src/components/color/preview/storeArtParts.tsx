import type { MouseEvent } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';

import { paletteTint } from './previewButtons';
import type { PreviewSlotEditHandler } from './PreviewSlotTarget';

/** Light, base and shade of one glaze, so a flat palette color reads as a turned object. */
export function glazeTones(hex: string) {
  return {
    light: paletteTint(hex, '#ffffff', 0.78),
    base: hex,
    shade: paletteTint(hex, '#000000', 0.74),
  };
}

/** Horizontal light-to-shade gradient: light from the upper left, like a window beside the shelf. */
export function GlazeGradient({ id, hex }: { id: string; hex: string }) {
  const tones = glazeTones(hex);

  return (
    <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor={tones.light} />
      <stop offset="0.38" stopColor={tones.base} />
      <stop offset="1" stopColor={tones.shade} />
    </linearGradient>
  );
}

export function SoftShadowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  );
}

/**
 * Makes an SVG group behave like PreviewSlotTarget: clicking it opens the token
 * editor for its slot, and the nearest slot wins over the background.
 */
export function svgSlot(slot: UiLayoutSlot, onEditSlot?: PreviewSlotEditHandler) {
  return {
    'data-layout-slot': slot,
    style: onEditSlot ? { cursor: 'pointer' } : undefined,
    onClick: (event: MouseEvent<SVGGElement>) => {
      if (!onEditSlot) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onEditSlot(slot, event.currentTarget as unknown as HTMLElement);
    },
  };
}
