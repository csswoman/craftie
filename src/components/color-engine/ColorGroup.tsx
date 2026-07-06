'use client';

import { formatGroupSelectionLabel } from '@lib/color/selectionPanel';
import { normalizeHex } from '@lib/color/normalizeHex';
import type { ColorGroupId, SelectableColor } from '@lib/color/selectableColors';

import { ColorSelectionRow } from './ColorSelectionRow';

export type ColorGroupProps = {
  groupId: ColorGroupId;
  title: string;
  requirement: string;
  selectedCount: number;
  colors: SelectableColor[];
  selectedIds: string[];
  activeAssignmentHex?: string | null;
  displayNames: Map<string, string>;
  onToggleColor: (color: SelectableColor) => void;
  onRenameColor?: (color: SelectableColor, newName: string) => boolean;
  emptyMessage?: string;
};

export function ColorGroup({
  groupId,
  title,
  selectedCount,
  colors,
  selectedIds,
  activeAssignmentHex = null,
  displayNames,
  onToggleColor,
  onRenameColor,
  emptyMessage = 'No hay colores disponibles en este grupo.',
}: ColorGroupProps) {
  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[0.8125rem] font-semibold text-ink">{title}</h3>
        <p className="shrink-0 text-[0.6875rem] font-medium text-muted">
          {formatGroupSelectionLabel(groupId, selectedCount)}
        </p>
      </div>

      {colors.length === 0 ? (
        <p className="mt-2 text-[0.75rem] text-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-1.5 space-y-1">
          {colors.map((color) => (
            <li key={color.id}>
              <ColorSelectionRow
                color={color}
                displayName={displayNames.get(color.id) ?? color.name}
                selected={selectedIds.includes(color.id)}
                activeAssignment={
                  activeAssignmentHex !== null &&
                  normalizeHex(color.hex) === activeAssignmentHex
                }
                onToggle={onToggleColor}
                onRename={onRenameColor}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
