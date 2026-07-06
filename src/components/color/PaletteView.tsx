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
  const { rolePalette, activeRole, activeTheme, lockedRoles, setActiveRole, setActiveTheme } =
    useRolePalette();

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
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-3">
        <div className="pointer-events-auto">
          <PaletteThemeToggle activeTheme={activeTheme} onChange={setActiveTheme} />
        </div>
      </div>
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

function PaletteThemeToggle({
  activeTheme,
  onChange,
}: {
  activeTheme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}) {
  return (
    <div className="flex justify-end" role="group" aria-label="Tema de paleta">
      <div className="inline-flex rounded-md border border-border/80 bg-surface/90 p-0.5 shadow-sm backdrop-blur-sm">
        {(['light', 'dark'] as const).map((theme) => (
          <button
            key={theme}
            type="button"
            aria-pressed={activeTheme === theme}
            onClick={() => onChange(theme)}
            className={`rounded px-2.5 py-1 text-[0.75rem] font-semibold capitalize ${
              activeTheme === theme ? 'bg-primary text-white' : 'text-muted'
            }`}
          >
            {theme === 'light' ? 'Claro' : 'Oscuro'}
          </button>
        ))}
      </div>
    </div>
  );
}
