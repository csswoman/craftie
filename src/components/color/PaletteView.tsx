'use client';

import { useMemo } from 'react';

import { buildRolePaletteColumnsWithContrast } from '@lib/color/rolePaletteContrast';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleSlotStrip } from './RoleSlotStrip';

export type PaletteViewProps = {
  editable?: boolean;
  onOpenDetails: (hex: string) => void;
};

export function PaletteView({ editable = true, onOpenDetails }: PaletteViewProps) {
  const { rolePalette, previewRolePalette, activeRole, lockedRoles, setActiveRole } =
    useRolePalette();
  const liveRolePalette = previewRolePalette ?? rolePalette;

  const columns = useMemo(
    () => (liveRolePalette ? buildRolePaletteColumnsWithContrast(liveRolePalette) : []),
    [liveRolePalette],
  );

  if (!liveRolePalette || columns.length === 0) {
    return null;
  }

  function handleSelectRole(role: PaletteRoleId) {
    setActiveRole(role);
  }

  return (
    <div
      data-flow-target="role-palette"
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <RoleSlotStrip
        columns={columns}
        activeRole={activeRole}
        lockedRoles={lockedRoles}
        variant="expanded"
        editable={editable}
        onSelectRole={handleSelectRole}
        onOpenDetails={onOpenDetails}
      />
    </div>
  );
}
