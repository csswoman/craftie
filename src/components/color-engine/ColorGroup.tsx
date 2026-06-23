'use client';

import type { SelectableColor } from '@lib/color/selectableColors';

import { ColorSwatch } from './ColorSwatch';

export type ColorGroupProps = {
  title: string;
  requirement: string;
  colors: SelectableColor[];
  selectedIds: string[];
  onToggleColor: (color: SelectableColor) => void;
  emptyMessage?: string;
};

export function ColorGroup({
  title,
  requirement,
  colors,
  selectedIds,
  onToggleColor,
  emptyMessage = 'No hay colores disponibles en este grupo.',
}: ColorGroupProps) {
  return (
    <section aria-label={title}>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-[0.8125rem] text-muted">{requirement}</p>

      {colors.length === 0 ? (
        <p className="mt-3 text-[0.8125rem] text-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {colors.map((color) => (
            <li key={color.id}>
              <ColorSwatch
                color={color}
                selected={selectedIds.includes(color.id)}
                onSelect={onToggleColor}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
