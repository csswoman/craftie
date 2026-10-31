import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { EDITORIAL_GUTTER_CLASS, EDITORIAL_MASTHEAD, EDITORIAL_NAV } from './editorialPreviewData';
import { buttonPairOn } from './previewButtons';
import { readableInk } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { buttonStyle, captionStyle, heroStyle, labelStyle, ROLE_WEIGHT, type PreviewFonts } from './previewTypography';

/**
 * Classic magazine masthead: issue line and subscribe action, a centered
 * wordmark, then the section nav between a thick and a thin rule.
 */
export function EditorialMasthead({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const subscribe = buttonPairOn(colors, colors.chrome);
  const activeInk = readableInk(colors.accent, colors.chrome);

  return (
    <PreviewSlotTarget slot="chrome" onEditSlot={onEditSlot} className={`preview-rise pt-4 ${EDITORIAL_GUTTER_CLASS}`} style={{ backgroundColor: colors.chrome }}>
      <div className="flex items-center justify-between gap-4">
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          {EDITORIAL_MASTHEAD.issue}
        </PreviewSlotTarget>
        <div className="flex items-center gap-4">
          <span className="hidden @min-[560px]/editorial:inline" style={labelStyle(fonts, colors.text)}>
            Entrar
          </span>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="rounded-full px-4 py-1.5"
            style={{ ...buttonStyle(fonts), backgroundColor: subscribe.fill, color: subscribe.on }}
          >
            Suscribirse
          </PreviewSlotTarget>
        </div>
      </div>

      <div className="py-6 text-center">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...heroStyle(fonts), lineHeight: 1 }}>
          {EDITORIAL_MASTHEAD.name}
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={labelStyle(fonts, colors.mutedText)}>
          {EDITORIAL_MASTHEAD.tagline}
        </PreviewSlotTarget>
      </div>

      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="border-t-2"
        style={{ borderColor: colors.text }}
      >
        <nav
          className="flex flex-wrap justify-center gap-x-7 gap-y-1 border-b py-3"
          style={{ borderColor: colors.divider }}
          aria-label="Secciones"
        >
          {EDITORIAL_NAV.map((item, index) => (
            <span
              key={item}
              style={{
                ...labelStyle(fonts, index === 0 ? activeInk : colors.text),
                fontWeight: index === 0 ? ROLE_WEIGHT.button : ROLE_WEIGHT.label,
              }}
            >
              {item}
            </span>
          ))}
        </nav>
      </PreviewSlotTarget>
    </PreviewSlotTarget>
  );
}
