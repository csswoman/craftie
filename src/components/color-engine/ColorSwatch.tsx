'use client';

import type { SelectableColor } from '@lib/color/selectableColors';
import { prefersLightSelectionRing } from '@lib/color/readableText';

export type ColorSwatchProps = {
  color: SelectableColor;
  selected: boolean;
  onSelect: (color: SelectableColor) => void;
};

export function ColorSwatch({ color, selected, onSelect }: ColorSwatchProps) {
  const useLightRing = prefersLightSelectionRing(color.hex);

  return (
    <button
      type="button"
      aria-label={`${color.name}: ${color.hex}`}
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
      title={color.name}
    />
  );
}
