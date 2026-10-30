import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Sparkline } from './previewCharts';
import { StatDelta } from './previewPrimitives';
import {
  captionStyle,
  displayStyle,
  headingStyle,
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
      className={`preview-surface preview-lift min-w-0 overflow-hidden rounded-xl border motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        featured ? 'p-5' : 'p-4'
      }`}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <PreviewSlotTarget
          slot="mutedText"
          onEditSlot={onEditSlot}
          className="min-w-0 text-pretty"
          style={captionStyle(fonts, colors.mutedText)}
        >
          {metric.label}
        </PreviewSlotTarget>
        <StatDelta value={metric.trend} direction={metric.dir} color={trendColor} slot={metric.trendSlot} onEditSlot={onEditSlot} />
      </div>
      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="mt-3 tabular-nums"
        style={featured ? displayStyle(fonts) : { ...headingStyle(fonts) }}
      >
        {metric.value}
      </PreviewSlotTarget>
      <div className={featured ? 'mt-4' : 'mt-3'}>
        <Sparkline values={metric.spark} color={trendColor} surfaceHex={colors.surface} height={featured ? 32 : 22} />
      </div>
    </PreviewSlotTarget>
  );
}
