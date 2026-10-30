'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { onVividFill, vividFill } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
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
  colors,
  fonts,
  inCart,
  onToggle,
  onEditSlot,
}: {
  product: StoreProduct;
  swatchHex: string;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  inCart: boolean;
  onToggle: () => void;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const accentFill = vividFill(colors.accent, colors.surface);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="group preview-surface preview-lift flex flex-col overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: tint(swatchHex, 82) }} aria-hidden="true">
        <span
          className="preview-zoom absolute -right-6 -top-8 size-32 rounded-full"
          style={{ backgroundColor: tint(swatchHex, 62) }}
        />
        <span
          className="preview-zoom absolute bottom-4 left-4 size-14 rounded-full"
          style={{ backgroundColor: swatchHex, boxShadow: '0 14px 20px -10px rgb(0 0 0 / 0.35)' }}
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
              backgroundColor: inCart ? 'transparent' : primaryFill,
              borderColor: inCart ? colors.border : primaryFill,
              color: inCart ? colors.text : onVividFill(primaryFill),
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
