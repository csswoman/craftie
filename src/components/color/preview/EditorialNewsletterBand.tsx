import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { EDITORIAL_GUTTER_CLASS } from './editorialPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { bodyStyle, buttonStyle, displayStyle, labelStyle, type PreviewFonts } from './previewTypography';

/**
 * The page's one loud moment: a full-bleed band in the primary color with the
 * newsletter sign-up. Field and button are drawn from the primary pair, so the
 * text always sits on its measured foreground.
 */
export function EditorialNewsletterBand({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const fill = colors.primaryAction;
  const on = colors.primaryActionText;
  const field = paletteTint(on, fill, 0.12);

  return (
    <PreviewSlotTarget
      slot="primaryAction"
      onEditSlot={onEditSlot}
      className={`preview-rise grid items-center gap-6 py-12 ${EDITORIAL_GUTTER_CLASS} @min-[760px]/editorial:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @min-[760px]/editorial:gap-10`}
      style={{ backgroundColor: fill, color: on }}
    >
      <div className="min-w-0">
        <PreviewSlotTarget slot="primaryActionText" onEditSlot={onEditSlot} style={{ ...displayStyle(fonts), color: on }}>
          Una carta al mes
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="primaryActionText" onEditSlot={onEditSlot} className="mt-2 max-w-[40ch] text-pretty" style={{ ...bodyStyle(fonts), color: on }}>
          Un ensayo largo y tres enlaces que merecen la pena. Sin ruido, sin prisa.
        </PreviewSlotTarget>
      </div>
      <div className="flex min-w-0 flex-col gap-3 @min-[480px]/editorial:flex-row">
        <span
          className="flex min-h-12 min-w-0 flex-1 items-center rounded-lg border px-4"
          style={{ ...labelStyle(fonts, on), backgroundColor: field, borderColor: paletteTint(on, fill, 0.3) }}
        >
          tu@correo.com
        </span>
        <PreviewSlotTarget
          slot="primaryActionText"
          onEditSlot={onEditSlot}
          className="flex min-h-12 items-center justify-center rounded-lg px-5"
          style={{ ...buttonStyle(fonts), backgroundColor: on, color: fill }}
        >
          Quiero recibirla
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
