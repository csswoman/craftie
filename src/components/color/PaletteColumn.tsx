'use client';

import type { PaletteColumnDisplay } from '@lib/color/paletteDisplay';
import { pickReadableTextColor } from '@lib/color/readableText';

import { PaletteColumnToolbar } from './PaletteColumnToolbar';
import { PaletteShadesOverlay } from './PaletteShadesOverlay';

export type PaletteColumnProps = {
  column: PaletteColumnDisplay;
  index: number;
  total: number;
  locked: boolean;
  showShades: boolean;
  editable: boolean;
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
  const canApplyShade = editable && !locked;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${column.name}`}
      onClick={() => {
        if (!showShades) {
          onSelectColor(column.hex);
        }
      }}
      onKeyDown={(event) => {
        if (showShades) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectColor(column.hex);
        }
      }}
      className="group/column relative flex w-full cursor-pointer flex-col items-center justify-end px-3 pb-6 pt-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={{ backgroundColor: column.hex, color: textColor }}
    >
      <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <PaletteColumnToolbar
          locked={locked}
          editable={editable}
          canMoveLeft={editable && index > 0}
          canMoveRight={editable && index < total - 1}
          showShades={showShades}
          onToggleLock={onToggleLock}
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          onCopyHex={onCopyHex}
          onToggleShades={onToggleShades}
          onOpenInfo={onOpenInfo}
        />
      </div>

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
          aria-label="Color bloqueado"
        />
      ) : null}

      {!showShades ? (
        <div className="mt-auto space-y-0.5 text-center">
          <p className="font-mono text-[clamp(0.875rem,2vw,1.25rem)] font-semibold tracking-[0.06em]">
            {column.hex.replace('#', '').toUpperCase()}
          </p>
          <p className="text-[clamp(0.75rem,1.6vw,0.9375rem)] font-medium tracking-[0.01em] opacity-90">
            {column.name}
          </p>
          {column.roleLabel ? (
            <p className="text-[0.6875rem] font-medium opacity-75">{column.roleLabel}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
