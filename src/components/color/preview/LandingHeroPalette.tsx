import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { HERO_COPY, STUDIO_TRAIL } from './landingPreviewData';
import { onVividFill } from './previewColor';
import { captionStyle, labelStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

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

/** Asymmetric palette board for the hero: each swatch names its step; no hex, it is a page, not the tool. */
export function LandingHeroPalette({ colors, fonts, onEditSlot }: LandingHeroPaletteProps) {
  const tx = useTx();
  const t = useT();
  const onHero = colors.onHero ?? colors.primaryActionText;

  return (
    <figure className="m-0 min-w-0">
      <div
        className="grid min-h-[13rem] grid-cols-3 grid-rows-3 gap-2 @min-[720px]/landing:min-h-[17rem]"
        aria-label={t('ui.LandingHeroPalette.paleta-del-estudio')}
      >
        {STUDIO_TRAIL.map((item, index) => {
          const fill = colors[item.slot];
          const ink = onVividFill(fill);

          return (
            <PreviewSlotTarget
              key={item.label}
              slot={item.slot}
              onEditSlot={onEditSlot}
              className={`${PLACEMENT[index]} preview-rise preview-lift flex min-h-0 flex-col justify-end rounded-[14px] p-3 shadow-[0_14px_24px_-16px_rgb(0_0_0/0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
              style={{ backgroundColor: fill, color: ink, animationDelay: `${180 + index * 90}ms` }}
            >
              <span className="truncate" style={labelStyle(fonts)}>
                {tx(item.label)}
              </span>
            </PreviewSlotTarget>
          );
        })}
      </div>
      <figcaption className="mt-3" style={captionStyle(fonts, onHero)}>
        {tx(HERO_COPY.kicker)}
      </figcaption>
    </figure>
  );
}
