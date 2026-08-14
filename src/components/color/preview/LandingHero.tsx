'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingHeroPalette } from './LandingHeroPalette';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { HERO_COPY, LANDING_GUTTER_CLASS } from './landingPreviewData';
import { vividFill } from './previewColor';
import { bodyStyle, captionStyle, heroStyle, labelStyle, type PreviewFonts } from './previewTypography';

type LandingHeroProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingHero({ colors, fonts, onEditSlot }: LandingHeroProps) {
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = colors.primaryActionText;
  const onHero = colors.onHero ?? colors.primaryActionText;

  return (
    <PreviewSlotTarget
      slot="heroSurface"
      onEditSlot={onEditSlot}
      className={`preview-rise py-12 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:py-16`}
      style={{
        backgroundColor: colors.heroSurface ?? colors.primaryAction,
        color: onHero,
        animationDelay: previewStaggerDelay(1),
      }}
    >
      <div className="grid gap-8 @min-[720px]/landing:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.8fr)] @min-[720px]/landing:items-start @min-[720px]/landing:gap-10">
        <div className="min-w-0">
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} style={captionStyle(fonts)}>
            {HERO_COPY.kicker}
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="secondaryAction"
            onEditSlot={onEditSlot}
            className="mt-2 h-0.5 w-8 rounded-full"
            style={{ backgroundColor: colors.secondaryAction }}
          />

          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="mt-3 max-w-[16ch]"
            style={heroStyle(fonts)}
          >
            {HERO_COPY.headline}
          </PreviewSlotTarget>

          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="mt-4 max-w-[46ch] text-pretty"
            style={bodyStyle(fonts)}
          >
            {HERO_COPY.body}
          </PreviewSlotTarget>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="inline-flex min-h-11 items-center rounded-[10px] px-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(0_0_0/0.12)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
              style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimary }}
            >
              {HERO_COPY.primaryCta}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="onHero"
              onEditSlot={onEditSlot}
              className="inline-flex min-h-11 items-center rounded-[10px] border bg-transparent px-4 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_12%,transparent)]"
              style={{
                ...labelStyle(fonts),
                fontWeight: 500,
                borderColor: onHero,
                color: onHero,
              }}
            >
              {HERO_COPY.secondaryCta}
            </PreviewSlotTarget>
          </div>
        </div>

        <LandingHeroPalette colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </div>
    </PreviewSlotTarget>
  );
}
