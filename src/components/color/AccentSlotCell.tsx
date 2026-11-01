'use client';

import { pickReadableTextColor, prefersLightSelectionRing } from '@lib/color/readableText';

import { PaletteSlotOverflowMenu } from './PaletteSlotOverflowMenu';
import { PaletteToolbarIconButton } from './PaletteToolbarIconButton';
import { CopyIcon, InfoIcon, RandomColorIcon } from './paletteToolbarIcons';
import { useT, useTx } from '@/context/I18nContext';

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
  const tx = useTx();
  const t = useT();
  const assigned = hex !== null;
  const fill = hex ?? 'var(--color-surface-raised)';
  const textColor = assigned ? pickReadableTextColor(hex) : 'var(--color-muted)';
  const lightChrome = assigned ? prefersLightSelectionRing(hex) : true;
  const mobileExpanded = expanded && !isWideLayout;

  const desktopToolbar = (
    <div className="pointer-events-none absolute z-10 flex inset-x-0 top-4 justify-center opacity-0 transition-opacity group-hover/accent:opacity-100 group-focus-within/accent:opacity-100">
      <div className="pointer-events-auto flex items-center gap-1.5">
        {editable ? (
          <PaletteToolbarIconButton
            label={t('ui.AccentSlotCell.variar', { label: tx(label) })}
            lightChrome={lightChrome}
            onClick={onVary}
          >
            <RandomColorIcon />
          </PaletteToolbarIconButton>
        ) : null}
        {assigned ? (
          <>
            <PaletteToolbarIconButton
              label={t('ui.AccentSlotCell.copiar-hex')}
              lightChrome={lightChrome}
              onClick={onCopyHex}
            >
              <CopyIcon />
            </PaletteToolbarIconButton>
            <PaletteToolbarIconButton
              label={t('ui.AccentSlotCell.ver-info-del-color')}
              lightChrome={lightChrome}
              onClick={() => onOpenDetails(hex)}
            >
              <InfoIcon />
            </PaletteToolbarIconButton>
          </>
        ) : null}
      </div>
    </div>
  );

  const overflowItems = [
    ...(editable
      ? [{ id: 'vary', label: `Variar ${label}`, onSelect: onVary }]
      : []),
    ...(assigned
      ? [
          { id: 'copy', label: 'Copiar HEX', onSelect: onCopyHex },
          {
            id: 'info',
            label: tx('Info del color'),
            onSelect: () => onOpenDetails(hex),
          },
        ]
      : []),
  ];

  return (
    <li className="relative flex min-h-0 min-w-0 flex-1">
      <div
        className={`group/accent relative flex w-full text-inherit transition-shadow ${
          expanded
            ? isWideLayout
              ? 'min-h-24 flex-row items-center justify-start gap-5 px-7 py-6'
              : 'min-h-[5.75rem] flex-row items-center justify-between gap-3 px-4 py-3'
            : 'h-16 px-1 pb-1.5 pt-6'
        } ${isActive ? 'z-[1] shadow-[inset_0_0_0_2px] shadow-primary' : ''} ${
          !assigned
            ? 'border border-dashed border-muted/60 [background-image:linear-gradient(135deg,transparent_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_40%,color-mix(in_oklch,var(--color-muted)_22%,transparent)_55%,transparent_55%)] [background-size:10px_10px]'
            : ''
        }`}
        style={{ backgroundColor: fill, color: textColor }}
      >
        {!mobileExpanded ? desktopToolbar : null}

        <button
          type="button"
          aria-pressed={isActive}
          aria-label={
            assigned
              ? mobileExpanded
                ? t('ui.AccentSlotCell.tocar-para-copiar-hex', { label: tx(label), name: tx(name), hex })
                : `${label}: ${name}, ${hex}`
              : t('ui.AccentSlotCell.sin-asignar', { label: tx(label) })
          }
          onClick={() => {
            onSelect();
            if (mobileExpanded && assigned) {
              onCopyHex();
            }
          }}
          className={`min-w-0 cursor-pointer border-0 bg-transparent text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            expanded
              ? `flex-1 text-left ${mobileExpanded ? 'pr-1' : ''}`
              : 'h-full w-full text-center'
          }`}
        >
          <span
            className={`block max-w-full truncate font-medium tracking-normal ${
              expanded
                ? mobileExpanded
                  ? 'text-[0.8125rem] leading-snug'
                  : 'text-chrome-label'
                : 'px-0.5 text-chrome-caption'
            }`}
          >
            {tx(label)}
          </span>
          {expanded ? (
            mobileExpanded ? (
              <div className="min-w-0">
                <p className="mt-0.5 min-w-0 truncate text-[1.1875rem] font-semibold leading-snug">
                  {assigned ? name : t('ui.AccentSlotCell.sin-asignar-2')}
                </p>
                {assigned ? (
                  <p className="mt-0.5 font-mono text-[0.875rem] font-semibold tracking-normal">
                    {hex.toUpperCase()}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="mt-0.5 max-w-full truncate text-[1.375rem] font-semibold leading-tight">
                  {assigned ? name : t('ui.AccentSlotCell.sin-asignar-2')}
                </p>
                {assigned ? (
                  <p className="font-mono text-[0.875rem] font-semibold tracking-normal">
                    {hex.toUpperCase()}
                  </p>
                ) : null}
              </>
            )
          ) : null}
        </button>

        {mobileExpanded && overflowItems.length > 0 ? (
          <PaletteSlotOverflowMenu
            label={t('ui.AccentSlotCell.mas-acciones-de', { label: tx(label) })}
            lightChrome={lightChrome}
            items={overflowItems}
          />
        ) : null}
      </div>
    </li>
  );
}
