'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PLANS } from './landingPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { Tag } from './previewPrimitives';
import { bodyStyle, displayStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingPricingPlansProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingPricingPlans({ colors, fonts, onEditSlot }: LandingPricingPlansProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const featured = 'featured' in plan && plan.featured;
        const swatch = plan.slot === 'primaryAction' ? colors.primaryAction : colors[plan.slot];
        const fill = featured ? vividFill(swatch, colors.surface) : swatch;
        const onFill = onVividFill(fill);

        return (
          <PreviewSlotTarget
            key={plan.name}
            slot={featured ? 'primaryAction' : plan.slot}
            onEditSlot={onEditSlot}
            className="flex min-h-[7.5rem] flex-col rounded-[14px] border p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(0_0_0/0.06)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
            style={
              featured
                ? { backgroundColor: fill, borderColor: 'transparent', color: onFill }
                : { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span style={labelStyle(fonts)}>{plan.name}</span>
              {featured ? (
                <Tag
                  label="El de Craftie"
                  color={onFill}
                  surfaceHex={fill}
                  slot="primaryActionText"
                  onEditSlot={onEditSlot}
                />
              ) : null}
            </div>
            <div className="mt-3 tabular-nums" style={displayStyle(fonts)}>
              {plan.price}
              <span className="opacity-70" style={titleStyle(fonts)}>
                /mo
              </span>
            </div>
            <p className="mt-2 leading-snug opacity-85" style={bodyStyle(fonts)}>
              {plan.tagline}
            </p>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
