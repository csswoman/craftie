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
          expanded ? 'h-full min-h-[420px] flex-1 flex-col divide-y divide-white/10' : 'h-16 shrink-0 border-t border-border'
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
            <li key={column.id} className="relative flex min-h-0 min-w-0 flex-1">
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
                className={`group/slot relative flex w-full cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  expanded
                    ? 'min-h-24 flex-row items-center justify-start gap-5 px-7 py-6'
                    : 'h-16 px-1 pb-1.5 pt-6'
                } ${isActive ? 'z-[1] shadow-[inset_0_0_0_2px] shadow-primary' : ''}`}
                style={{ backgroundColor: column.hex, color: textColor }}
              >
                {!showShades ? (
                  <div
                    className="contents"
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
                      expanded ? 'right-4 top-4' : 'right-1 top-1 size-1.5'
                    }`}
                    aria-label="Bloqueado"
                  />
                ) : null}

                {!expanded && column.contrastBadges && column.contrastBadges.length > 0 ? (
                  <div
                    className="absolute left-0.5 top-0.5 z-10 flex max-w-[calc(100%-0.75rem)] flex-col gap-1"
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
                  <div className={`${expanded ? 'min-w-0 max-w-[28rem] text-left' : 'w-full text-center'}`}>
                    <span
                      className={`block max-w-full truncate font-semibold uppercase tracking-wide opacity-80 ${
                        expanded ? 'text-[0.6875rem]' : 'px-0.5 text-[0.5625rem]'
                      }`}
                    >
                      {column.roleLabel ?? role}
                    </span>
                    {expanded ? (
                      <>
                        <p className="mt-1 max-w-full truncate text-[1.375rem] font-extrabold leading-tight">
                          {column.name}
                        </p>
                        <p className="font-mono text-[0.875rem] font-semibold tracking-normal opacity-90">
                          {column.hex.toUpperCase()}
                        </p>
                        {column.contrastBadges && column.contrastBadges.length > 0 ? (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {column.contrastBadges.map((badge) => (
                              <ContrastBadge
                                key={badge.label}
                                ratio={badge.ratio}
                                level={badge.level}
                                status={badge.status}
                                target="AA"
                                compact
                              />
                            ))}
                          </div>
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
