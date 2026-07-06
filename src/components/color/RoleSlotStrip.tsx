'use client';

import { useCallback, useState } from 'react';

import type { PaletteColumnDisplay } from '@lib/color/paletteDisplay';
import { pickReadableTextColor, prefersLightSelectionRing } from '@lib/color/readableText';
import type { PaletteRoleId } from '@lib/color/rolePalette';
import { isPaletteRoleId } from '@lib/color/rolePalette';

import { ContrastBadge } from '@/components/color-engine/ContrastBadge';
import { useRolePalette } from '@/context/RolePaletteContext';

import { PaletteColumnToolbar } from './PaletteColumnToolbar';
import { PaletteShadesOverlay } from './PaletteShadesOverlay';

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
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-md border border-border bg-ink px-2.5 py-1 text-[0.6875rem] font-medium text-bg shadow-md"
        >
          {copyMessage}
        </p>
      ) : null}

      <ul
        className={`flex min-h-0 ${
          expanded ? 'h-full min-h-[280px] flex-1 divide-x divide-white/10' : 'h-16 shrink-0 border-t border-border'
        }`}
        aria-label="Roles de la paleta"
      >
        {columns.map((column) => {
          if (!isPaletteRoleId(column.id)) {
            return null;
          }

          const role = column.id;
          const isActive = activeRole === role;
          const locked = lockedSet.has(role);
          const showShades = shadesOpenRole === role;
          const textColor = pickReadableTextColor(column.hex);
          const lightChrome = prefersLightSelectionRing(column.hex);
          const canApplyShade = editable && !locked;

          return (
            <li key={column.id} className="relative flex h-full min-w-0 flex-1">
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${column.roleLabel ?? role}: ${column.name}, ${column.hex}`}
                onClick={() => {
                  if (!showShades) {
                    onSelectRole(role);
                  }
                }}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  if (onEditRole) {
                    onEditRole(role, event.currentTarget);
                    return;
                  }
                  onOpenDetails(column.hex);
                }}
                onKeyDown={(event) => {
                  if (showShades) {
                    return;
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectRole(role);
                  }
                }}
                className={`group/slot relative flex w-full cursor-pointer flex-col items-center justify-end transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  expanded
                    ? 'h-full min-h-0 px-3 pb-5 pt-10'
                    : 'h-16 px-1 pb-1.5 pt-6'
                } ${isActive ? 'z-[1] shadow-[inset_0_0_0_2px] shadow-primary' : ''}`}
                style={{ backgroundColor: column.hex, color: textColor }}
              >
                {!showShades ? (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <PaletteColumnToolbar
                      hoverGroup="slot"
                      locked={locked}
                      editable={editable}
                      canMoveLeft={false}
                      canMoveRight={false}
                      showShades={showShades}
                      lightChrome={lightChrome}
                      onToggleLock={() => toggleLock(role)}
                      onMoveLeft={() => undefined}
                      onMoveRight={() => undefined}
                      onCopyHex={() => void handleCopyHex(column.hex)}
                      onToggleShades={() =>
                        setShadesOpenRole((current) => (current === role ? null : role))
                      }
                      onOpenInfo={() => onOpenDetails(column.hex)}
                    />
                  </div>
                ) : null}

                {showShades ? (
                  <PaletteShadesOverlay
                    hex={column.hex}
                    canApply={canApplyShade}
                    onSelectShade={(hex) => {
                      replaceRole(role, hex);
                      setShadesOpenRole(null);
                    }}
                    onClose={() => setShadesOpenRole(null)}
                  />
                ) : null}

                {locked ? (
                  <span
                    className={`absolute z-10 size-2 rounded-full bg-white/80 ${
                      expanded ? 'right-3 top-3' : 'right-1 top-1 size-1.5'
                    }`}
                    aria-label="Bloqueado"
                  />
                ) : null}

                {column.contrastBadges && column.contrastBadges.length > 0 ? (
                  <div
                    className={`absolute z-10 flex max-w-[calc(100%-0.5rem)] flex-col gap-0.5 ${
                      expanded ? 'left-2 top-2 gap-1' : 'left-0.5 top-0.5'
                    }`}
                  >
                    {column.contrastBadges.map((badge) => (
                      <ContrastBadge
                        key={badge.label}
                        ratio={badge.ratio}
                        level={badge.level}
                        status={badge.status}
                        target="AA"
                        compact
                        contextLabel={badge.label}
                      />
                    ))}
                  </div>
                ) : null}

                {!showShades ? (
                  <div className={`w-full text-center ${expanded ? 'mt-auto space-y-0.5' : ''}`}>
                    <span
                      className={`block max-w-full truncate font-semibold uppercase tracking-wide opacity-90 ${
                        expanded ? 'text-[0.6875rem]' : 'px-0.5 text-[0.5625rem]'
                      }`}
                    >
                      {role}
                    </span>
                    {expanded ? (
                      <>
                        <p className="font-mono text-[clamp(0.875rem,2vw,1.25rem)] font-semibold tracking-[0.06em]">
                          {column.hex.replace('#', '').toUpperCase()}
                        </p>
                        <p className="max-w-full truncate px-1 text-[clamp(0.75rem,1.6vw,0.9375rem)] font-medium tracking-[0.01em] opacity-90">
                          {column.name}
                        </p>
                        {column.roleLabel ? (
                          <p className="text-[0.6875rem] font-medium opacity-75">{column.roleLabel}</p>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
