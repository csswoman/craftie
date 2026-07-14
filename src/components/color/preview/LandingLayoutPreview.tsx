'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingFeatureGrid } from './LandingFeatureGrid';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { Avatar, SegmentedControl, Tag, tint } from './previewPrimitives';
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
] as const;

const BILLING = ['Monthly', 'Annual'] as const;

export function LandingLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [billing, setBilling] = useState<(typeof BILLING)[number]>('Monthly');
  const price = billing === 'Monthly' ? '$38' : '$29';
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const proofPoints = [
    { label: 'Faster approval', slot: 'data1' },
    { label: 'Reusable launch kit', slot: 'data2' },
    { label: 'Accessible by default', slot: 'data3' },
  ] as const;

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

      <PreviewSlotTarget
        slot="heroSurface"
        onEditSlot={onEditSlot}
        className="px-5 py-8 sm:px-7 lg:px-8 lg:py-10"
        style={{ backgroundColor: colors.heroSurface ?? colors.primaryAction, color: colors.onHero ?? colors.primaryActionText }}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div className="min-w-0">
            <Tag label="Launch system" color={colors.onHero ?? colors.primaryActionText} slot="onHero" onEditSlot={onEditSlot} />
            <PreviewSlotTarget
              slot="onHero"
              onEditSlot={onEditSlot}
              className="preview-rise mt-3 max-w-2xl text-[2rem] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-[2.4rem] lg:text-[3rem]"
              style={{ fontFamily: fonts.headingFamily }}
            >
              Ship the brand story with fewer loose ends.
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed opacity-85 lg:text-[1rem]">
              A focused landing experience where the primary tone carries the hero, the call to action stays obvious, and supporting surfaces keep the message calm.
            </PreviewSlotTarget>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PreviewSlotTarget
                slot="primaryAction"
                onEditSlot={onEditSlot}
                className="rounded-lg px-4 py-2.5 text-[0.8125rem] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
                style={{ backgroundColor: primaryFill, color: onVividFill(primaryFill) }}
              >
                Start trial
              </PreviewSlotTarget>
              <SegmentedControl
                options={BILLING}
                value={billing}
                onChange={(next) => setBilling(next as (typeof BILLING)[number])}
                trackColor={colors.onHero ?? colors.primaryActionText}
                activeColor={tint(colors.onHero ?? colors.primaryActionText, 90)}
                activeText={colors.primaryAction}
                mutedText={colors.onHero ?? colors.primaryActionText}
                trackSlot="onHero"
                onEditSlot={onEditSlot}
              />
              <span className="text-[0.75rem] font-bold tabular-nums opacity-90">{price}/mo</span>
            </div>
          </div>

          <PreviewSlotTarget
            slot="supportSurface"
            onEditSlot={onEditSlot}
            className="rounded-xl border p-4 transition-transform duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: colors.supportSurface ?? colors.surface, borderColor: colors.onHero ?? colors.primaryActionText, color: colors.supportSurfaceText ?? colors.text }}
          >
            <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold opacity-75">
              This quarter
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="mt-2 text-[1.375rem] font-bold leading-none" style={{ fontFamily: fonts.headingFamily }}>
              38 launches
            </PreviewSlotTarget>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {proofPoints.map((item, index) => (
                <div key={item.label} className="rounded-lg border px-2.5 py-2 transition-transform duration-200 hover:-translate-y-0.5" style={{ borderColor: colors.onHero ?? colors.primaryActionText }}>
                  <PreviewSlotTarget
                    slot={item.slot}
                    onEditSlot={onEditSlot}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: [colors.data1, colors.data2, colors.data3][index] }}
                  />
                  <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="mt-3 text-[0.6875rem] font-semibold leading-snug opacity-90">
                    {item.label}
                  </PreviewSlotTarget>
                </div>
              ))}
            </div>
          </PreviewSlotTarget>
        </div>
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
        </PreviewSlotTarget>

        <PreviewSlotTarget
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="rounded-xl border p-5 transition-transform duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        >
          <div className="flex items-center gap-3">
            <Avatar initials="JM" color={colors.primaryAction} slot="primaryAction" onEditSlot={onEditSlot} />
            <div className="min-w-0">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.8125rem] font-bold">
                Jordan Mejía
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={{ color: colors.mutedText }}>
                Head of Brand, Aster
              </PreviewSlotTarget>
            </div>
          </div>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 flex items-center gap-0.5" style={{ color: colors.primaryAction }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <PreviewIcon key={index} name="heart" size={11} strokeWidth={2} />
            ))}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-3 text-[0.8125rem] leading-relaxed">
            &ldquo;Shortened our launch cycle by half without losing the parts of our brand that make it recognizable.&rdquo;
          </PreviewSlotTarget>
          <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: colors.border }}>
            {proofPoints.map((item, index) => (
              <div key={item.label} className="flex items-start gap-3">
                <PreviewSlotTarget
                  slot={item.slot}
                  onEditSlot={onEditSlot}
                  className="mt-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: [colors.data1, colors.data2, colors.data3][index] }}
                />
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] leading-relaxed" style={{ color: colors.mutedText }}>
                  {item.label}
                </PreviewSlotTarget>
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </main>
    </PreviewSlotTarget>
  );
}
