'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { LandingFeatureGrid } from './LandingFeatureGrid';
import { PreviewSiteFooter } from './PreviewSiteFooter';
import { LandingHero } from './LandingHero';
import { LandingPricingPlans } from './LandingPricingPlans';
import { LandingTestimonialCard } from './LandingTestimonialCard';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { LANDING_FOOTER_LINKS, LANDING_GUTTER_CLASS, LANDING_NAV } from './landingPreviewData';
import { vividFill } from './previewColor';
import {
  bodyStyle,
  brandStyle,
  buttonStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  labelStyle,
  type PreviewFonts,
  previewRootTypeStyle,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

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
  'brand1',
  'brand2',
  'brand3',
  'brand4',
  'success',
] as const;

export const LANDING_CONTAINER_CLASS = 'preview-root @container/landing';

export function LandingLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = colors.primaryActionText;
  const support = colors.supportSurface ?? colors.surface;
  const onSupport = colors.supportSurfaceText ?? colors.text;

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${LANDING_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{
        backgroundColor: colors.appBackground,
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
            <span className="text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-heading)' }} aria-label={t('ui.LandingLayoutPreview.craftie-perro-disenador')}>
              C
            </span>
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={brandStyle(fonts)}>{t('ui.LandingLayoutPreview.craftie')}</PreviewSlotTarget>
        </div>

        <nav className="hidden items-center gap-6 justify-self-center @min-[560px]/landing:flex" aria-label={t('ui.LandingLayoutPreview.secciones')}>
          {LANDING_NAV.map((item) => (
            <span key={item} style={labelStyle(fonts, colors.mutedText)}>
              {tx(item)}
            </span>
          ))}
        </nav>

        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="inline-flex min-h-11 items-center justify-self-end rounded-[10px] border px-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          style={{
            ...buttonStyle(fonts),
            backgroundColor: 'transparent',
            borderColor: colors.border,
            color: colors.text,
          }}
        >{t('ui.LandingLayoutPreview.entrar')}</PreviewSlotTarget>
      </header>

      <LandingHero colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

      <PreviewSlotTarget
        slot="supportSurface"
        onEditSlot={onEditSlot}
        className={`preview-rise border-t py-10 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:py-14`}
        style={{
          backgroundColor: support,
          color: onSupport,
          borderColor: colors.divider,
          animationDelay: previewStaggerDelay(2),
        }}
      >
        <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} style={headingStyle(fonts)}>{t('ui.LandingLayoutPreview.del-color-a-la-guia')}</PreviewSlotTarget>
        <PreviewSlotTarget
          slot="supportSurfaceText"
          onEditSlot={onEditSlot}
          className="mt-2 max-w-[52ch] text-pretty"
          style={bodyStyle(fonts)}
        >{t('ui.LandingLayoutPreview.tres-pasos-el-contraste-se')}</PreviewSlotTarget>
        <div className="mt-8 @min-[720px]/landing:mt-10">
          <LandingFeatureGrid colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </div>
      </PreviewSlotTarget>

      <main className={`pb-12 pt-12 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:pb-16 @min-[720px]/landing:pt-16`}>
        <section className="preview-rise" style={{ animationDelay: previewStaggerDelay(5) }}>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>{t('ui.LandingLayoutPreview.planes')}</PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="mt-2 max-w-[48ch] text-pretty"
            style={bodyStyle(fonts, colors.mutedText)}
          >{t('ui.LandingLayoutPreview.estudio-incluye-guia-contraste-y')}</PreviewSlotTarget>
          <div className="mt-6">
            <LandingPricingPlans colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          </div>
        </section>
      </main>

      <LandingTestimonialCard colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      <PreviewSiteFooter
        colors={colors}
        fonts={fonts}
        brand="Craftie"
        legal="© 2026 Estudio Craftie"
        links={LANDING_FOOTER_LINKS}
        gutterClass={LANDING_GUTTER_CLASS}
        onEditSlot={onEditSlot}
      />
    </PreviewSlotTarget>
  );
}
