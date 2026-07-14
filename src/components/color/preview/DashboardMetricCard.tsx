import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Sparkline } from './previewCharts';
import { StatDelta } from './previewPrimitives';
import { displayStyle, labelStyle, type PreviewFonts } from './previewTypography';

export type DashboardMetric = {
  label: string;
  value: string;
  trend: string;
  dir: 'up' | 'down';
  trendSlot: 'data1' | 'data2' | 'data3' | 'data4';
  spark: readonly number[];
};

export function DashboardMetricCard({ colors, fonts, metric, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  metric: DashboardMetric;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const trendColor = colors[metric.trendSlot] ?? colors.text;

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-xl border p-3.5 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
          {metric.label}
        </PreviewSlotTarget>
        <StatDelta value={metric.trend} direction={metric.dir} color={trendColor} slot={metric.trendSlot} onEditSlot={onEditSlot} />
      </div>
      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="mt-2 tabular-nums"
        style={displayStyle(fonts)}
      >
        {metric.value}
      </PreviewSlotTarget>
      <div className="mt-2.5">
        <Sparkline values={metric.spark} color={trendColor} surfaceHex={colors.surface} height={26} />
      </div>
    </PreviewSlotTarget>
  );
}
