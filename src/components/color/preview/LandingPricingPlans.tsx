'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { PLANS } from './landingPreviewData';
import { Tag } from './previewPrimitives';
import type { PreviewFonts } from './previewTypography';

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
              <span className="text-[0.75rem] font-bold">{plan.name}</span>
              {featured ? <Tag label="Popular" color={onVividFill(fill)} slot="primaryActionText" onEditSlot={onEditSlot} /> : null}
            </div>
            <div className="mt-2 text-[1.375rem] font-extrabold leading-none" style={{ fontFamily: fonts.headingFamily }}>
              {plan.price}
              <span className="text-[0.6875rem] font-semibold opacity-70">/mo</span>
            </div>
            <p className="mt-2 text-[0.6875rem] leading-snug opacity-80">{plan.tagline}</p>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
