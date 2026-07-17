'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingFeatureGrid } from './LandingFeatureGrid';
import { LandingHero } from './LandingHero';
import { LandingPricingPlans } from './LandingPricingPlans';
import { LandingTestimonialCard } from './LandingTestimonialCard';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { LANDING_NAV } from './landingPreviewData';
import { onVividFill, vividFill } from './previewColor';
import {
  bodyStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  labelStyle,
  previewRootTypeStyle,
  type PreviewFonts,
} from './previewTypography';

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

export const LANDING_CONTAINER_CLASS = '@container/landing';

export function LandingLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${LANDING_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <header
        className="preview-rise flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 lg:px-6"
        style={{
          backgroundColor: colors.chrome,
          borderColor: colors.divider,
          animationDelay: previewStaggerDelay(0),
        }}
      >
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="flex min-w-0 flex-1 items-center justify-between gap-3"
          style={{ backgroundColor: colors.chrome }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-transform duration-200 ease-out hover:rotate-[-4deg] motion-reduce:transition-none motion-reduce:hover:rotate-0"
              style={{ backgroundColor: primaryFill, color: onPrimary }}
            >
              <span className="text-sm font-black" aria-label="Craftie, perro diseñador">
                C
              </span>
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={headingStyle(fonts)}>
              Craftie
            </PreviewSlotTarget>
          </div>

          <nav className="hidden items-center gap-5 @min-[640px]/landing:flex" aria-label="Secciones">
            {LANDING_NAV.map((item) => (
              <span key={item} style={labelStyle(fonts, colors.mutedText)}>
                {item}
              </span>
            ))}
          </nav>

          <PreviewSlotTarget
            slot="secondaryAction"
            onEditSlot={onEditSlot}
            className="inline-flex min-h-9 items-center rounded-[10px] border px-3.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{
              ...labelStyle(fonts),
              backgroundColor: colors.secondaryAction ?? colors.surface,
              borderColor: colors.border,
              color: colors.secondaryActionText ?? colors.text,
            }}
          >
            Empezar
          </PreviewSlotTarget>
        </PreviewSlotTarget>
      </header>

      <LandingHero colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

      <main className="flex flex-col gap-6 p-4 sm:gap-7 sm:p-5 lg:p-6">
        <PreviewSlotTarget
          slot="supportSurface"
          onEditSlot={onEditSlot}
          className="preview-rise rounded-[14px] px-4 py-5 sm:px-5 sm:py-6"
          style={{
            backgroundColor: colors.supportSurface ?? colors.surface,
            color: colors.supportSurfaceText ?? colors.text,
            animationDelay: previewStaggerDelay(2),
          }}
        >
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Cómo pinta Craftie
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="supportSurfaceText"
            onEditSlot={onEditSlot}
            className="mt-2 max-w-[48ch] text-pretty opacity-85"
            style={bodyStyle(fonts)}
          >
            Tres gestos. Sin teatro. La paleta llega lista para verse en contexto.
          </PreviewSlotTarget>
          <div className="mt-6">
            <LandingFeatureGrid colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          </div>
        </PreviewSlotTarget>

        <section
          className="preview-rise grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5"
          style={{ animationDelay: previewStaggerDelay(5) }}
        >
          <LandingTestimonialCard colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          <div className="flex min-w-0 flex-col">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Kits del estudio
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="mt-2 max-w-[42ch] text-pretty"
              style={bodyStyle(fonts, colors.mutedText)}
            >
              Del boceto al atelier. El plan Estudio es el que Craftie usa.
            </PreviewSlotTarget>
            <div className="mt-4">
              <LandingPricingPlans colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
            </div>
          </div>
        </section>
      </main>
    </PreviewSlotTarget>
  );
}
