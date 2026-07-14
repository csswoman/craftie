'use client';

import { useCallback, useState } from 'react';

import type { PaletteColumnDisplay } from '@lib/color/paletteDisplay';
import type { PaletteRoleId } from '@lib/color/rolePalette';
import { isPaletteRoleId } from '@lib/color/rolePalette';

import { useMinWidthQuery } from '@/lib/browser/useMinWidthQuery';
import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleSlotCell } from './RoleSlotCell';

export type RoleSlotStripProps = {
  columns: PaletteColumnDisplay[];
  activeRole: PaletteRoleId | null;
  lockedRoles: PaletteRoleId[];
  variant?: 'compact' | 'expanded';
  editable?: boolean;
  onSelectRole: (role: PaletteRoleId) => void;
  onOpenDetails: (hex: string) => void;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function RoleSlotStrip({
  columns,
  activeRole,
  lockedRoles,
  variant = 'compact',
  editable = true,
  onSelectRole,
  onOpenDetails,
  onEditRole,
}: RoleSlotStripProps) {
  const { toggleLock, replaceRole } = useRolePalette();
  const isWideLayout = useMinWidthQuery(1280);
  const lockedSet = new Set(lockedRoles);
  const expanded = variant === 'expanded';
  const [shadesOpenRole, setShadesOpenRole] = useState<PaletteRoleId | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopyHex = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      setCopyMessage('HEX copiado');
      window.setTimeout(() => setCopyMessage(null), 1500);
    } catch {
      setCopyMessage('No se pudo copiar');
      window.setTimeout(() => setCopyMessage(null), 1500);
    }
  }, []);

  return (
    <div className={`relative flex min-h-0 flex-col ${expanded ? 'h-full flex-1' : 'shrink-0'}`}>
      {copyMessage ? (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-md border border-border bg-ink px-2.5 py-1 text-chrome-caption font-medium text-bg shadow-md"
        >
          {copyMessage}
        </p>
      ) : null}

      <ul
        className={`flex min-h-0 ${
          expanded
            ? `h-full flex-1 flex-col divide-y divide-white/10 ${
                isWideLayout ? 'min-h-[420px]' : 'min-h-0'
              }`
            : 'h-16 shrink-0 border-t border-border'
        }`}
        aria-label="Roles de la paleta"
      >
        {columns.map((column) => {
          if (!isPaletteRoleId(column.id)) {
            return null;
          }

          const role = column.id;

          return (
            <RoleSlotCell
              key={column.id}
              column={column}
              role={role}
              isActive={activeRole === role}
              locked={lockedSet.has(role)}
              showShades={shadesOpenRole === role}
              expanded={expanded}
              editable={editable}
              isWideLayout={isWideLayout}
              onSelectRole={onSelectRole}
              onOpenDetails={onOpenDetails}
              onEditRole={onEditRole}
              onToggleLock={() => toggleLock(role)}
              onCopyHex={() => void handleCopyHex(column.hex)}
              onToggleShades={() =>
                setShadesOpenRole((current) => (current === role ? null : role))
              }
              onSelectShade={(hex) => {
                replaceRole(role, hex);
                setShadesOpenRole(null);
              }}
              onCloseShades={() => setShadesOpenRole(null)}
            />
          );
        })}
      </ul>
    </div>
  );
}
