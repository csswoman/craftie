import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { paletteTint } from './previewButtons';
import { onVividFill } from './previewColor';

type ProductShape = 'cup' | 'cloth' | 'notebook' | 'jar';

export const STORE_SHAPES: readonly ProductShape[] = ['cup', 'cloth', 'notebook', 'jar'];

/**
 * Still life for a product, drawn with solid palette colors: a backdrop wash,
 * the object in the product color and one accent shape. No images needed.
 */
export function StoreProductArt({
  colors,
  shape,
  swatchHex,
  onEditSlot,
  className = '',
}: {
  colors: ResolvedLayoutColors;
  shape: ProductShape;
  swatchHex: string;
  onEditSlot?: PreviewSlotEditHandler;
  className?: string;
}) {
  const backdrop = paletteTint(swatchHex, colors.surface, 0.2);
  const shade = paletteTint(swatchHex, backdrop, 0.55);
  const detail = onVividFill(swatchHex);

  return (
    <PreviewSlotTarget
      slot="accent"
      onEditSlot={onEditSlot}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundColor: backdrop }}
    >
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[26%]" style={{ backgroundColor: shade }} />
      {shape === 'cup' ? (
        <>
          <span aria-hidden="true" className="absolute bottom-[20%] left-[30%] h-[42%] w-[38%] rounded-b-[2.5rem] rounded-t-md" style={{ backgroundColor: swatchHex }} />
          <span aria-hidden="true" className="absolute bottom-[30%] left-[62%] size-[16%] rounded-full border-[6px]" style={{ borderColor: swatchHex }} />
        </>
      ) : null}
      {shape === 'cloth' ? (
        <span aria-hidden="true" className="absolute inset-x-[14%] bottom-[18%] h-[52%] rounded-md" style={{ backgroundColor: swatchHex, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 14px, ${detail} 14px 16px)`, backgroundBlendMode: 'soft-light' }} />
      ) : null}
      {shape === 'notebook' ? (
        <>
          <span aria-hidden="true" className="absolute bottom-[18%] left-[32%] h-[56%] w-[36%] -rotate-6 rounded-md" style={{ backgroundColor: swatchHex }} />
          <span aria-hidden="true" className="absolute bottom-[18%] left-[32%] h-[56%] w-[7%] -rotate-6 rounded-l-md" style={{ backgroundColor: detail, opacity: 0.35 }} />
        </>
      ) : null}
      {shape === 'jar' ? (
        <>
          <span aria-hidden="true" className="absolute bottom-[20%] left-[34%] h-[50%] w-[32%] rounded-t-[40%] rounded-b-2xl" style={{ backgroundColor: swatchHex }} />
          <span aria-hidden="true" className="absolute bottom-[68%] left-[40%] h-[8%] w-[20%] rounded-sm" style={{ backgroundColor: swatchHex }} />
        </>
      ) : null}
      <span aria-hidden="true" className="absolute left-[9%] top-[14%] size-[16%] rounded-full" style={{ backgroundColor: colors.accent }} />
    </PreviewSlotTarget>
  );
}
