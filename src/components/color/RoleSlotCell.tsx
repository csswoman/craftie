'use client';

import type { PaletteColumnDisplay } from '@lib/color/paletteDisplay';
import { pickReadableTextColor, prefersLightSelectionRing } from '@lib/color/readableText';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import { ContrastBadge } from '@/components/color-engine/ContrastBadge';

import { PaletteColumnToolbar } from './PaletteColumnToolbar';
import { PaletteShadesOverlay } from './PaletteShadesOverlay';

export type RoleSlotCellProps = {
  column: PaletteColumnDisplay;
  role: PaletteRoleId;
  isActive: boolean;
  locked: boolean;
  showShades: boolean;
  expanded: boolean;
  editable: boolean;
  isWideLayout: boolean;
  onSelectRole: (role: PaletteRoleId) => void;
  onOpenDetails: (hex: string) => void;
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
  onToggleLock: () => void;
  onCopyHex: () => void;
  onToggleShades: () => void;
  onSelectShade: (hex: string) => void;
  onCloseShades: () => void;
};

export function RoleSlotCell({
  column,
  role,
  isActive,
  locked,
  showShades,
  expanded,
  editable,
  isWideLayout,
  onSelectRole,
  onOpenDetails,
  onEditRole,
  onToggleLock,
  onCopyHex,
  onToggleShades,
  onSelectShade,
  onCloseShades,
}: RoleSlotCellProps) {
  const textColor = pickReadableTextColor(column.hex);
  const lightChrome = prefersLightSelectionRing(column.hex);
  const canApplyShade = editable && !locked;
  const mobileExpanded = expanded && !isWideLayout;
  const toolbarProps = {
    hoverGroup: 'slot' as const,
    locked,
    editable,
    canMoveLeft: false,
    canMoveRight: false,
    showShades,
    lightChrome,
    onToggleLock,
    onMoveLeft: () => undefined,
    onMoveRight: () => undefined,
    onCopyHex,
    onToggleShades,
    onOpenInfo: () => onOpenDetails(column.hex),
  };

  return (
    <li className="relative flex min-h-0 min-w-0 flex-1">
      <div
        className={`group/slot relative flex w-full text-inherit transition-shadow ${
          expanded
            ? isWideLayout
              ? 'min-h-24 flex-row items-center justify-start gap-5 px-7 py-6'
              : 'min-h-[5.25rem] flex-row items-center justify-between gap-3 px-4 py-3'
            : 'h-16 px-1 pb-1.5 pt-6'
        } ${isActive ? 'z-[1] shadow-[inset_0_0_0_2px] shadow-primary' : ''}`}
        style={{ backgroundColor: column.hex, color: textColor }}
      >
        {!showShades && isWideLayout ? (
          <PaletteColumnToolbar {...toolbarProps} />
        ) : null}

        {showShades ? (
          <PaletteShadesOverlay
            hex={column.hex}
            canApply={canApplyShade}
            onSelectShade={onSelectShade}
            onClose={onCloseShades}
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
          <div className="absolute left-0.5 top-0.5 z-10 flex max-w-[calc(100%-0.75rem)] flex-col gap-1">
            {column.contrastBadges.map((badge) => (
              <ContrastBadge
                key={badge.label}
                ratio={badge.ratio}
                level={badge.level}
                status={badge.status}
                target="AA"
                compact
                dense={mobileExpanded}
                contextLabel={badge.label}
              />
            ))}
          </div>
        ) : null}

        {!showShades ? (
          <button
            type="button"
            aria-pressed={isActive}
            aria-label={`${column.roleLabel ?? role}: ${column.name}, ${column.hex}`}
            onClick={() => onSelectRole(role)}
            onDoubleClick={(event) => {
              event.preventDefault();
              if (onEditRole) {
                onEditRole(role, event.currentTarget);
                return;
              }
              onOpenDetails(column.hex);
            }}
            className={`min-w-0 cursor-pointer border-0 bg-transparent text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              expanded
                ? `flex-1 text-left ${mobileExpanded ? 'pr-1' : ''}`
                : 'h-full w-full text-center'
            }`}
          >
            <span
              className={`block max-w-full truncate font-medium tracking-normal opacity-90 ${
                expanded
                  ? mobileExpanded
                    ? 'text-[0.6875rem] leading-tight'
                    : 'text-chrome-label'
                  : 'px-0.5 text-chrome-caption'
              }`}
            >
              {column.roleLabel ?? role}
            </span>
            {expanded ? (
              <>
                {mobileExpanded ? (
                  <div className="flex min-w-0 items-baseline gap-1.5">
                    <p className="min-w-0 truncate text-[1rem] font-semibold leading-tight">
                      {column.name}
                    </p>
                    <p className="shrink-0 font-mono text-[0.6875rem] font-semibold tracking-normal opacity-90">
                      {column.hex.toUpperCase()}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-0.5 max-w-full truncate text-[1.375rem] font-semibold leading-tight">
                      {column.name}
                    </p>
                    <p className="font-mono text-[0.875rem] font-semibold tracking-normal opacity-90">
                      {column.hex.toUpperCase()}
                    </p>
                  </>
                )}
                {column.contrastBadges && column.contrastBadges.length > 0 ? (
                  <div
                    className={`flex flex-wrap items-center ${
                      mobileExpanded ? 'mt-1 gap-1' : 'mt-2 gap-1.5'
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
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </button>
        ) : null}

        {!showShades && mobileExpanded ? (
          <PaletteColumnToolbar
            {...toolbarProps}
            layout="inline"
            alwaysVisible
          />
        ) : null}
      </div>
    </li>
  );
}
