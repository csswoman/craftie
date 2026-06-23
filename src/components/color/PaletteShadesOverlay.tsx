'use client';

import { useMemo } from 'react';

import { getNamedColorShades } from '@lib/color/colorDetails';
import { pickReadableTextColor } from '@lib/color/readableText';

export type PaletteShadesOverlayProps = {
  hex: string;
  canApply: boolean;
  onSelectShade: (hex: string) => void;
  onClose: () => void;
};

export function PaletteShadesOverlay({
  hex,
  canApply,
  onSelectShade,
  onClose,
}: PaletteShadesOverlayProps) {
  const shades = useMemo(() => getNamedColorShades(hex, 10), [hex]);

  return (
    <div
      className="absolute inset-0 z-[5] flex flex-col"
      aria-label="Shades del color"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {shades.map((shade) => {
        const textColor = pickReadableTextColor(shade.hex);
        const isCurrent = shade.hex.toUpperCase() === hex.toUpperCase();

        return (
          <button
            key={shade.hex}
            type="button"
            disabled={!canApply}
            aria-label={
              canApply
                ? `Usar ${shade.name} (${shade.hex})`
                : `${shade.name} (${shade.hex})`
            }
            onClick={() => {
              if (canApply) {
                onSelectShade(shade.hex);
                onClose();
              }
            }}
            className={`group/shade relative flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-1 text-center transition-[filter,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 disabled:cursor-default ${
              canApply ? 'cursor-pointer hover:brightness-110' : ''
            } ${isCurrent ? 'ring-2 ring-inset ring-white/80' : ''}`}
            style={{ backgroundColor: shade.hex, color: textColor }}
          >
            <span className="font-mono text-[clamp(0.625rem,1.4vw,0.8125rem)] font-semibold tracking-[0.05em]">
              {shade.hex.replace('#', '').toUpperCase()}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[clamp(0.5625rem,1.2vw,0.75rem)] font-medium leading-tight opacity-95">
              {shade.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
