'use client';

import { useMemo } from 'react';

import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
  DARK_NEUTRAL_LIGHTNESS_MAX,
  INTENSE_CHROMA_MIN,
  LIGHT_NEUTRAL_LIGHTNESS_MIN,
  NEUTRAL_CHROMA_MAX,
} from '@lib/color/colorGroupClassification';
import { resolvePaletteDisplayNames } from '@lib/color/paletteDisplay';
import { normalizeHex } from '@lib/color/normalizeHex';
import {
  toggleColorInRolePalette,
} from '@lib/color/rolePalette';
import type { ColorGroupId, SelectableColor } from '@lib/color/selectableColors';

import { ColorGroup } from './ColorGroup';
import { useRolePalette } from '@/context/RolePaletteContext';

export {
  LIGHT_NEUTRAL_LIGHTNESS_MIN,
  DARK_NEUTRAL_LIGHTNESS_MAX,
  NEUTRAL_CHROMA_MAX,
  INTENSE_CHROMA_MIN,
};

function resolveColorGroup(color: SelectableColor): ColorGroupId {
  return classifyColorToGroup(color.hex, DEFAULT_COLOR_GROUP_THRESHOLDS);
}

export type ColorGroupsPanelProps = {
  colors: SelectableColor[];
  onRenameColor?: (color: SelectableColor, newName: string) => boolean;
};

const GROUPS = [
  {
    id: 'light-neutral' as const,
    title: 'Neutros claros',
    requirement: 'Asigna a fondo o superficie',
  },
  {
    id: 'bold' as const,
    title: 'Colores intensos',
    requirement: 'Asigna a primario, secundario o acento',
  },
  {
    id: 'dark-neutral' as const,
    title: 'Neutros oscuros',
    requirement: 'Asigna a texto o borde',
  },
];

export function ColorGroupsPanel({
  colors,
  onRenameColor,
}: ColorGroupsPanelProps) {
  const { rolePalette, activeRole, setRolePalette } = useRolePalette();

  const activeHexes = useMemo(
    () =>
      rolePalette
        ? new Set(Object.values(rolePalette).map((slot) => normalizeHex(slot.hex)))
        : new Set<string>(),
    [rolePalette],
  );
  const displayNames = useMemo(() => resolvePaletteDisplayNames(colors), [colors]);
  const activeAssignmentHex =
    rolePalette && activeRole !== null
      ? normalizeHex(rolePalette[activeRole].hex)
      : null;

  if (!rolePalette) {
    return null;
  }

  function handleToggle(color: SelectableColor) {
    const next = toggleColorInRolePalette(rolePalette, color.hex, activeRole ?? undefined);
    setRolePalette(next);
  }

  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <ColorGroup
          key={group.id}
          groupId={group.id}
          title={group.title}
          requirement={group.requirement}
          selectedCount={
            colors.filter(
              (color) =>
                resolveColorGroup(color) === group.id && activeHexes.has(normalizeHex(color.hex)),
            ).length
          }
          colors={colors.filter((color) => resolveColorGroup(color) === group.id)}
          selectedIds={colors
            .filter((color) => activeHexes.has(normalizeHex(color.hex)))
            .map((color) => color.id)}
          activeAssignmentHex={activeAssignmentHex}
          displayNames={displayNames}
          onToggleColor={handleToggle}
          onRenameColor={onRenameColor}
          emptyMessage={
            group.id === 'light-neutral'
              ? 'No hay neutros claros disponibles.'
              : group.id === 'bold'
                ? 'No se detectaron colores intensos en la imagen.'
                : 'No se detectaron neutros oscuros en la imagen.'
          }
        />
      ))}
    </div>
  );
}
