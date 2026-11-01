'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PLANS } from './landingPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewIcon } from './previewIcons';
import { Tag } from './previewPrimitives';
import {
  buttonStyle,
  captionStyle,
  compactBodyStyle,
  displayStyle,
  labelStyle,
  type PreviewFonts,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

type LandingPricingPlansProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

/** Plain plans wear a light wash of their own palette color; the featured plan is the solid action color. */
export function LandingPricingPlans({ colors, fonts, onEditSlot }: LandingPricingPlansProps) {
  const tx = useTx();
  const t = useT();
  return (
    // Each plan spans five shared rows (header, price, tagline, features, CTA) so dividers and buttons line up across plans.
    <div className="grid grid-rows-[repeat(5,auto)] gap-x-4 gap-y-4 @min-[720px]/landing:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] @min-[720px]/landing:grid-rows-[auto_auto_auto_1fr_auto] @min-[720px]/landing:gap-x-5">
      {PLANS.map((plan) => {
        const featured = 'featured' in plan && plan.featured;
        const swatch = plan.slot === 'primaryAction' ? colors.primaryAction : colors[plan.slot];
        const fill = featured ? colors.primaryAction : paletteTint(swatch, colors.appBackground, 0.16);
        const onFill = featured ? colors.primaryActionText : readableOn(colors.text, fill);
        const muted = featured ? colors.primaryActionText : readableOn(colors.mutedText, fill);
        // Only the featured plan gets a filled button; the others use an outline so one action leads.
        const cta = featured
          ? { fill: colors.primaryActionText, on: colors.primaryAction, border: 'transparent' }
          : { fill: 'transparent', on: onFill, border: `color-mix(in srgb, ${onFill} 35%, transparent)` };

        return (
          <PreviewSlotTarget
            key={plan.name}
            slot={featured ? 'primaryAction' : plan.slot}
            onEditSlot={onEditSlot}
            className={`row-span-5 grid grid-rows-subgrid gap-y-0 rounded-[14px] p-6 ${featured ? 'shadow-[0_24px_40px_-24px_rgb(0_0_0/0.45)]' : ''}`}
            style={{ backgroundColor: fill, color: onFill }}
          >
            <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
              <span style={labelStyle(fonts, onFill)}>{tx(plan.name)}</span>
              {featured ? (
                <Tag
                  label={t('ui.LandingPricingPlans.el-del-estudio')}
                  color={onFill}
                  surfaceHex={fill}
                  slot="primaryActionText"
                  onEditSlot={onEditSlot}
                />
              ) : (
                <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: swatch }} />
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1 tabular-nums">
              <span style={{ ...displayStyle(fonts), lineHeight: 1.05 }}>{tx(plan.price)}</span>
              <span style={captionStyle(fonts, muted)}>{t('ui.LandingPricingPlans.mes')}</span>
            </div>
            <p className="mt-2 text-pretty" style={compactBodyStyle(fonts, muted)}>
              {tx(plan.tagline)}
            </p>
            <ul
              className="mb-6 mt-5 space-y-2.5 border-t pt-5"
              style={{ borderColor: `color-mix(in srgb, ${onFill} 18%, transparent)` }}
            >
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2" style={compactBodyStyle(fonts, onFill)}>
                  <PreviewIcon name="check" size={13} strokeWidth={2.5} />
                  {tx(feature)}
                </li>
              ))}
            </ul>
            <span
              className="inline-flex min-h-10 items-center justify-center rounded-[10px] border px-4"
              style={{ ...buttonStyle(fonts), backgroundColor: cta.fill, color: cta.on, borderColor: cta.border }}
            >
              {tx(plan.cta)}
            </span>
          </PreviewSlotTarget>
        );
      })}
    </div>
  );
}
