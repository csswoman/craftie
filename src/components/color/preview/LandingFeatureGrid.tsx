import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { STUDIO_STEPS } from './landingPreviewData';
import {
  compactBodyStyle,
  brandStyle,
  type PreviewFonts,
} from './previewTypography';
import { useTx } from '@/context/I18nContext';

/** Each step carries its palette color as a solid tile, with an icon that reads on it. */
export function LandingFeatureGrid({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  return (
    <ol className="flex flex-col gap-8 @min-[720px]/landing:flex-row @min-[720px]/landing:gap-10">
      {STUDIO_STEPS.map((item, index) => {
        const fill = colors[item.slot] ?? colors.accent;

        return (
          <li
            key={item.title}
            className="preview-rise flex min-w-0 gap-4 @min-[720px]/landing:flex-1"
            style={{ animationDelay: previewStaggerDelay(index + 3) }}
          >
            <PreviewSlotTarget
              slot={item.slot}
              onEditSlot={onEditSlot}
              className="grid size-11 shrink-0 place-items-center rounded-[12px] shadow-[0_10px_18px_-12px_rgb(0_0_0/0.5)]"
              style={{ backgroundColor: fill, color: onVividFill(fill) }}
            >
              <PreviewIcon name={item.icon} size={18} />
            </PreviewSlotTarget>
            <div className="flex min-w-0 flex-col gap-1.5">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
                {tx(item.title)}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="max-w-[34ch] text-pretty"
                style={compactBodyStyle(fonts, colors.mutedText)}
              >
                {tx(item.text)}
              </PreviewSlotTarget>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
