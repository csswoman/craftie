import type { ResolvedLayoutColors, UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { readableInk } from './previewColor';
import { STUDIO_STEPS } from './landingPreviewData';
import { bodyStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

/** Brand color as numeral ink: hue kept, lightness moved to AA on the section surface. */
function stepAccent(colors: ResolvedLayoutColors, slot: UiLayoutSlot): string {
  const surface = colors.supportSurface ?? colors.surface;
  return readableInk(colors[slot] ?? colors.accent, surface);
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
    <ol className="flex flex-col gap-8 @min-[720px]/landing:flex-row @min-[720px]/landing:gap-8">
      {STUDIO_STEPS.map((item, index) => {
        const accent = stepAccent(colors, item.slot);

        return (
          <li
            key={item.title}
            className="preview-rise flex min-w-0 gap-4 @min-[720px]/landing:flex-1"
            style={{ animationDelay: previewStaggerDelay(index + 3) }}
          >
            <PreviewSlotTarget
              slot={item.slot}
              onEditSlot={onEditSlot}
              className="tabular-nums"
              style={{ ...headingStyle(fonts), color: accent }}
            >
              {index + 1}
            </PreviewSlotTarget>
            <div className="flex min-w-0 flex-col gap-2">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
                {item.title}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="max-w-[34ch] text-pretty"
                style={bodyStyle(fonts, colors.mutedText)}
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
