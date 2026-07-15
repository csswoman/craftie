'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { PLANS } from './landingPreviewData';
import { Tag } from './previewPrimitives';
import { bodyStyle, displayStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingPricingPlansProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingPricingPlans({ colors, fonts, onEditSlot }: LandingPricingPlansProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const featured = 'featured' in plan && plan.featured;
        const swatch = plan.slot === 'primaryAction' ? colors.primaryAction : colors[plan.slot];
        const fill = featured ? vividFill(swatch, colors.surface) : swatch;

        return (
          <PreviewSlotTarget
            key={plan.name}
            slot={featured ? 'primaryAction' : plan.slot}
            onEditSlot={onEditSlot}
            className="rounded-xl border p-3.5 transition-transform duration-200 hover:-translate-y-0.5"
            style={
              featured
                ? { backgroundColor: fill, borderColor: 'transparent', color: onVividFill(fill) }
                : { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span style={labelStyle(fonts)}>{plan.name}</span>
        {featured ? <Tag label="Popular" color={onVividFill(fill)} surfaceHex={fill} slot="primaryActionText" onEditSlot={onEditSlot} /> : null}
            </div>
            <div className="mt-2 tabular-nums" style={displayStyle(fonts)}>
              {plan.price}
              <span className="opacity-70" style={titleStyle(fonts)}>/mo</span>
            </div>
            <p className="mt-2 leading-snug opacity-80" style={bodyStyle(fonts)}>{plan.tagline}</p>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
