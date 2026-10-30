import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

/** Table still life for the shop hero: plate, vase, bowl and sun, each a solid palette color. */
export function StoreHeroArt({
  colors,
  wash,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  wash: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[22rem]" aria-hidden="true">
      <span className="absolute left-[8%] top-[8%] size-[20%] rounded-full" style={{ backgroundColor: colors.accent }} />
      <PreviewSlotTarget
        slot="brand2"
        onEditSlot={onEditSlot}
        className="absolute bottom-[22%] left-[14%] h-[62%] w-[26%] rounded-t-[45%] rounded-b-2xl shadow-[0_18px_26px_-16px_rgb(0_0_0/0.45)]"
        style={{ backgroundColor: colors.brand2 }}
      />
      <PreviewSlotTarget
        slot="brand1"
        onEditSlot={onEditSlot}
        className="absolute bottom-[22%] left-[38%] size-[34%] rounded-full shadow-[0_18px_26px_-16px_rgb(0_0_0/0.45)]"
        style={{ backgroundColor: colors.brand1 }}
      />
      <PreviewSlotTarget
        slot="brand4"
        onEditSlot={onEditSlot}
        className="absolute bottom-[22%] right-[8%] h-[24%] w-[28%] rounded-b-full shadow-[0_14px_22px_-14px_rgb(0_0_0/0.45)]"
        style={{ backgroundColor: colors.brand4 }}
      />
      <span className="absolute inset-x-0 bottom-[18%] h-1.5 rounded-full" style={{ backgroundColor: colors.brand3 }} />
      <span className="absolute inset-x-[6%] bottom-0 h-[18%] rounded-t-xl" style={{ backgroundColor: wash, filter: 'brightness(0.94)' }} />
    </div>
  );
}
