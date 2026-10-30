import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAYS, ANALYTICS_HEATMAP, ANALYTICS_SERIES } from './analyticsPreviewData';
import { contrastReadout, paletteTint } from './previewButtons';
import { PreviewIcon } from './previewIcons';
import { captionStyle, headingStyle, type PreviewFonts } from './previewTypography';

const HEAT_SHARES = [0.08, 0.3, 0.5, 0.72, 0.95] as const;

/**
 * Shows the chart colors as colors: one stacked bar, each series with its hex and
 * its measured contrast against the card, plus a heatmap built from a single series.
 */
export function AnalyticsPaletteBoard({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const surface = colors.surface;

  return (
    <div className="preview-rise grid min-w-0 gap-6 @min-[800px]/analytics:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="preview-surface min-w-0 rounded-xl border p-5 @min-[800px]/analytics:p-6"
        style={{ backgroundColor: surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Colores de las series
        </PreviewSlotTarget>

        <div className="mt-5 flex h-9 gap-1 overflow-hidden rounded-[10px]" role="img" aria-label="Reparto de las seis series">
          {ANALYTICS_SERIES.map((series) => (
            <PreviewSlotTarget
              key={series.label}
              slot={series.slot}
              onEditSlot={onEditSlot}
              className="min-w-0"
              style={{ flexGrow: series.share, backgroundColor: colors[series.slot] }}
            />
          ))}
        </div>

        <ul className="mt-5 grid gap-x-6 gap-y-3 @min-[560px]/analytics:grid-cols-2">
          {ANALYTICS_SERIES.map((series) => {
            const hex = colors[series.slot];
            const readout = contrastReadout(hex, surface);
            const passes = Number.parseFloat(readout.ratio) >= 3;

            return (
              <li key={series.label} className="flex items-center gap-3">
                <PreviewSlotTarget
                  slot={series.slot}
                  onEditSlot={onEditSlot}
                  className="size-8 shrink-0 rounded-[10px] shadow-[0_8px_14px_-10px_rgb(0_0_0/0.5)]"
                  style={{ backgroundColor: hex }}
                />
                <span className="min-w-0 flex-1">
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={captionStyle(fonts, colors.text)}>
                    {series.label}
                  </PreviewSlotTarget>
                  <span className="block truncate uppercase tabular-nums" style={captionStyle(fonts, colors.mutedText)}>
                    {hex}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 tabular-nums" style={captionStyle(fonts, colors.mutedText)}>
                  <PreviewIcon name={passes ? 'check' : 'shield'} size={12} />
                  {readout.ratio}
                </span>
              </li>
            );
          })}
        </ul>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="preview-surface min-w-0 rounded-xl border p-5 @min-[800px]/analytics:p-6"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Constancia del mes
        </PreviewSlotTarget>
        <div className="mt-5 grid grid-cols-7 gap-1.5" role="img" aria-label="Actividad por día durante cuatro semanas">
          {ANALYTICS_DAYS.map((day) => (
            <span key={day} className="text-center" style={captionStyle(fonts, colors.mutedText)}>
              {day.slice(0, 1)}
            </span>
          ))}
          {ANALYTICS_HEATMAP.flat().map((level, index) => (
            <PreviewSlotTarget
              key={index}
              slot="data1"
              onEditSlot={onEditSlot}
              className="aspect-square rounded-[6px]"
              style={{ backgroundColor: paletteTint(colors.data1, colors.surfaceElevated, HEAT_SHARES[level]!) }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2" style={captionStyle(fonts, colors.mutedText)}>
          Menos
          {HEAT_SHARES.map((share) => (
            <span
              key={share}
              aria-hidden="true"
              className="size-3.5 rounded-[4px]"
              style={{ backgroundColor: paletteTint(colors.data1, colors.surfaceElevated, share) }}
            />
          ))}
          Más
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
