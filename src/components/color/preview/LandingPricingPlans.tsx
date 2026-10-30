'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PLANS } from './landingPreviewData';
import { vividFill } from './previewColor';
import { Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, headingStyle, type PreviewFonts } from './previewTypography';

type LandingPricingPlansProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingPricingPlans({ colors, fonts, onEditSlot }: LandingPricingPlansProps) {
  return (
    <div className="grid gap-4 @min-[720px]/landing:gap-5 @min-[720px]/landing:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] @min-[720px]/landing:items-stretch">
      {PLANS.map((plan) => {
        const featured = 'featured' in plan && plan.featured;
        const swatch = plan.slot === 'primaryAction' ? colors.primaryAction : colors[plan.slot];
        const fill = featured ? vividFill(swatch, colors.surface) : swatch;
        const onFill = featured ? colors.primaryActionText : colors.text;

        return (
          <PreviewSlotTarget
            key={plan.name}
            slot={featured ? 'primaryAction' : plan.slot}
            onEditSlot={onEditSlot}
            className={`flex flex-col rounded-[14px] border transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
              featured ? 'p-6 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.4)]' : 'preview-surface p-4'
            }`}
            style={
              featured
                ? { backgroundColor: fill, borderColor: 'transparent', color: onFill }
                : { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }
            }
          >
            {featured ? null : (
              <span className="mb-4 h-1 w-8 rounded-full" style={{ backgroundColor: swatch }} />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span style={featured ? captionStyle(fonts, onFill) : captionStyle(fonts, colors.mutedText)}>
                {plan.name}
              </span>
              {featured ? (
                <Tag
                  label="El del estudio"
                  color={onFill}
                  surfaceHex={fill}
                  slot="primaryActionText"
                  onEditSlot={onEditSlot}
                />
              ) : null}
            </div>
            <div className="mt-4 flex items-baseline gap-1 tabular-nums" style={headingStyle(fonts)}>
              {plan.price}
              <span style={captionStyle(fonts, featured ? onFill : colors.mutedText)}>/mes</span>
            </div>
            <p className="mt-3 text-pretty" style={bodyStyle(fonts, featured ? onFill : colors.mutedText)}>
              {plan.tagline}
            </p>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
