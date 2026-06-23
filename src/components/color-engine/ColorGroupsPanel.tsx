'use client';

import { useMemo } from 'react';

import {
  sortSelectedColors,
  toggleSelectedColor,
  type SelectableColor,
} from '@lib/color/selectableColors';

import { ColorGroup } from './ColorGroup';

export type ColorGroupsPanelProps = {
  colors: SelectableColor[];
  selectedColors: SelectableColor[];
  onSelectedColorsChange: (colors: SelectableColor[]) => void;
};

const GROUPS = [
  {
    id: 'light-neutral' as const,
    title: 'Neutros claros',
    requirement: 'Elige al menos 1',
  },
  {
    id: 'bold' as const,
    title: 'Colores intensos',
    requirement: 'Elige de 2 a 4 colores',
  },
  {
    id: 'dark-neutral' as const,
    title: 'Neutros oscuros',
    requirement: 'Elige al menos 1',
  },
];

export function ColorGroupsPanel({
  colors,
  selectedColors,
  onSelectedColorsChange,
}: ColorGroupsPanelProps) {
  const selectedIds = useMemo(
    () => selectedColors.map((color) => color.id),
    [selectedColors],
  );

  function handleToggle(color: SelectableColor) {
    const nextSelection = toggleSelectedColor(selectedColors, color);

    if (nextSelection !== null) {
      onSelectedColorsChange(nextSelection);
    }
  }

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <ColorGroup
          key={group.id}
          title={group.title}
          requirement={group.requirement}
          colors={colors.filter((color) => color.group === group.id)}
          selectedIds={selectedIds}
          onToggleColor={handleToggle}
          emptyMessage={
            group.id === 'light-neutral'
              ? 'No se detectaron neutros claros en la imagen.'
              : group.id === 'bold'
                ? 'No se detectaron colores intensos en la imagen.'
                : 'No se detectaron neutros oscuros en la imagen.'
          }
        />
      ))}
    </div>
  );
}

export function getSortedSelection(selectedColors: SelectableColor[]) {
  return sortSelectedColors(selectedColors);
}
