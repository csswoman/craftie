import type { ResolvedLayoutColors, UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewIcon } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MOBILE_LIBRARY_FILTERS, MOBILE_PALETTES } from './mobilePreviewData';
import { buttonPairOn } from './previewButtons';
import { buttonStyle, captionStyle, displayStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

/** "Paletas": search, filter chips and a two-column grid of palette tiles, plus an empty "new" tile. */
export function MobileLibraryScreen({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const chip = buttonPairOn(colors, colors.appBackground);
  const swatchHex = (slot: UiLayoutSlot) => colors[slot] ?? colors.accent;

  return (
    <div className="flex h-full flex-col px-5">
      <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="pb-4 pt-5" style={displayStyle(fonts)}>{t('ui.MobileLibraryScreen.paletas')}</PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="flex h-11 items-center gap-2 rounded-xl border px-3"
        style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.mutedText }}
      >
        <PreviewIcon name="search" size={16} />
        <span style={labelStyle(fonts, colors.mutedText)}>{t('ui.MobileLibraryScreen.buscar-paletas')}</span>
      </PreviewSlotTarget>

      <div className="mt-3 flex gap-2">
        {MOBILE_LIBRARY_FILTERS.map((filter, index) => (
          <span
            key={filter}
            className="rounded-full border px-3 py-1.5"
            style={{
              ...buttonStyle(fonts),
              backgroundColor: index === 0 ? chip.fill : colors.surface,
              borderColor: index === 0 ? chip.fill : colors.border,
              color: index === 0 ? chip.on : colors.text,
            }}
          >
            {tx(filter)}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {MOBILE_PALETTES.map((palette) => (
          <PreviewSlotTarget
            key={palette.name}
            slot="surface"
            onEditSlot={onEditSlot}
            className="overflow-hidden rounded-2xl border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="grid h-24 grid-cols-2 grid-rows-2" aria-hidden="true">
              {palette.swatches.map((slot, index) => (
                <span
                  key={`${slot}-${index}`}
                  className={index === 0 ? 'row-span-2' : ''}
                  style={{ backgroundColor: swatchHex(slot) }}
                />
              ))}
            </div>
            <div className="p-2.5">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={titleStyle(fonts)}>
                {tx(palette.name)}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="truncate" style={captionStyle(fonts, colors.mutedText)}>
                {t('ui.MobileLibraryScreen.colores', { length: palette.swatches.length })}</PreviewSlotTarget>
            </div>
          </PreviewSlotTarget>
        ))}
        <PreviewSlotTarget
          slot="border"
          onEditSlot={onEditSlot}
          className="grid place-items-center rounded-2xl border border-dashed"
          style={{ borderColor: colors.border, color: colors.mutedText }}
        >
          <span className="flex flex-col items-center gap-1.5" style={labelStyle(fonts, colors.mutedText)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>{t('ui.MobileLibraryScreen.nueva-paleta')}</span>
        </PreviewSlotTarget>
      </div>
    </div>
  );
}
