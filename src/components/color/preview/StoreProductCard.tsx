'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { buttonPairOn } from './previewButtons';
import { onVividFill, vividFill } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PreviewIcon } from './previewIcons';
import { StoreProductArt, STORE_SHAPES } from './StoreProductArt';
import { formatStorePrice, type StoreProduct } from './storePreviewData';
import {
  brandStyle,
  buttonStyle,
  captionStyle,
  type PreviewFonts,
  titleStyle,
} from './previewTypography';

export function StoreProductCard({
  product,
  swatchHex,
  index,
  colors,
  fonts,
  inCart,
  onToggle,
  onEditSlot,
}: {
  product: StoreProduct;
  swatchHex: string;
  index: number;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  inCart: boolean;
  onToggle: () => void;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const button = buttonPairOn(colors, colors.surface);
  const dots = [colors.brand1, colors.brand2, colors.brand3, colors.brand4];
  const accentFill = vividFill(colors.accent, colors.surface);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="group preview-surface preview-lift flex flex-col overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="relative">
        <StoreProductArt
          colors={colors}
          shape={STORE_SHAPES[index % STORE_SHAPES.length]!}
          slot={product.slot}
          swatchHex={swatchHex}
          onEditSlot={onEditSlot}
          className="aspect-[4/3] w-full"
        />
        {product.badge ? (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-0.5"
            style={{ ...captionStyle(fonts), backgroundColor: accentFill, color: onVividFill(accentFill) }}
          >
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 @min-[900px]/store:p-5">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
          {product.name}
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          {product.detail}
        </PreviewSlotTarget>
        <div className="mt-1 flex items-center gap-1" aria-label="Colores disponibles">
          {[0, 1, 2].map((offset) => (
            <span
              key={offset}
              aria-hidden="true"
              className="size-3.5 rounded-full"
              style={{ backgroundColor: dots[(index + offset) % dots.length], boxShadow: `0 0 0 2px ${colors.surface}` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={titleStyle(fonts)}>
            {formatStorePrice(product.price)}
          </PreviewSlotTarget>
          <button
            type="button"
            aria-pressed={inCart}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="min-h-9 rounded-lg border px-3 transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
            style={{
              ...buttonStyle(fonts),
              backgroundColor: inCart ? 'transparent' : button.fill,
              borderColor: inCart ? colors.text : button.fill,
              color: inCart ? colors.text : button.on,
            }}
          >
            {inCart ? (
              <span className="inline-flex items-center gap-1.5">
                <PreviewIcon name="check" size={13} />
                En el carrito
              </span>
            ) : (
              'Añadir'
            )}
          </button>
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
