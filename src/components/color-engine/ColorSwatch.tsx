'use client';

import { GROUP_DISPLAY_LABELS } from '@lib/color/naming';
import type { SelectableColor } from '@lib/color/selectableColors';
import { prefersLightSelectionRing } from '@lib/color/readableText';

export type ColorSwatchProps = {
  color: SelectableColor;
  selected: boolean;
  onSelect: (color: SelectableColor) => void;
};

export function ColorSwatch({ color, selected, onSelect }: ColorSwatchProps) {
  const useLightRing = prefersLightSelectionRing(color.hex);
  const roleLabel = GROUP_DISPLAY_LABELS[color.group];
  const accessibleLabel = `${color.name}, ${color.hex}, ${roleLabel}`;

  return (
    <button
      type="button"
      aria-label={accessibleLabel}
      aria-pressed={selected}
      onClick={() => onSelect(color)}
      className={`h-10 w-10 rounded-md border border-border transition-[box-shadow,transform] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? useLightRing
            ? 'ring-2 ring-white ring-offset-2 ring-offset-bg'
            : 'ring-2 ring-ink ring-offset-2 ring-offset-bg'
          : ''
      }`}
      style={{ backgroundColor: color.hex }}
      title={`${color.name} · ${color.hex}`}
    />
  );
}
