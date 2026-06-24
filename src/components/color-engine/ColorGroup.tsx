'use client';

import { formatGroupSelectionLabel } from '@lib/color/selectionPanel';
import type { ColorGroupId, SelectableColor } from '@lib/color/selectableColors';

import { ColorSelectionRow } from './ColorSelectionRow';

export type ColorGroupProps = {
  groupId: ColorGroupId;
  title: string;
  requirement: string;
  selectedCount: number;
  colors: SelectableColor[];
  selectedIds: string[];
  onToggleColor: (color: SelectableColor) => void;
  emptyMessage?: string;
};

export function ColorGroup({
  groupId,
  title,
  requirement,
  selectedCount,
  colors,
  selectedIds,
  onToggleColor,
  emptyMessage = 'No hay colores disponibles en este grupo.',
}: ColorGroupProps) {
  return (
    <section aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 text-[0.75rem] text-muted">{requirement}</p>
        </div>
        <p className="shrink-0 text-[0.75rem] font-medium text-muted">
          {formatGroupSelectionLabel(groupId, selectedCount)}
        </p>
      </div>

      {colors.length === 0 ? (
        <p className="mt-3 text-[0.8125rem] text-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {colors.map((color) => (
            <li key={color.id}>
              <ColorSelectionRow
                color={color}
                selected={selectedIds.includes(color.id)}
                onToggle={onToggleColor}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
