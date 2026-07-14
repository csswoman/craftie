'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsAsidePanels } from './AnalyticsAsidePanels';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { DonutChart, Sparkline, type ChartSeries } from './previewCharts';
import { PreviewIcon } from './previewIcons';
import { StatDelta, tint } from './previewPrimitives';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

export const ANALYTICS_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
  'primaryAction',
  'primaryActionText',
  'success',
  'data1',
  'data2',
  'data3',
  'data4',
  'data5',
  'data6',
] as const;

const KPIS = [
  { label: 'Sessions', value: '128k', trend: '5.4%', dir: 'up' as const, slot: 'data1' as const, spark: [10, 14, 12, 18, 16, 21, 19] },
  { label: 'Bounce rate', value: '31.2%', trend: '1.1%', dir: 'down' as const, slot: 'data4' as const, spark: [40, 38, 36, 34, 33, 31, 31] },
  { label: 'Avg. duration', value: '3m 42s', trend: '9.8%', dir: 'up' as const, slot: 'data2' as const, spark: [6, 7, 6, 8, 9, 10, 11] },
  { label: 'New signups', value: '2,184', trend: '2.3%', dir: 'up' as const, slot: 'data6' as const, spark: [3, 5, 4, 6, 7, 6, 8] },
];

export function AnalyticsLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const filterFill = vividFill(colors.primaryAction, colors.surface);
  const series: ChartSeries[] = [
    { label: 'Organic', value: 38, display: '38%', color: colors.data1, slot: 'data1' },
    { label: 'Referral', value: 24, display: '24%', color: colors.data2, slot: 'data2' },
    { label: 'Email', value: 18, display: '18%', color: colors.data3, slot: 'data3' },
    { label: 'Paid', value: 12, display: '12%', color: colors.data4, slot: 'data4' },
    { label: 'Direct', value: 8, display: '8%', color: colors.data5, slot: 'data5' },
  ];

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className="overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text, fontFamily: fonts.bodyFamily }}
    >
      <div className="min-h-[32rem] p-4 sm:p-5 lg:p-6">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="mb-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ backgroundColor: colors.chrome, borderColor: colors.border }}
        >
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-extrabold" style={{ fontFamily: fonts.headingFamily }}>
              Traffic mix
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
              Neutral chrome, categorical color only.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.75rem] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: filterFill, borderColor: 'transparent', color: onVividFill(filterFill) }}
          >
            <PreviewIcon name="filter" size={13} />
            Filter
          </PreviewSlotTarget>
        </PreviewSlotTarget>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((kpi) => {
            const kpiColor = colors[kpi.slot];

            return (
              <PreviewSlotTarget
                key={kpi.label}
                slot="surface"
                onEditSlot={onEditSlot}
                className="rounded-xl border p-3.5 transition-transform duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="flex items-start justify-between gap-2">
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                    {kpi.label}
                  </PreviewSlotTarget>
                  <StatDelta value={kpi.trend} direction={kpi.dir} color={kpiColor} slot={kpi.slot} onEditSlot={onEditSlot} />
                </div>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="mt-2 text-[1.25rem] font-bold leading-none xl:text-[1.375rem]"
                  style={{ fontFamily: fonts.headingFamily }}
                >
                  {kpi.value}
                </PreviewSlotTarget>
                <div className="mt-2.5">
                  <Sparkline values={kpi.spark} color={kpiColor} surfaceHex={colors.surface} height={26} />
                </div>
              </PreviewSlotTarget>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)]">
          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="rounded-xl border p-4 lg:p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                  Visitors by source
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                  Hover a segment or legend row to trace it.
                </PreviewSlotTarget>
              </div>
              <div className="flex items-center gap-4">
                <DonutChart segments={series} centerLabel="Total" centerValue="42.8k" surfaceHex={colors.surface} size={132} />
                <ul className="space-y-1.5 text-[0.75rem]">
                  {series.map((item) => (
                    <li
                      key={item.label}
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex items-center gap-2 rounded-md px-1.5 py-0.5 font-semibold transition-[background-color,opacity] duration-150"
                      style={{
                        backgroundColor: hovered === item.label ? tint(item.color, 14) : 'transparent',
                        opacity: hovered && hovered !== item.label ? 0.45 : 1,
                      }}
                    >
                      <PreviewSlotTarget
                        slot={item.slot}
                        onEditSlot={onEditSlot}
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                      <span className="tabular-nums opacity-60">{item.display}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PreviewSlotTarget>

          <AnalyticsAsidePanels colors={colors} fonts={fonts} series={series} onEditSlot={onEditSlot} />
        </section>
      </div>
    </PreviewSlotTarget>
  );
}
