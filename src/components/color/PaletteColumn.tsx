'use client';

import type { PaletteColumnDisplay } from '@lib/color/paletteDisplay';
import { pickReadableTextColor, prefersLightSelectionRing } from '@lib/color/readableText';

import { ContrastBadge } from '@/components/color-engine/ContrastBadge';

import { PaletteColumnToolbar } from './PaletteColumnToolbar';
import { PaletteShadesOverlay } from './PaletteShadesOverlay';

export type PaletteColumnProps = {
  column: PaletteColumnDisplay;
  index: number;
  total: number;
  locked: boolean;
  showShades: boolean;
  editable: boolean;
  allowReorder?: boolean;
  onToggleLock: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onCopyHex: () => void;
  onToggleShades: () => void;
  onOpenInfo: () => void;
  onSelectColor: (hex: string) => void;
  onApplyShade: (hex: string) => void;
};

export function PaletteColumn({
  column,
  index,
  total,
  locked,
  showShades,
  editable,
  allowReorder = true,
  onToggleLock,
  onMoveLeft,
  onMoveRight,
  onCopyHex,
  onToggleShades,
  onOpenInfo,
  onSelectColor,
  onApplyShade,
}: PaletteColumnProps) {
  const textColor = pickReadableTextColor(column.hex);
  const lightChrome = prefersLightSelectionRing(column.hex);
  const canApplyShade = editable && !locked;
  const columnLabel = locked
    ? `${column.name}, ${column.hex}, color bloqueado`
    : `${column.name}, ${column.hex}`;

  return (
    <article
      aria-label={columnLabel}
      className="group/column relative flex w-full flex-col items-center justify-end px-3 pb-4 pt-8"
      style={{ backgroundColor: column.hex, color: textColor }}
    >
      {!showShades ? (
        <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <PaletteColumnToolbar
            locked={locked}
            editable={editable}
            canMoveLeft={allowReorder && editable && index > 0}
            canMoveRight={allowReorder && editable && index < total - 1}
            showShades={showShades}
            lightChrome={lightChrome}
            onToggleLock={onToggleLock}
            onMoveLeft={onMoveLeft}
            onMoveRight={onMoveRight}
            onCopyHex={onCopyHex}
            onToggleShades={onToggleShades}
            onOpenInfo={onOpenInfo}
          />
        </div>
      ) : null}

      {showShades ? (
        <PaletteShadesOverlay
          hex={column.hex}
          canApply={canApplyShade}
          onSelectShade={onApplyShade}
          onClose={onToggleShades}
        />
      ) : null}

      {locked ? (
        <span
          className="absolute right-3 top-3 z-10 size-2 rounded-full bg-white/80"
          aria-hidden="true"
          title="Color bloqueado"
        />
      ) : null}

      {column.contrastBadges?.some((badge) => badge.status === 'fail') ? (
        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-col gap-1">
          {column.contrastBadges
            .filter((badge) => badge.status === 'fail')
            .map((badge) => (
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
        <button
          type="button"
          onClick={() => onSelectColor(column.hex)}
          aria-label={`Seleccionar ${column.name}`}
          className="mt-auto w-full space-y-0.5 rounded-md text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <p className="font-mono text-[clamp(0.875rem,2vw,1.25rem)] font-semibold tracking-[0.06em]">
            {column.hex.replace('#', '').toUpperCase()}
          </p>
          <p className="max-w-full truncate px-1 text-[clamp(0.75rem,1.6vw,0.9375rem)] font-medium tracking-[0.01em] opacity-90">
            {column.name}
          </p>
          {column.roleLabel ? (
            <p className="text-chrome-caption font-medium opacity-75">{column.roleLabel}</p>
          ) : null}
        </button>
      ) : null}
    </article>
  );
}
