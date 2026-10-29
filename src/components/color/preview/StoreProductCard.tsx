'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { onVividFill, vividFill } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { tint } from './previewPrimitives';
import { formatStorePrice, type StoreProduct } from './storePreviewData';
import { captionStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
      className="flex flex-col overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="relative aspect-[4/3]" style={{ backgroundColor: tint(swatchHex, 82) }} aria-hidden="true">
        <span
          className="absolute bottom-3 left-3 size-10 rounded-full"
          style={{ backgroundColor: swatchHex }}
        />
        {product.badge ? (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-0.5"
            style={{ ...captionStyle(fonts), fontWeight: 600, backgroundColor: accentFill, color: onVividFill(accentFill) }}
          >
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
          {product.name}
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          {product.detail}
        </PreviewSlotTarget>
        <div className="mt-3 flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={{ ...labelStyle(fonts), fontSize: 'var(--size-body)' }}>
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
              ...labelStyle(fonts),
              backgroundColor: inCart ? 'transparent' : primaryFill,
              borderColor: inCart ? colors.border : primaryFill,
              color: inCart ? colors.text : onVividFill(primaryFill),
            }}
          >
            {inCart ? 'En el carrito ✓' : 'Añadir'}
          </button>
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
