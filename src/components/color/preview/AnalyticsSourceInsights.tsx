import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsTreatPanel } from './AnalyticsTreatPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAYS, ANALYTICS_MOMENTUM, ANALYTICS_SOURCE_STATS } from './analyticsPreviewData';
import { AreaChart } from './previewCharts';
import { displayStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

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
    <div className="mt-5 flex flex-1 flex-col border-t pt-5" style={{ borderColor: colors.divider }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Ritmo de cola
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
          Últimos 7 días
        </PreviewSlotTarget>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x" style={{ borderColor: colors.divider }}>
        {ANALYTICS_SOURCE_STATS.map((stat, index) => (
          <div key={stat.label} className={index ? 'pl-4' : ''}>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="block"
              style={labelStyle(fonts, colors.mutedText)}
            >
              {stat.label}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot={stat.slot}
              onEditSlot={onEditSlot}
              className="mt-1 block tabular-nums"
              style={{ ...displayStyle(fonts), color: colors[stat.slot] }}
            >
              {stat.value}
            </PreviewSlotTarget>
          </div>
        ))}
      </div>

      <PreviewSlotTarget slot="data1" onEditSlot={onEditSlot} className="mt-4 block">
        <AreaChart values={[...ANALYTICS_MOMENTUM]} color={colors.data1} surfaceHex={colors.surface} height={96} />
      </PreviewSlotTarget>
      <div className="mt-1 grid grid-cols-7 text-center" style={labelStyle(fonts, colors.mutedText)}>
        {ANALYTICS_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <AnalyticsTreatPanel colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
    </div>
  );
}
