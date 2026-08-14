import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAYS, ANALYTICS_MOMENTUM, ANALYTICS_SOURCE_STATS } from './analyticsPreviewData';
import { AreaChart } from './previewCharts';
import { captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

export function AnalyticsSourceInsights({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <div className="mt-6 flex flex-1 flex-col border-t pt-6" style={{ borderColor: colors.divider }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Ritmo de cola
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          Últimos 7 días
        </PreviewSlotTarget>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {ANALYTICS_SOURCE_STATS.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="block"
              style={captionStyle(fonts, colors.mutedText)}
            >
              {stat.label}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot={stat.slot}
              onEditSlot={onEditSlot}
              className="mt-1 block tabular-nums"
              style={{ ...titleStyle(fonts), fontSize: 'var(--size-h3)', color: colors[stat.slot] }}
            >
              {stat.value}
            </PreviewSlotTarget>
          </div>
        ))}
      </div>

      <PreviewSlotTarget slot="data1" onEditSlot={onEditSlot} className="mt-4 block">
        <AreaChart values={[...ANALYTICS_MOMENTUM]} color={colors.data1} surfaceHex={colors.surface} height={96} />
      </PreviewSlotTarget>
      <div className="mt-2 grid grid-cols-7 text-center" style={captionStyle(fonts, colors.mutedText)}>
        {ANALYTICS_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}
