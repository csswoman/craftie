'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingFeatureGrid } from './LandingFeatureGrid';
import { LandingHero } from './LandingHero';
import { LandingPricingPlans } from './LandingPricingPlans';
import { LandingTestimonialCard } from './LandingTestimonialCard';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { BILLING, LOGOS, type LandingBilling } from './landingPreviewData';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

export const LANDING_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'heroSurface',
  'onHero',
  'primaryAction',
  'primaryActionText',
  'secondaryAction',
  'secondaryActionText',
  'supportSurface',
  'supportSurfaceText',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'data1',
  'data2',
  'data3',
  'data4',
  'success',
] as const;

export function LandingLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [billing, setBilling] = useState<LandingBilling>('Monthly');
  const price = billing === 'Monthly' ? '$38' : '$29';

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className="overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text, fontFamily: fonts.bodyFamily }}
    >
      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className="flex items-center justify-between border-b px-4 py-3 sm:px-6"
        style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
      >
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.875rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
            Northstar
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
            Launch system
          </PreviewSlotTarget>
        </div>
        <PreviewSlotTarget
          slot="secondaryAction"
          onEditSlot={onEditSlot}
          className="rounded-lg border px-3 py-1.5 text-[0.75rem] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: colors.secondaryAction ?? colors.surface, borderColor: colors.border, color: colors.secondaryActionText ?? colors.text }}
        >
          Book demo
        </PreviewSlotTarget>
      </PreviewSlotTarget>

      <LandingHero
        colors={colors}
        fonts={fonts}
        billing={billing}
        price={price}
        onBillingChange={setBilling}
        onEditSlot={onEditSlot}
      />

      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-4 py-3 sm:px-6"
        style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
      >
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold uppercase tracking-wide" style={{ color: colors.mutedText }}>
          Trusted by
        </PreviewSlotTarget>
        {LOGOS.map((logo) => (
          <span key={logo} className="text-[0.75rem] font-bold opacity-60">
            {logo}
          </span>
        ))}
      </PreviewSlotTarget>

      <main className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:p-6">
        <PreviewSlotTarget
          slot="supportSurface"
          onEditSlot={onEditSlot}
          className="rounded-xl border p-5 transition-transform duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: colors.supportSurface ?? colors.surface, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
            Built for campaign teams
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="mt-2 max-w-2xl text-[0.875rem] leading-relaxed" style={{ color: colors.supportSurfaceText ?? colors.mutedText }}>
            Secondary color is reserved for supporting actions and moments of contrast, while body content stays neutral and the palette carries the personality.
          </PreviewSlotTarget>
          <LandingFeatureGrid colors={colors} headingFamily={fonts.headingFamily} onEditSlot={onEditSlot} />
          <LandingPricingPlans colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewSlotTarget>

        <LandingTestimonialCard colors={colors} onEditSlot={onEditSlot} />
      </main>
    </PreviewSlotTarget>
  );
}
