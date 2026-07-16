import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsChatPanel } from './AnalyticsChatPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { AreaChart } from './previewCharts';
import { SegmentMeter } from './previewDataDisplays';
import { bodyStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TREND = [42, 58, 51, 65, 61, 77, 70];

const GOALS = [
  { label: 'Trial activation', value: 78, total: '1,560 / 2,000', slot: 'data2' },
  { label: 'Newsletter growth', value: 61, total: '3,660 / 6,000', slot: 'data5' },
  { label: 'Plan upgrades', value: 43, total: '860 / 2,000', slot: 'data3' },
] as const;

type DetailPanelProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function AnalyticsDetailPanels({ colors, fonts, onEditSlot }: DetailPanelProps) {
  return (
    <div className="mt-4 grid gap-4">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Sessions over time
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={bodyStyle(fonts, colors.mutedText)}>
              A compact weekly view of audience momentum.
            </PreviewSlotTarget>
          </div>
          <div className="flex items-center gap-3" style={labelStyle(fonts, colors.mutedText)}>
            <span className="inline-flex items-center gap-1.5">
              <PreviewSlotTarget slot="data1" onEditSlot={onEditSlot} className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.data1 }} />
              This week
            </span>
            <span className="inline-flex items-center gap-1.5 opacity-70">
              <span className="h-px w-4" style={{ backgroundColor: colors.divider }} />
              Previous
            </span>
          </div>
        </div>
        <PreviewSlotTarget slot="data1" onEditSlot={onEditSlot} className="mt-4 block">
          <AreaChart values={TREND} color={colors.data1} surfaceHex={colors.surfaceElevated} height={112} />
        </PreviewSlotTarget>
        <div className="mt-2 grid grid-cols-7 text-center" style={labelStyle(fonts, colors.mutedText)}>
          {DAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
      </PreviewSlotTarget>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsChatPanel colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="rounded-xl border p-4 lg:p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between gap-3">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Goals overview
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              This month
            </PreviewSlotTarget>
          </div>
          <div className="mt-5 space-y-5">
            {GOALS.map((goal) => (
              <div key={goal.label}>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block" style={titleStyle(fonts)}>
                      {goal.label}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block" style={labelStyle(fonts, colors.mutedText)}>
                      {goal.total}
                    </PreviewSlotTarget>
                  </div>
                  <span className="font-semibold tabular-nums" style={titleStyle(fonts)}>{goal.value}%</span>
                </div>
                <SegmentMeter value={goal.value} color={colors[goal.slot]} slot={goal.slot} onEditSlot={onEditSlot} />
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </div>
    </div>
  );
}
