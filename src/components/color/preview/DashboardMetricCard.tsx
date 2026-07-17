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

export function DashboardMetricCard({
  colors,
  fonts,
  metric,
  featured = false,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  metric: DashboardMetric;
  featured?: boolean;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const trendColor = colors[metric.trendSlot] ?? colors.text;

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className={`min-w-0 overflow-hidden rounded-xl border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(0_0_0/0.06)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none ${
        featured ? 'p-4 @min-[640px]/dashboard:p-3.5' : 'p-3'
      }`}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <PreviewSlotTarget
          slot="mutedText"
          onEditSlot={onEditSlot}
          className="min-w-0 text-pretty"
          style={labelStyle(fonts, colors.mutedText)}
        >
          {metric.label}
        </PreviewSlotTarget>
        <StatDelta value={metric.trend} direction={metric.dir} color={trendColor} slot={metric.trendSlot} onEditSlot={onEditSlot} />
      </div>
      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className={`mt-2 tabular-nums ${featured ? 'text-[1.75rem] leading-none' : ''}`}
        style={displayStyle(fonts)}
      >
        {metric.value}
      </PreviewSlotTarget>
      <div className={featured ? 'mt-3' : 'mt-2'}>
        <Sparkline values={metric.spark} color={trendColor} surfaceHex={colors.surface} height={featured ? 32 : 22} />
      </div>
    </PreviewSlotTarget>
  );
}
