'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingFeatureGrid } from './LandingFeatureGrid';
import { LandingHero } from './LandingHero';
import { LandingPricingPlans } from './LandingPricingPlans';
import { LandingTestimonialCard } from './LandingTestimonialCard';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { LANDING_GUTTER_CLASS, LANDING_NAV } from './landingPreviewData';
import { vividFill } from './previewColor';
import {
  bodyStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  labelStyle,
  previewRootTypeStyle,
  titleStyle,
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
  'supportSurface',
  'supportSurfaceText',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
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
  const onPrimary = colors.primaryActionText;
  const support = colors.supportSurface ?? colors.surface;
  const onSupport = colors.supportSurfaceText ?? colors.text;

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
        className={`preview-rise grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b py-4 ${LANDING_GUTTER_CLASS}`}
        style={{
          backgroundColor: colors.chrome,
          borderColor: colors.divider,
          animationDelay: previewStaggerDelay(0),
        }}
      >
        <div className="flex min-w-0 items-center gap-3 justify-self-start">
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-transform duration-200 ease-out hover:rotate-[-4deg] motion-reduce:transition-none motion-reduce:hover:rotate-0"
            style={{ backgroundColor: primaryFill, color: onPrimary }}
          >
            <span className="text-sm font-medium" aria-label="Craftie, perro diseñador">
              C
            </span>
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={titleStyle(fonts)}>
            Craftie
          </PreviewSlotTarget>
        </div>

        <nav className="hidden items-center gap-6 justify-self-center @min-[560px]/landing:flex" aria-label="Secciones">
          {LANDING_NAV.map((item) => (
            <span key={item} style={captionStyle(fonts, colors.mutedText)}>
              {item}
            </span>
          ))}
        </nav>

        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="inline-flex min-h-11 items-center justify-self-end rounded-[10px] border px-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          style={{
            ...labelStyle(fonts),
            fontWeight: 500,
            backgroundColor: 'transparent',
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          Entrar
        </PreviewSlotTarget>
      </header>

      <LandingHero colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

      <PreviewSlotTarget
        slot="supportSurface"
        onEditSlot={onEditSlot}
        className={`preview-rise border-t py-8 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:py-12`}
        style={{
          backgroundColor: support,
          color: onSupport,
          borderColor: colors.divider,
          animationDelay: previewStaggerDelay(2),
        }}
      >
        <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Del color a la guía
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="supportSurfaceText"
          onEditSlot={onEditSlot}
          className="mt-2 max-w-[52ch] text-pretty"
          style={bodyStyle(fonts)}
        >
          Tres pasos. El contraste se comprueba antes de exportar.
        </PreviewSlotTarget>
        <div className="mt-8">
          <LandingFeatureGrid colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </div>
      </PreviewSlotTarget>

      <main className={`pb-8 pt-12 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:pb-12 @min-[720px]/landing:pt-16`}>
        <section className="preview-rise" style={{ animationDelay: previewStaggerDelay(5) }}>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Planes
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="mt-2 max-w-[48ch] text-pretty"
            style={bodyStyle(fonts, colors.mutedText)}
          >
            Estudio incluye guía, contraste y tipografía.
          </PreviewSlotTarget>
          <div className="mt-6">
            <LandingPricingPlans colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          </div>
        </section>

        <LandingTestimonialCard colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </main>
    </PreviewSlotTarget>
  );
}
