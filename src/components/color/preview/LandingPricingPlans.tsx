'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PLANS } from './landingPreviewData';
import { paletteTint } from './previewButtons';
import { Tag } from './previewPrimitives';
import { compactBodyStyle, captionStyle, headingStyle, type PreviewFonts } from './previewTypography';

type LandingPricingPlansProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

/** Plain plans wear a light wash of their own palette color; the featured plan is the solid action color. */
export function LandingPricingPlans({ colors, fonts, onEditSlot }: LandingPricingPlansProps) {
  return (
    <div className="grid gap-4 @min-[720px]/landing:gap-5 @min-[720px]/landing:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] @min-[720px]/landing:items-stretch">
      {PLANS.map((plan) => {
        const featured = 'featured' in plan && plan.featured;
        const swatch = plan.slot === 'primaryAction' ? colors.primaryAction : colors[plan.slot];
        const fill = featured ? colors.primaryAction : paletteTint(swatch, colors.appBackground, 0.16);
        const onFill = featured ? colors.primaryActionText : readableOn(colors.text, fill);
        const muted = featured ? colors.primaryActionText : readableOn(colors.mutedText, fill);

        return (
          <PreviewSlotTarget
            key={plan.name}
            slot={featured ? 'primaryAction' : plan.slot}
            onEditSlot={onEditSlot}
            className={`flex flex-col rounded-[14px] transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${featured ? 'p-6 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.45)]' : 'p-5'
              }`}
            style={{ backgroundColor: fill, color: onFill }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span style={captionStyle(fonts, muted)}>{plan.name}</span>
              {featured ? (
                <Tag
                  label="El del estudio"
                  color={onFill}
                  surfaceHex={fill}
                  slot="primaryActionText"
                  onEditSlot={onEditSlot}
                />
              ) : (
                <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: swatch }} />
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1 tabular-nums" style={headingStyle(fonts)}>
              {plan.price}
              <span style={captionStyle(fonts, muted)}>/mes</span>
            </div>
            <p className="mt-3 text-pretty" style={compactBodyStyle(fonts, muted)}>
              {plan.tagline}
            </p>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
