'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { previewStaggerDelay } from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { onVividFill, vividFill } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { StoreProductCard } from './StoreProductCard';
import {
  getShippingNote,
  STORE_CONTAINER_CLASS,
  STORE_FILTERS,
  STORE_GUTTER_CLASS,
  STORE_NAV,
  STORE_PRODUCTS,
} from './storePreviewData';
import {
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  heroStyle,
  labelStyle,
  previewRootTypeStyle,
  titleStyle,
  type PreviewFonts,
} from './previewTypography';

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
  'data1',
  'data2',
  'data3',
  'data4',
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
  const [filter, setFilter] = useState<string>(STORE_FILTERS[0]);
  const [cart, setCart] = useState<string[]>([]);
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const swatches = [colors.data1, colors.data2, colors.data3, colors.data4];
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
      className={`${STORE_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className={`preview-rise flex items-center justify-between gap-4 border-b py-4 ${STORE_GUTTER_CLASS}`}
        style={{ backgroundColor: colors.chrome, borderColor: colors.divider, animationDelay: previewStaggerDelay(0) }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Casa Barro
        </PreviewSlotTarget>
        <nav className="hidden items-center gap-6 @min-[560px]/store:flex" aria-label="Categorías">
          {STORE_NAV.map((item) => (
            <span key={item} style={captionStyle(fonts, colors.mutedText)}>
              {item}
            </span>
          ))}
        </nav>
        <span className="flex items-center gap-3" style={{ color: colors.mutedText }}>
          <PreviewIcon name="search" size={18} />
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={labelStyle(fonts)}>
            Carrito ({cart.length})
          </PreviewSlotTarget>
        </span>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="success"
        onEditSlot={onEditSlot}
        className={`flex items-center gap-2 py-2 ${STORE_GUTTER_CLASS}`}
        style={{
          ...captionStyle(fonts),
          backgroundColor: vividFill(colors.success, colors.surface),
          color: onVividFill(vividFill(colors.success, colors.surface)),
        }}
      >
        <PreviewIcon name="check" size={14} />
        <span role="status">{getShippingNote(cartTotal)}</span>
      </PreviewSlotTarget>

      <section className={`preview-rise py-10 ${STORE_GUTTER_CLASS}`} style={{ animationDelay: previewStaggerDelay(1) }}>
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[18ch]" style={heroStyle(fonts)}>
          Objetos para la mesa de cada día
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 max-w-[48ch] text-pretty" style={{ ...titleStyle(fonts), fontWeight: 400, color: colors.mutedText }}>
          Piezas hechas en pequeñas tiradas, con materiales que envejecen bien.
        </PreviewSlotTarget>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar productos">
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
                  ...labelStyle(fonts),
                  backgroundColor: active ? primaryFill : 'transparent',
                  borderColor: active ? primaryFill : colors.border,
                  color: active ? onVividFill(primaryFill) : colors.text,
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 @min-[520px]/store:grid-cols-2 @min-[900px]/store:grid-cols-4">
          {visible.map((product) => (
            <StoreProductCard
              key={product.name}
              product={product}
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
    </PreviewSlotTarget>
  );
}
