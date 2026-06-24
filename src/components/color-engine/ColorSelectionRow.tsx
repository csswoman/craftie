'use client';

import type { SelectableColor } from '@lib/color/selectableColors';

export type ColorSelectionRowProps = {
  color: SelectableColor;
  selected: boolean;
  onToggle: (color: SelectableColor) => void;
};

export function ColorSelectionRow({ color, selected, onToggle }: ColorSelectionRowProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? 'Quitar' : 'Elegir'} ${color.name}, ${color.hex}`}
      onClick={() => onToggle(color)}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-bg hover:border-border hover:bg-surface'
      }`}
    >
      <span
        className="size-9 shrink-0 rounded-md border border-border/80"
        style={{ backgroundColor: color.hex }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.875rem] font-semibold text-ink">{color.name}</span>
        <span className="block font-mono text-[0.75rem] text-muted">{color.hex.toUpperCase()}</span>
      </span>
      {selected ? (
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.75rem] font-bold text-white"
          aria-hidden="true"
        >
          ✓
        </span>
      ) : (
        <span className="size-6 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
