'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { DashboardMetricCard } from './DashboardMetricCard';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { onVividFill, vividFill } from './previewColor';
import { AreaChart } from './previewCharts';
import { PreviewIcon, type PreviewIconName } from './previewIcons';
import { Avatar, LiveDot, ProgressBar, SegmentedControl, Tag } from './previewPrimitives';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

export const DASHBOARD_VISUAL_SLOTS = [
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
  'accent',
  'success',
  'data1',
  'data2',
  'data3',
  'data4',
] as const;

const NAV: Array<{ label: string; icon: PreviewIconName }> = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Pipeline', icon: 'activity' },
  { label: 'Accounts', icon: 'users' },
  { label: 'Forecast', icon: 'trending' },
];

const RANGES = ['7d', '30d', '90d'] as const;

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]>('30d');
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimaryFill = onVividFill(primaryFill);
  const metrics = [
    { label: 'Pipeline', value: '$84.2k', trend: '12%', dir: 'up' as const, trendSlot: 'data1', spark: [12, 18, 15, 22, 19, 27, 24] },
    { label: 'Conversion', value: '18.4%', trend: '3.1%', dir: 'up' as const, trendSlot: 'data2', spark: [8, 9, 8, 11, 13, 12, 15] },
    { label: 'Velocity', value: '142', trend: '2.4%', dir: 'down' as const, trendSlot: 'data3', spark: [20, 22, 19, 17, 18, 16, 15] },
    { label: 'Risk', value: '7', trend: '1', dir: 'up' as const, trendSlot: 'data4', spark: [3, 4, 4, 5, 5, 6, 7] },
  ] as const;
  const activity = [
    { label: 'Invoice approved', detail: 'North America · 2m ago', initials: 'NA', color: colors.data1, slot: 'data1' },
    { label: 'New account opened', detail: 'Self-serve · 18m ago', initials: 'SS', color: colors.data2, slot: 'data2' },
    { label: 'Budget threshold', detail: 'Needs review · 1h ago', initials: 'BT', color: colors.data3, slot: 'data3' },
  ] as const;

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className="overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text, fontFamily: fonts.bodyFamily }}
    >
      <div className="flex min-h-[34rem]">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="hidden w-52 shrink-0 border-r p-4 lg:block"
          style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <PreviewSlotTarget
                slot="primaryAction"
                onEditSlot={onEditSlot}
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: primaryFill, color: onPrimaryFill }}
              >
                <PreviewIcon name="zap" size={16} />
              </PreviewSlotTarget>
              <div className="min-w-0">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate text-[0.8125rem] font-bold">
                  Craftie Ops
                </PreviewSlotTarget>
                <LiveDot color={colors.success} slot="success" onEditSlot={onEditSlot} label="All systems live" />
              </div>
            </div>

            <nav className="mt-6 space-y-1 text-[0.75rem] font-semibold">
              {NAV.map((item, index) => (
                <PreviewSlotTarget
                  key={item.label}
                  slot={index === 0 ? 'surfaceElevated' : 'chrome'}
                  onEditSlot={onEditSlot}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150"
                  style={{ backgroundColor: index === 0 ? colors.surfaceElevated : 'transparent', color: index === 0 ? colors.primaryAction : colors.text }}
                >
                  <PreviewIcon name={item.icon} size={15} />
                  {item.label}
                </PreviewSlotTarget>
              ))}
            </nav>

            <PreviewSlotTarget
              slot="surface"
              onEditSlot={onEditSlot}
              className="mt-auto rounded-xl border p-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                This week
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                92% on track
              </PreviewSlotTarget>
              <div className="mt-2">
                <ProgressBar value={92} color={primaryFill} slot="primaryAction" onEditSlot={onEditSlot} />
              </div>
            </PreviewSlotTarget>
          </div>
        </PreviewSlotTarget>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                Week overview
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1.25rem] font-bold sm:text-[1.5rem]" style={{ fontFamily: fonts.headingFamily }}>
                Revenue operations
              </PreviewSlotTarget>
            </div>
            <div className="flex items-center gap-2">
              <SegmentedControl
                options={RANGES}
                value={range}
                onChange={(next) => setRange(next as (typeof RANGES)[number])}
                trackColor={colors.mutedText}
                activeColor={colors.surfaceElevated}
                activeText={colors.text}
                mutedText={colors.mutedText}
                trackSlot="surfaceElevated"
                onEditSlot={onEditSlot}
              />
              <PreviewSlotTarget
                slot="primaryAction"
                onEditSlot={onEditSlot}
                className="rounded-lg px-3.5 py-2 text-[0.75rem] font-bold transition-transform duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: primaryFill, color: onPrimaryFill }}
              >
                Export
              </PreviewSlotTarget>
            </div>
          </div>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.95fr)]">
            <div className="min-w-0">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <DashboardMetricCard key={metric.label} colors={colors} fonts={fonts} metric={metric} onEditSlot={onEditSlot} />
                ))}
              </section>

              <PreviewSlotTarget
                slot="surface"
                onEditSlot={onEditSlot}
                className="mt-4 rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                      Channel performance
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                      Trailing {range} · updates live
                    </PreviewSlotTarget>
                  </div>
                  <Tag label="Live" color={colors.accent} slot="accent" onEditSlot={onEditSlot} />
                </div>
                <div className="mt-4">
                  <AreaChart values={[14, 22, 18, 28, 24, 33, 29, 38, 34, 42]} color={colors.accent} surfaceHex={colors.surface} />
                </div>
              </PreviewSlotTarget>
            </div>

            <div className="grid gap-4">
              <PreviewSlotTarget
                slot="surfaceElevated"
                onEditSlot={onEditSlot}
                className="rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
              >
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                  Focus
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                  Revenue quality
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 text-[0.75rem] leading-relaxed" style={{ color: colors.mutedText }}>
                  Keep the chrome quiet so the selected palette is judged on hierarchy, data color, and CTA emphasis.
                </PreviewSlotTarget>
              </PreviewSlotTarget>

              <PreviewSlotTarget
                slot="surface"
                onEditSlot={onEditSlot}
                className="rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                  Activity
                </PreviewSlotTarget>
                <div className="mt-4 space-y-3">
                  {activity.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <Avatar initials={item.initials} color={item.color} slot={item.slot} onEditSlot={onEditSlot} size={26} />
                      <div className="min-w-0">
                        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.75rem] font-semibold">
                          {item.label}
                        </PreviewSlotTarget>
                        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
                          {item.detail}
                        </PreviewSlotTarget>
                      </div>
                    </div>
                  ))}
                </div>
              </PreviewSlotTarget>
            </div>
          </section>
        </main>
      </div>
    </PreviewSlotTarget>
  );
}
