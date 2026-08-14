import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Sparkline } from './previewCharts';
import { StatDelta } from './previewPrimitives';
import { captionStyle, displayStyle, titleStyle, type PreviewFonts } from './previewTypography';

export type AnalyticsKpi = {
  label: string;
  value: string;
  trend: string;
  dir: 'up' | 'down';
  slot: 'data1' | 'data2' | 'data3' | 'data6';
  spark: readonly number[];
};

export function AnalyticsMetricCard({
  colors,
  fonts,
  kpi,
  featured = false,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  kpi: AnalyticsKpi;
  featured?: boolean;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const sparkColor = colors[kpi.slot];
  const trendColor = kpi.dir === 'up' ? colors.success : colors.error;
  const trendSlot = kpi.dir === 'up' ? ('success' as const) : ('error' as const);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className={`min-w-0 overflow-hidden rounded-xl border ${featured ? 'p-5' : 'p-4'}`}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <PreviewSlotTarget
          slot="mutedText"
          onEditSlot={onEditSlot}
          className="min-w-0 text-pretty"
          style={captionStyle(fonts, colors.mutedText)}
        >
          {kpi.label}
        </PreviewSlotTarget>
        <StatDelta value={kpi.trend} direction={kpi.dir} color={trendColor} slot={trendSlot} onEditSlot={onEditSlot} />
      </div>
      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="mt-3 tabular-nums"
        style={featured ? displayStyle(fonts) : { ...titleStyle(fonts), fontSize: 'var(--size-h3)' }}
      >
        {kpi.value}
      </PreviewSlotTarget>
      <div className={featured ? 'mt-4' : 'mt-3'}>
        <Sparkline values={[...kpi.spark]} color={sparkColor} surfaceHex={colors.surface} height={featured ? 32 : 22} />
      </div>
    </PreviewSlotTarget>
  );
}
