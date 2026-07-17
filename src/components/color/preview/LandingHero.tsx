'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingHeroPalette } from './LandingHeroPalette';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { HERO_COPY } from './landingPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { bodyStyle, heroStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingHeroProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingHero({ colors, fonts, onEditSlot }: LandingHeroProps) {
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);
  const onHero = colors.onHero ?? colors.primaryActionText;

  return (
    <PreviewSlotTarget
      slot="heroSurface"
      onEditSlot={onEditSlot}
      className="preview-rise px-4 py-8 sm:px-5 sm:py-10 lg:px-6 lg:py-11"
      style={{
        backgroundColor: colors.heroSurface ?? colors.primaryAction,
        color: onHero,
        animationDelay: previewStaggerDelay(0),
      }}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="text-pretty opacity-90"
            style={labelStyle(fonts)}
          >
            {HERO_COPY.kicker}
          </PreviewSlotTarget>

          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="mt-2" style={heroStyle(fonts)}>
            Craftie
          </PreviewSlotTarget>

          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="mt-3 max-w-[34ch] text-pretty"
            style={{ ...titleStyle(fonts), fontSize: '1.125rem', lineHeight: 1.35 }}
          >
            {HERO_COPY.headline}
          </PreviewSlotTarget>

          <PreviewSlotTarget
            slot="onHero"
            onEditSlot={onEditSlot}
            className="mt-3 max-w-[48ch] text-pretty opacity-85"
            style={bodyStyle(fonts)}
          >
            {HERO_COPY.body}
          </PreviewSlotTarget>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="inline-flex min-h-11 items-center rounded-[10px] px-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(0_0_0/0.12)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
              style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimary }}
            >
              {HERO_COPY.primaryCta}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="secondaryAction"
              onEditSlot={onEditSlot}
              className="inline-flex min-h-11 items-center rounded-[10px] border bg-transparent px-4 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)]"
              style={{
                ...labelStyle(fonts),
                borderColor: onHero,
                color: colors.secondaryActionText ?? onHero,
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
