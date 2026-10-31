import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { AnalyticsPanel } from './AnalyticsPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_CONTRAST_ROWS } from './analyticsPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewIcon } from './previewIcons';
import { captionStyle, labelStyle, ROLE_WEIGHT, titleStyle, type PreviewFonts } from './previewTypography';

/**
 * Palettes under review as a table: each row shows the palette itself as a
 * swatch strip, how many text pairs pass AA, and a status chip. Status color is
 * backed by an icon and a word, never color alone.
 */
export function AnalyticsContrastTable({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const grid = 'grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_6.5rem] items-center gap-4';
  const passing = ANALYTICS_CONTRAST_ROWS.reduce((sum, row) => sum + row.passing, 0);
  const total = ANALYTICS_CONTRAST_ROWS.reduce((sum, row) => sum + row.total, 0);
  const linkInk = readableOn(colors.data1, colors.surface);

  return (
    <AnalyticsPanel colors={colors} fonts={fonts} title="Contraste por paleta" subtitle="Parejas de texto y fondo que cumplen AA" onEditSlot={onEditSlot}>
      <PreviewSlotTarget
        slot="divider"
        onEditSlot={onEditSlot}
        className={`${grid} border-b pb-2.5`}
        style={{ ...captionStyle(fonts, colors.mutedText), borderColor: colors.divider }}
      >
        <span>Paleta</span>
        <span>Parejas AA</span>
        <span className="text-right">Estado</span>
      </PreviewSlotTarget>

      <ul className="mb-5">
        {ANALYTICS_CONTRAST_ROWS.map((row) => {
          const share = row.passing / row.total;
          const ok = row.passing === row.total;
          const warn = !ok && share >= 0.85;
          const statusHex = ok ? colors.success : warn ? (colors.warning ?? colors.accent) : colors.error;
          const statusSlot = ok ? ('success' as const) : warn ? ('warning' as const) : ('error' as const);
          const chip = paletteTint(statusHex, colors.surface, 0.16);
          const chipInk = readableOn(statusHex, chip);
          const bar = readableOn(statusHex, colors.surface, 3);

          return (
            <PreviewSlotTarget
              key={row.name}
              slot="divider"
              onEditSlot={onEditSlot}
              className={`${grid} border-b py-3 last:border-b-0`}
              style={{ borderColor: colors.divider }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-14 shrink-0 overflow-hidden rounded-md" aria-hidden="true">
                  {row.swatches.map((slot, index) => (
                    <PreviewSlotTarget key={`${slot}-${index}`} slot={slot} onEditSlot={onEditSlot} className="flex-1" style={{ backgroundColor: colors[slot] ?? colors.accent }} />
                  ))}
                </span>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={titleStyle(fonts)}>
                  {row.name}
                </PreviewSlotTarget>
              </span>

              <span className="flex min-w-0 items-center gap-2.5">
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: paletteTint(colors.mutedText, colors.surface, 0.16) }}>
                  <span className="block h-full rounded-full" style={{ width: `${share * 100}%`, backgroundColor: bar }} />
                </span>
                <span className="shrink-0 tabular-nums" style={labelStyle(fonts, colors.text)}>
                  {row.passing}/{row.total}
                </span>
              </span>

              <span className="flex justify-end">
                <PreviewSlotTarget
                  slot={statusSlot}
                  onEditSlot={onEditSlot}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ ...captionStyle(fonts, chipInk), backgroundColor: chip }}
                >
                  <PreviewIcon name={ok ? 'check' : 'shield'} size={12} strokeWidth={2.25} />
                  {ok ? 'Cumple' : warn ? 'Casi' : 'Revisar'}
                </PreviewSlotTarget>
              </span>
            </PreviewSlotTarget>
          );
        })}
      </ul>

      <PreviewSlotTarget
        slot="divider"
        onEditSlot={onEditSlot}
        className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: colors.divider }}
      >
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
          {passing} de {total} parejas cumplen AA
        </PreviewSlotTarget>
        <span className="flex items-center gap-1.5" style={{ ...labelStyle(fonts, linkInk), fontWeight: ROLE_WEIGHT.button }}>
          Revisar pendientes
          <PreviewIcon name="arrowRight" size={13} strokeWidth={2.25} />
        </span>
      </PreviewSlotTarget>
    </AnalyticsPanel>
  );
}
