'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingContrastProof } from './LandingContrastProof';
import { LandingHeroPalette } from './LandingHeroPalette';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { HERO_COPY, LANDING_GUTTER_CLASS } from './landingPreviewData';
import { heroButtonPair, paletteTint } from './previewButtons';
import { bodyStyle, buttonStyle, heroStyle, type PreviewFonts } from './previewTypography';

type LandingHeroProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingHero({ colors, fonts, onEditSlot }: LandingHeroProps) {
  const hero = colors.heroSurface ?? colors.primaryAction;
  const onHero = colors.onHero ?? colors.primaryActionText;
  const button = heroButtonPair(colors);

  return (
    <PreviewSlotTarget
      slot="heroSurface"
      onEditSlot={onEditSlot}
      className={`preview-rise relative overflow-hidden py-12 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:py-16`}
      style={{ backgroundColor: hero, color: onHero, animationDelay: previewStaggerDelay(1) }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full @min-[720px]/landing:size-96"
        style={{ backgroundColor: paletteTint(onHero, hero, 0.1) }}
      />
      <div className="relative grid gap-10 @min-[720px]/landing:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)] @min-[720px]/landing:items-center @min-[720px]/landing:gap-12">
        <div className="min-w-0">
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="max-w-[14ch]" style={heroStyle(fonts)}>
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
              className="inline-flex min-h-11 items-center rounded-[10px] px-5 shadow-[0_10px_22px_-12px_rgb(0_0_0/0.45)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ ...buttonStyle(fonts), backgroundColor: button.fill, color: button.on }}
            >
              {HERO_COPY.primaryCta}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="onHero"
              onEditSlot={onEditSlot}
              className="inline-flex min-h-11 items-center rounded-[10px] border bg-transparent px-5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_12%,transparent)]"
              style={{ ...buttonStyle(fonts), borderColor: onHero, color: onHero }}
            >
              {HERO_COPY.secondaryCta}
            </PreviewSlotTarget>
          </div>

          <LandingContrastProof colors={colors} fonts={fonts} buttonPair={button} onEditSlot={onEditSlot} />
        </div>

        <LandingHeroPalette colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </div>
    </PreviewSlotTarget>
  );
}
