'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { BILLING, PROOF_POINTS, type LandingBilling } from './landingPreviewData';
import { SegmentedControl, Tag, tint } from './previewPrimitives';
import { bodyStyle, displayStyle, heroStyle, labelStyle, type PreviewFonts } from './previewTypography';

type LandingHeroProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  billing: LandingBilling;
  price: string;
  onBillingChange: (billing: LandingBilling) => void;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingHero({
  colors,
  fonts,
  billing,
  price,
  onBillingChange,
  onEditSlot,
}: LandingHeroProps) {
  const primaryFill = vividFill(colors.primaryAction, colors.surface);

  return (
    <PreviewSlotTarget
      slot="heroSurface"
      onEditSlot={onEditSlot}
      className="px-5 py-8 sm:px-7 lg:px-8 lg:py-10"
      style={{ backgroundColor: colors.heroSurface ?? colors.primaryAction, color: colors.onHero ?? colors.primaryActionText }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] lg:items-end">
        <div className="min-w-0">
          <Tag label="Launch system" color={colors.onHero ?? colors.primaryActionText} surfaceHex={colors.heroSurface ?? colors.surface} slot="onHero" onEditSlot={onEditSlot} />
          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="preview-rise mt-3 max-w-2xl"
            style={heroStyle(fonts)}
          >
            Ship the brand story with fewer loose ends.
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="mt-4 max-w-[52ch] opacity-85" style={bodyStyle(fonts)}>
            A focused landing experience where the primary tone carries the hero, the call to action stays obvious, and supporting surfaces keep the message calm.
          </PreviewSlotTarget>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="rounded-lg px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
              style={{ ...labelStyle(fonts), backgroundColor: primaryFill, color: onVividFill(primaryFill) }}
            >
              Start trial
            </PreviewSlotTarget>
            <SegmentedControl
              options={BILLING}
              value={billing}
              onChange={(next) => onBillingChange(next as LandingBilling)}
              trackColor={colors.onHero ?? colors.primaryActionText}
              activeColor={tint(colors.onHero ?? colors.primaryActionText, 90)}
              activeText={colors.primaryAction}
              mutedText={colors.onHero ?? colors.primaryActionText}
              trackSlot="onHero"
              onEditSlot={onEditSlot}
            />
            <span className="tabular-nums opacity-90" style={labelStyle(fonts)}>{price}/mo</span>
          </div>
        </div>

        <PreviewSlotTarget
          slot="supportSurface"
          onEditSlot={onEditSlot}
          className="rounded-xl border p-4 transition-transform duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: colors.supportSurface ?? colors.surface, borderColor: colors.onHero ?? colors.primaryActionText, color: colors.supportSurfaceText ?? colors.text }}
        >
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="opacity-75" style={{ ...labelStyle(fonts), letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            This quarter
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="mt-2" style={displayStyle(fonts)}>
            38 launches
          </PreviewSlotTarget>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {PROOF_POINTS.map((item, index) => (
              <div key={item.label} className="rounded-lg border px-2.5 py-2 transition-transform duration-200 hover:-translate-y-0.5" style={{ borderColor: colors.onHero ?? colors.primaryActionText }}>
                <PreviewSlotTarget
                  slot={item.slot}
                  onEditSlot={onEditSlot}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: [colors.data1, colors.data2, colors.data3][index] }}
                />
                <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="mt-3 leading-snug opacity-90" style={labelStyle(fonts)}>
                  {item.label}
                </PreviewSlotTarget>
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
