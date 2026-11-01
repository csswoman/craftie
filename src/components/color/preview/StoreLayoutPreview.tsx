'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { previewStaggerDelay } from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { buttonPairOn, paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PreviewSiteFooter } from './PreviewSiteFooter';
import { StoreHeroArt } from './StoreHeroArt';
import { StoreProductCard } from './StoreProductCard';
import {
  getShippingNote,
  STORE_CONTAINER_CLASS,
  STORE_FILTERS,
  STORE_FOOTER_LINKS,
  STORE_GUTTER_CLASS,
  STORE_NAV,
  STORE_PRODUCTS,
} from './storePreviewData';
import {
  bodyStyle,
  buttonStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  heroStyle,
  labelStyle,
  type PreviewFonts,
  previewRootTypeStyle,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

export const STORE_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
  'primaryAction',
  'primaryActionText',
  'accent',
  'success',
  'brand1',
  'brand2',
  'brand3',
  'brand4',
] as const;

export function StoreLayoutPreview({
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
  const [filter, setFilter] = useState<string>(STORE_FILTERS[0]);
  const [cart, setCart] = useState<string[]>([]);
  const filterButton = buttonPairOn(colors, colors.appBackground);
  const heroWash = paletteTint(colors.brand3, colors.appBackground, 0.16);
  const heroButton = buttonPairOn(colors, heroWash);
  const heroInk = readableOn(colors.text, heroWash);
  const heroMuted = readableOn(colors.mutedText, heroWash);
  const shipWash = paletteTint(colors.success, colors.appBackground, 0.2);
  const shipInk = readableOn(colors.text, shipWash);
  const swatches = [colors.brand1, colors.brand2, colors.brand3, colors.brand4];
  const visible = STORE_PRODUCTS.filter(
    (product) => filter === 'Todo' || (filter === 'Nuevo' ? product.badge === 'Nuevo' : product.badge !== undefined),
  );
  const cartTotal = STORE_PRODUCTS.filter((product) => cart.includes(product.name)).reduce(
    (sum, product) => sum + product.price,
    0,
  );

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${STORE_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{
        backgroundColor: colors.appBackground,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className={`preview-rise flex items-center justify-between gap-4 py-4 ${STORE_GUTTER_CLASS}`}
        style={{ backgroundColor: colors.chrome, animationDelay: previewStaggerDelay(0) }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>{t('ui.StoreLayoutPreview.casa-barro')}</PreviewSlotTarget>
        <nav className="hidden items-center gap-6 @min-[560px]/store:flex" aria-label={t('ui.StoreLayoutPreview.categorias')}>
          {STORE_NAV.map((item) => (
            <span key={item} style={labelStyle(fonts, colors.mutedText)}>
              {tx(item)}
            </span>
          ))}
        </nav>
        <span className="flex items-center gap-3" style={{ color: colors.mutedText }}>
          <PreviewIcon name="search" size={18} />
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={labelStyle(fonts)}>{t('ui.StoreLayoutPreview.carrito', { length: cart.length })}</PreviewSlotTarget>
        </span>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="success"
        onEditSlot={onEditSlot}
        className={`flex items-center gap-2 py-2.5 ${STORE_GUTTER_CLASS}`}
        style={{
          ...captionStyle(fonts),
          backgroundColor: shipWash,
          color: shipInk,
        }}
      >
        <PreviewIcon name="check" size={14} />
        <span role="status">{tx(getShippingNote(cartTotal))}</span>
      </PreviewSlotTarget>

      <section className={`preview-rise py-8 ${STORE_GUTTER_CLASS} @min-[720px]/store:py-12`} style={{ animationDelay: previewStaggerDelay(1) }}>
        {/* The art column has no bottom/right padding so the plinth runs off the hero's edges. */}
        <div
          className="grid gap-6 overflow-hidden rounded-2xl pl-6 pt-6 @min-[720px]/store:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @min-[720px]/store:gap-8 @min-[720px]/store:pl-10 @min-[720px]/store:pt-10"
          style={{ backgroundColor: heroWash, color: heroInk }}
        >
          <div className="min-w-0 self-center pb-2 pr-6 @min-[720px]/store:pb-10 @min-[720px]/store:pr-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[16ch]" style={{ ...heroStyle(fonts), color: heroInk }}>{t('ui.StoreLayoutPreview.objetos-para-la-mesa-de')}</PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 max-w-[44ch] text-pretty" style={bodyStyle(fonts, heroMuted)}>{t('ui.StoreLayoutPreview.piezas-hechas-en-pequenas-tiradas')}</PreviewSlotTarget>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="mt-6 inline-flex min-h-11 items-center rounded-[10px] px-5"
              style={{ ...buttonStyle(fonts), backgroundColor: heroButton.fill, color: heroButton.on }}
            >{t('ui.StoreLayoutPreview.ver-novedades')}</PreviewSlotTarget>
          </div>
          <div className="ml-auto w-full min-w-0 max-w-[26rem] self-end @min-[720px]/store:max-w-none">
            <StoreHeroArt colors={colors} wash={heroWash} ink={heroInk} onEditSlot={onEditSlot} />
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>{t('ui.StoreLayoutPreview.recien-salido-del-horno')}</PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
            {visible.length} {visible.length === 1 ? 'pieza' : 'piezas'}
          </PreviewSlotTarget>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('ui.StoreLayoutPreview.filtrar-productos')}>
            {STORE_FILTERS.map((option) => {
              const active = option === filter;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                  className="min-h-9 rounded-full border px-4"
                  style={{
                    ...buttonStyle(fonts),
                    backgroundColor: active ? filterButton.fill : colors.surface,
                    borderColor: active ? filterButton.fill : colors.border,
                    color: active ? filterButton.on : colors.text,
                  }}
                >
                  {tx(option)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 @min-[520px]/store:grid-cols-2 @min-[900px]/store:grid-cols-4 @min-[900px]/store:gap-5">
          {visible.map((product) => (
            <StoreProductCard
              key={product.name}
              product={product}
              index={STORE_PRODUCTS.indexOf(product)}
              swatchHex={swatches[STORE_PRODUCTS.indexOf(product)] ?? colors.accent}
              colors={colors}
              fonts={fonts}
              inCart={cart.includes(product.name)}
              onToggle={() =>
                setCart((current) =>
                  current.includes(product.name)
                    ? current.filter((name) => name !== product.name)
                    : [...current, product.name],
                )
              }
              onEditSlot={onEditSlot}
            />
          ))}
        </div>
      </section>

      <PreviewSiteFooter
        colors={colors}
        fonts={fonts}
        brand="Casa Barro"
        legal="© 2026 Casa Barro"
        links={STORE_FOOTER_LINKS}
        gutterClass={STORE_GUTTER_CLASS}
        onEditSlot={onEditSlot}
      />
    </PreviewSlotTarget>
  );
}
