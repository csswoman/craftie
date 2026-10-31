import type { ResolvedLayoutColors, UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewIcon } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { getMobileGreeting, getMobileReviewNote, MOBILE_PALETTES, MOBILE_SUMMARY } from './mobilePreviewData';
import {
  brandStyle,
  buttonStyle,
  captionStyle,
  compactBodyStyle,
  displayStyle,
  headingStyle,
  labelStyle,
  titleStyle,
  type PreviewFonts,
} from './previewTypography';

/** "Hoy": greeting, two counters, the pinned palette with its one primary action, and the rest as a list. */
export function MobileHomeScreen({
  colors,
  fonts,
  primaryFill,
  onPrimary,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  primaryFill: string;
  onPrimary: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const greeting = getMobileGreeting(new Date().getHours());
  const [pinned, ...rest] = MOBILE_PALETTES;
  const swatchHex = (slot: UiLayoutSlot) => colors[slot] ?? colors.accent;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="min-w-0">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
            {greeting}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-0.5" style={displayStyle(fonts)}>
            Tus paletas
          </PreviewSlotTarget>
        </div>
        <PreviewSlotTarget
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="grid size-11 shrink-0 place-items-center rounded-full border"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.mutedText }}
        >
          <PreviewIcon name="bell" size={18} />
        </PreviewSlotTarget>
      </header>

      <div className="space-y-4 px-5">
        <PreviewSlotTarget
          slot="divider"
          onEditSlot={onEditSlot}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border"
          style={{ backgroundColor: colors.divider, borderColor: colors.border }}
        >
          {MOBILE_SUMMARY.map((item) => (
            <PreviewSlotTarget key={item.label} slot="surface" onEditSlot={onEditSlot} className="p-3.5" style={{ backgroundColor: colors.surface }}>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="flex items-center gap-1.5" style={captionStyle(fonts, colors.mutedText)}>
                <PreviewSlotTarget slot={item.slot} onEditSlot={onEditSlot} className="size-2 rounded-full" style={{ backgroundColor: swatchHex(item.slot) }} />
                {item.label}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 block tabular-nums" style={headingStyle(fonts)}>
                {item.value}
              </PreviewSlotTarget>
            </PreviewSlotTarget>
          ))}
        </PreviewSlotTarget>

        <PreviewSlotTarget
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="rounded-2xl border p-4"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
            {pinned!.name}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 block" style={captionStyle(fonts, colors.mutedText)}>
            {getMobileReviewNote(0)}
          </PreviewSlotTarget>
          <div className="mt-3 flex h-10 overflow-hidden rounded-lg">
            {pinned!.swatches.map((slot, index) => (
              <PreviewSlotTarget key={`${slot}-${index}`} slot={slot} onEditSlot={onEditSlot} className="flex-1" style={{ backgroundColor: swatchHex(slot) }} />
            ))}
          </div>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="mt-4 block rounded-xl py-2.5 text-center"
            style={{ ...buttonStyle(fonts), backgroundColor: primaryFill, color: onPrimary }}
          >
            Exportar guía
          </PreviewSlotTarget>
        </PreviewSlotTarget>

        <div>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mb-1" style={labelStyle(fonts, colors.mutedText)}>
            Recientes
          </PreviewSlotTarget>
          {rest.map((palette) => (
            <PreviewSlotTarget
              key={palette.name}
              slot="divider"
              onEditSlot={onEditSlot}
              className="flex items-center gap-3 border-b py-3"
              style={{ borderColor: colors.divider }}
            >
              <span className="flex size-10 shrink-0 overflow-hidden rounded-lg" aria-hidden="true">
                {palette.swatches.map((slot, index) => (
                  <span key={`${slot}-${index}`} className="flex-1" style={{ backgroundColor: swatchHex(slot) }} />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                  {palette.name}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block truncate" style={compactBodyStyle(fonts, colors.mutedText)}>
                  {palette.note}
                </PreviewSlotTarget>
              </span>
              <PreviewIcon name="arrowRight" size={16} style={{ color: colors.mutedText }} />
            </PreviewSlotTarget>
          ))}
        </div>
      </div>
    </div>
  );
}
