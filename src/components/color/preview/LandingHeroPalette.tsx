import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { STUDIO_TRAIL } from './landingPreviewData';
import { onVividFill } from './previewColor';
import { labelStyle, type PreviewFonts } from './previewTypography';

type LandingHeroPaletteProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

const PLACEMENT = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-2 row-span-1',
] as const;

/** Asymmetric palette board for the landing hero — color as the visual, not equal cards. */
export function LandingHeroPalette({ colors, fonts, onEditSlot }: LandingHeroPaletteProps) {
  return (
    <div
      className="grid h-full min-h-[13.5rem] grid-cols-3 grid-rows-3 gap-2 sm:min-h-[15rem] sm:gap-2.5"
      aria-label="Paleta del estudio"
    >
      {STUDIO_TRAIL.map((item, index) => {
        const fill = colors[item.slot];
        const ink = onVividFill(fill);

        return (
          <PreviewSlotTarget
            key={item.label}
            slot={item.slot}
            onEditSlot={onEditSlot}
            className={`${PLACEMENT[index]} group relative flex min-h-0 flex-col justify-end overflow-hidden rounded-[14px] p-3 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            style={{ backgroundColor: fill, color: ink }}
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)' }}
              aria-hidden="true"
            />
            <span className="relative truncate" style={{ ...labelStyle(fonts), fontWeight: 600 }}>
              {item.label}
            </span>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
