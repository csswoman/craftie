import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewIcon } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MOBILE_DETAIL_ROLES, MOBILE_PALETTES } from './mobilePreviewData';
import { contrastReadout } from './previewButtons';
import { onVividFill } from './previewColor';
import {
  buttonStyle,
  captionStyle,
  headingStyle,
  labelStyle,
  titleStyle,
  type PreviewFonts,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

/** Palette detail: each color as a tall chip that reports its own label contrast, then the text pairs it feeds. */
export function MobileDetailScreen({
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
  const tx = useTx();
  const t = useT();
  const palette = MOBILE_PALETTES[0]!;
  const pairs = [
    { label: 'Texto', fg: colors.text, bg: colors.appBackground },
    { label: 'Secundario', fg: colors.mutedText, bg: colors.appBackground },
    { label: tx('Botón'), fg: onPrimary, bg: primaryFill },
  ];

  return (
    <div className="flex h-full flex-col px-5">
      <header className="flex items-center justify-between py-4" style={{ color: colors.text }}>
        <span className="grid size-9 place-items-center rounded-full" aria-hidden="true">
          <PreviewIcon name="arrowRight" size={18} className="rotate-180" />
        </span>
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
          {tx(palette.name)}
        </PreviewSlotTarget>
        <span className="grid size-9 place-items-center rounded-full" style={{ color: colors.mutedText }} aria-hidden="true">
          <PreviewIcon name="heart" size={17} />
        </span>
      </header>

      <div className="shrink-0 overflow-hidden rounded-2xl">
        {palette.swatches.map((slot, index) => {
          const fill = colors[slot] ?? colors.accent;
          const ink = onVividFill(fill);
          const readout = contrastReadout(ink, fill);

          return (
            <PreviewSlotTarget
              key={`${slot}-${index}`}
              slot={slot}
              onEditSlot={onEditSlot}
              className="flex h-[3.75rem] items-end justify-between px-4 pb-2.5"
              style={{ backgroundColor: fill, color: ink }}
            >
              <span style={labelStyle(fonts, ink)}>{tx(MOBILE_DETAIL_ROLES[index])}</span>
              <span className="tabular-nums" style={captionStyle(fonts, ink)}>
                {tx(readout.ratio)} · {tx(readout.level)}
              </span>
            </PreviewSlotTarget>
          );
        })}
      </div>

      <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-5" style={headingStyle(fonts)}>{t('ui.MobileDetailScreen.contraste')}</PreviewSlotTarget>
      <ul className="mt-2">
        {pairs.map((pair) => {
          const readout = contrastReadout(pair.fg, pair.bg);

          return (
            <PreviewSlotTarget
              key={pair.label}
              slot="divider"
              onEditSlot={onEditSlot}
              className="flex items-center gap-3 border-b py-2.5"
              style={{ borderColor: colors.divider }}
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg border"
                style={{ backgroundColor: pair.bg, color: pair.fg, borderColor: colors.border, ...captionStyle(fonts, pair.fg) }}
              >
                Aa
              </span>
              <span className="min-w-0 flex-1" style={labelStyle(fonts, colors.text)}>
                {tx(pair.label)}
              </span>
              <span className="w-14 shrink-0 text-right tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                {tx(readout.ratio)}
              </span>
              <span className="w-10 shrink-0 text-right" style={labelStyle(fonts, colors.text)}>
                {tx(readout.level)}
              </span>
            </PreviewSlotTarget>
          );
        })}
      </ul>

      <PreviewSlotTarget
        slot="primaryAction"
        onEditSlot={onEditSlot}
        className="mb-4 mt-auto block rounded-xl py-3 text-center"
        style={{ ...buttonStyle(fonts), backgroundColor: primaryFill, color: onPrimary }}
      >{t('ui.MobileDetailScreen.exportar-guia')}</PreviewSlotTarget>
    </div>
  );
}
