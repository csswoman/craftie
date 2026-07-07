'use client';

import { useMemo } from 'react';

import { buildRolePaletteColumnsWithContrast } from '@lib/color/rolePaletteContrast';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleSlotStrip } from './RoleSlotStrip';

export type PaletteViewProps = {
  editable?: boolean;
  onOpenDetails: (hex: string) => void;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function PaletteView({ editable = true, onOpenDetails, onEditRole }: PaletteViewProps) {
  const { rolePalette, activeRole, lockedRoles, setActiveRole } = useRolePalette();

  const columns = useMemo(
    () => (rolePalette ? buildRolePaletteColumnsWithContrast(rolePalette) : []),
    [rolePalette],
  );

  if (!rolePalette || columns.length === 0) {
    return null;
  }

  function handleSelectRole(role: PaletteRoleId) {
    setActiveRole(role);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <RoleSlotStrip
        columns={columns}
        activeRole={activeRole}
        lockedRoles={lockedRoles}
        variant="expanded"
        editable={editable}
        onSelectRole={handleSelectRole}
        onOpenDetails={onOpenDetails}
        onEditRole={onEditRole}
      />
    </div>
  );
}
