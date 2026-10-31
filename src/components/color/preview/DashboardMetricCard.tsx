import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Sparkline } from './previewCharts';
import { StatDelta } from './previewPrimitives';
import {
  displayStyle,
  labelStyle,
  type PreviewFonts,
} from './previewTypography';

export type DashboardMetric = {
  label: string;
  value: string;
  trend: string;
  dir: 'up' | 'down';
  trendSlot: 'data1' | 'data2' | 'data3' | 'data4';
  spark: readonly number[];
};

/** One cell of the KPI strip: hairlines between cells come from the strip, not from per-card borders. */
export function DashboardMetricCard({
  colors,
  fonts,
  metric,
  onEditSlot,
}: {
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
      className="flex min-w-0 flex-col p-5"
      style={{ backgroundColor: colors.surface }}
    >
      <PreviewSlotTarget
        slot="mutedText"
        onEditSlot={onEditSlot}
        className="min-w-0 truncate"
        style={labelStyle(fonts, colors.mutedText)}
      >
        {metric.label}
      </PreviewSlotTarget>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="tabular-nums"
          style={{ ...displayStyle(fonts), lineHeight: 1.1 }}
        >
          {metric.value}
        </PreviewSlotTarget>
        <StatDelta value={metric.trend} direction={metric.dir} color={trendColor} slot={metric.trendSlot} surfaceHex={colors.surface} onEditSlot={onEditSlot} />
      </div>
      <div className="mt-auto pt-4">
        <Sparkline values={metric.spark} color={trendColor} surfaceHex={colors.surface} height={28} />
      </div>
    </PreviewSlotTarget>
  );
}
