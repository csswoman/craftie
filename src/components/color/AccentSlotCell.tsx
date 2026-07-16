'use client';

import { pickReadableTextColor, prefersLightSelectionRing } from '@lib/color/readableText';

import { PaletteToolbarIconButton } from './PaletteToolbarIconButton';
import { CopyIcon, InfoIcon, RandomColorIcon } from './paletteToolbarIcons';

export type AccentSlotCellProps = {
  label: string;
  name: string;
  hex: string | null;
  expanded: boolean;
  editable: boolean;
  isWideLayout: boolean;
  isActive: boolean;
  onSelect: () => void;
  onOpenDetails: (hex: string) => void;
  onVary: () => void;
  onCopyHex: () => void;
};

export function AccentSlotCell({
  label,
  name,
  hex,
  expanded,
  editable,
  isWideLayout,
  isActive,
  onSelect,
  onOpenDetails,
  onVary,
  onCopyHex,
}: AccentSlotCellProps) {
  const assigned = hex !== null;
  const fill = hex ?? 'var(--color-surface-raised)';
  const textColor = assigned ? pickReadableTextColor(hex) : 'var(--color-muted)';
  const lightChrome = assigned ? prefersLightSelectionRing(hex) : true;
  const mobileExpanded = expanded && !isWideLayout;

  const toolbar = (
    <div
      className={`pointer-events-none absolute z-10 flex inset-x-0 top-4 justify-center opacity-0 transition-opacity group-hover/accent:opacity-100 group-focus-within/accent:opacity-100 ${
        mobileExpanded ? 'static opacity-100' : ''
      }`}
    >
      <div className={`pointer-events-auto flex items-center gap-1.5 ${mobileExpanded ? 'flex-row flex-wrap justify-end' : ''}`}>
        {editable ? (
          <PaletteToolbarIconButton
            label={`Variar ${label}`}
            lightChrome={lightChrome}
            compact={mobileExpanded}
            showTooltip={!mobileExpanded}
            onClick={onVary}
          >
            <RandomColorIcon />
          </PaletteToolbarIconButton>
        ) : null}
        {assigned ? (
          <>
            <PaletteToolbarIconButton
              label="Copiar HEX"
              lightChrome={lightChrome}
              compact={mobileExpanded}
              showTooltip={!mobileExpanded}
              onClick={onCopyHex}
            >
              <CopyIcon />
            </PaletteToolbarIconButton>
            <PaletteToolbarIconButton
              label="Ver info del color"
              lightChrome={lightChrome}
              compact={mobileExpanded}
              showTooltip={!mobileExpanded}
              onClick={() => onOpenDetails(hex)}
            >
              <InfoIcon />
            </PaletteToolbarIconButton>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <li className="relative flex min-h-0 min-w-0 flex-1">
      <div
        className={`group/accent relative flex w-full text-inherit transition-shadow ${
          expanded
            ? isWideLayout
              ? 'min-h-24 flex-row items-center justify-start gap-5 px-7 py-6'
              : 'min-h-[5.25rem] flex-row items-center justify-between gap-3 px-4 py-3'
            : 'h-16 px-1 pb-1.5 pt-6'
        } ${isActive ? 'z-[1] shadow-[inset_0_0_0_2px] shadow-primary' : ''} ${
          !assigned
            ? 'border border-dashed border-muted/60 [background-image:linear-gradient(135deg,transparent_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_55%,transparent_55%)] [background-size:10px_10px]'
            : ''
        }`}
        style={{ backgroundColor: fill, color: textColor }}
      >
        {!mobileExpanded ? toolbar : null}

        <button
          type="button"
          aria-pressed={isActive}
          aria-label={assigned ? `${label}: ${name}, ${hex}` : `${label}: sin asignar`}
          onClick={onSelect}
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
            {label}
          </span>
          {expanded ? (
            mobileExpanded ? (
              <div className="flex min-w-0 items-baseline gap-1.5">
                <p className="min-w-0 truncate text-[1rem] font-semibold leading-tight">
                  {assigned ? name : 'Sin asignar'}
                </p>
                {assigned ? (
                  <p className="shrink-0 font-mono text-[0.6875rem] font-semibold tracking-normal opacity-90">
                    {hex.toUpperCase()}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="mt-0.5 max-w-full truncate text-[1.375rem] font-semibold leading-tight">
                  {assigned ? name : 'Sin asignar'}
                </p>
                {assigned ? (
                  <p className="font-mono text-[0.875rem] font-semibold tracking-normal opacity-90">
                    {hex.toUpperCase()}
                  </p>
                ) : null}
              </>
            )
          ) : null}
        </button>

        {mobileExpanded ? toolbar : null}
      </div>
    </li>
  );
}
