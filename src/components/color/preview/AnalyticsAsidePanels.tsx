'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DataLegend, type ChartSeries } from './previewCharts';
import { ProgressBar, StatDelta } from './previewPrimitives';
import { displayStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

const TOP_PAGES = [
  { label: '/pricing', share: 82, slot: 'data1' as const },
  { label: '/product-tour', share: 61, slot: 'data2' as const },
  { label: '/docs/getting-started', share: 44, slot: 'data3' as const },
  { label: '/changelog', share: 27, slot: 'data4' as const },
] as const;

const SUMMARY_CARDS = [
  { label: 'Visitors', value: '42.8k', trend: '8.2%', dir: 'up' as const },
  { label: 'Qualified', value: '11.3k', trend: '4.1%', dir: 'up' as const },
  { label: 'Intent', value: '7.4%', trend: '0.6%', dir: 'down' as const },
];

export function AnalyticsAsidePanels({
  colors,
  fonts,
  series,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  series: ChartSeries[];
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <div className="grid gap-4">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5 transition-transform duration-200 hover:-translate-y-0.5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Source summary
        </PreviewSlotTarget>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {SUMMARY_CARDS.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <div>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 block tabular-nums" style={displayStyle(fonts)}>
                  {item.value}
                </PreviewSlotTarget>
              </div>
              <StatDelta
                value={item.trend}
                direction={item.dir}
                color={item.dir === 'up' ? colors.success : colors.error}
                slot={item.dir === 'up' ? 'success' : 'error'}
                onEditSlot={onEditSlot}
              />
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5 transition-transform duration-200 hover:-translate-y-0.5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Mix breakdown
        </PreviewSlotTarget>
        <div className="mt-4">
          <DataLegend segments={series} onEditSlot={onEditSlot} interactive />
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5 transition-transform duration-200 hover:-translate-y-0.5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Top pages
        </PreviewSlotTarget>
        <div className="mt-4 space-y-3">
          {TOP_PAGES.map((page) => (
            <div key={page.label}>
              <div className="flex items-center justify-between gap-2">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={titleStyle(fonts)}>
                  {page.label}
                </PreviewSlotTarget>
                <span className="shrink-0 tabular-nums opacity-60" style={labelStyle(fonts)}>
                  {page.share}%
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={page.share} color={colors[page.slot]} slot={page.slot} onEditSlot={onEditSlot} />
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
