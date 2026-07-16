'use client';

import { useMemo } from 'react';

import { buildRolePaletteColumnsWithContrast } from '@lib/color/rolePaletteContrast';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { AccentSlotStrip } from './AccentSlotStrip';
import { RoleSlotStrip } from './RoleSlotStrip';

export type PaletteViewProps = {
  editable?: boolean;
  showAccents?: boolean;
  onOpenDetails: (hex: string) => void;
};

export function PaletteView({
  editable = true,
  showAccents = false,
  onOpenDetails,
}: PaletteViewProps) {
  const { rolePalette, previewRolePalette, activeRole, lockedRoles, setActiveRole } =
    useRolePalette();
  const liveRolePalette = previewRolePalette ?? rolePalette;

  const columns = useMemo(() => {
    if (!liveRolePalette) return [];
    // Acento lives in the Accents family strip (slot 1), not duplicated here.
    return buildRolePaletteColumnsWithContrast(liveRolePalette).filter(
      (column) => column.id !== 'acento',
    );
  }, [liveRolePalette]);

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
      {showAccents ? (
        <AccentSlotStrip editable={editable} onOpenDetails={onOpenDetails} />
      ) : (
        <RoleSlotStrip
          columns={columns}
          activeRole={activeRole}
          lockedRoles={lockedRoles}
          variant="expanded"
          editable={editable}
          onSelectRole={handleSelectRole}
          onOpenDetails={onOpenDetails}
        />
      )}
    </div>
  );
}
