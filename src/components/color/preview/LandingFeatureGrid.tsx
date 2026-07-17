import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { STUDIO_STEPS } from './landingPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { bodyStyle, headingStyle, type PreviewFonts } from './previewTypography';

function stepAccent(colors: ResolvedLayoutColors, slot: string): string {
  if (slot === 'data1') return colors.data1;
  if (slot === 'data2') return colors.data2;
  return colors.data3;
}

export function LandingFeatureGrid({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <ol className="grid gap-6 sm:grid-cols-3 sm:gap-6">
      {STUDIO_STEPS.map((item, index) => {
        const accent = stepAccent(colors, item.slot);

        return (
          <li
            key={item.title}
            className="preview-rise flex gap-3 sm:flex-col sm:gap-3"
            style={{ animationDelay: previewStaggerDelay(index + 2) }}
          >
            <PreviewSlotTarget
              slot={item.slot}
              onEditSlot={onEditSlot}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-transform duration-200 ease-out hover:rotate-[-3deg] motion-reduce:transition-none motion-reduce:hover:rotate-0"
              style={{ backgroundColor: accent, color: onVividFill(accent) }}
            >
              <PreviewIcon name={item.icon} size={15} />
            </PreviewSlotTarget>
            <div className="min-w-0">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
                {item.title}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="mt-1.5 max-w-[34ch] text-pretty opacity-80"
                style={bodyStyle(fonts)}
              >
                {item.text}
              </PreviewSlotTarget>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
