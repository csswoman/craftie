import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { AreaChart } from './previewCharts';
import { StatDelta } from './previewPrimitives';
import { displayStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

const MOMENTUM = [28, 34, 31, 45, 42, 57, 51, 66, 61, 74, 69, 82];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const REVENUE = [44, 59, 38, 67, 52, 73] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const;

const SOURCE_STATS = [
  { label: 'Engaged', value: '31.7k', slot: 'data1' },
  { label: 'Returning', value: '18.2k', slot: 'data2' },
  { label: 'Conversion', value: '6.8%', slot: 'success' },
] as const;

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
          Source momentum
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
          Last 7 days
        </PreviewSlotTarget>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x" style={{ borderColor: colors.divider }}>
        {SOURCE_STATS.map((stat, index) => (
          <div key={stat.label} className={index ? 'pl-4' : ''}>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block" style={labelStyle(fonts, colors.mutedText)}>
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
        <AreaChart values={MOMENTUM} color={colors.data1} surfaceHex={colors.surface} height={118} />
      </PreviewSlotTarget>
      <div className="mt-1 grid grid-cols-7 text-center" style={labelStyle(fonts, colors.mutedText)}>
        {DAYS.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="mt-5 border-t pt-4" style={{ borderColor: colors.divider }}>
        <div className="flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
            Revenue
          </PreviewSlotTarget>
          <StatDelta value="12.8%" direction="up" color={colors.success} slot="success" onEditSlot={onEditSlot} />
        </div>
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 block tabular-nums" style={displayStyle(fonts)}>
          $12,543
        </PreviewSlotTarget>
        <div className="mt-4 grid h-24 grid-cols-6 items-end gap-3 border-b" style={{ borderColor: colors.divider }}>
          {REVENUE.map((value, index) => (
            <PreviewSlotTarget
              key={MONTHS[index]}
              slot="data1"
              onEditSlot={onEditSlot}
              className="preview-bar-grow w-full rounded-t-md"
              style={{
                height: `${value}%`,
                minHeight: 18,
                backgroundColor: colors.data1,
                animationDelay: `${index * 45}ms`,
              }}
              aria-label={`${MONTHS[index]} revenue: ${value}`}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-6 text-center" style={labelStyle(fonts, colors.mutedText)}>
          {MONTHS.map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>
    </div>
  );
}
