import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { StatDelta } from './previewPrimitives';
import { displayStyle, labelStyle, type PreviewFonts } from './previewTypography';

export type AnalyticsKpi = {
  label: string;
  value: string;
  trend: string;
  dir: 'up' | 'down';
  slot: 'data1' | 'data2' | 'data3' | 'data6';
  spark: readonly number[];
};

/**
 * One cell of the KPI strip: label with its series dot, the value, and seven
 * days as columns in the series color (past days tinted, today solid).
 */
export function AnalyticsMetricCard({
  colors,
  fonts,
  kpi,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  kpi: AnalyticsKpi;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const series = colors[kpi.slot] ?? colors.accent;
  const past = paletteTint(series, colors.surface, 0.32);
  const trendColor = kpi.dir === 'up' ? colors.success : colors.error;
  const trendSlot = kpi.dir === 'up' ? ('success' as const) : ('error' as const);
  const max = Math.max(...kpi.spark);
  const min = Math.min(...kpi.spark);

  return (
    <PreviewSlotTarget slot="surface" onEditSlot={onEditSlot} className="flex min-w-0 flex-col p-5" style={{ backgroundColor: colors.surface }}>
      <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="flex min-w-0 items-center gap-2" style={labelStyle(fonts, colors.mutedText)}>
        <PreviewSlotTarget slot={kpi.slot} onEditSlot={onEditSlot} className="size-2 shrink-0 rounded-full" style={{ backgroundColor: series }} />
        <span className="truncate">{kpi.label}</span>
      </PreviewSlotTarget>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={{ ...displayStyle(fonts), lineHeight: 1 }}>
            {kpi.value}
          </PreviewSlotTarget>
          <div className="mt-2">
            <StatDelta value={kpi.trend} direction={kpi.dir} color={trendColor} slot={trendSlot} surfaceHex={colors.surface} onEditSlot={onEditSlot} />
          </div>
        </div>
        <PreviewSlotTarget slot={kpi.slot} onEditSlot={onEditSlot} className="flex h-11 shrink-0 items-end gap-[3px]" aria-hidden="true">
          {kpi.spark.map((value, index) => {
            const last = index === kpi.spark.length - 1;
            const height = 28 + ((value - min) / (max - min || 1)) * 72;

            return (
              <span
                key={index}
                className="preview-bar-grow w-[5px] rounded-full"
                style={{ height: `${height}%`, backgroundColor: last ? series : past, animationDelay: `${index * 35}ms` }}
              />
            );
          })}
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
