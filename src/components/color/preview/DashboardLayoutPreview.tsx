'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { DashboardAsidePanels } from './DashboardAsidePanels';
import { DashboardChannelPanel } from './DashboardChannelPanel';
import { DashboardMetricCard } from './DashboardMetricCard';
import { DashboardSidebar } from './DashboardSidebar';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  buildDashboardActivity,
  DASHBOARD_METRICS,
  DASHBOARD_RANGES,
  getStudioGreeting,
  previewStaggerDelay,
  STUDIO_SUBTITLE,
  type DashboardRange,
} from './dashboardPreviewData';
import { vividFill } from './previewColor';
import { SegmentedControl } from './previewPrimitives';
import { bodyStyle, DEFAULT_PREVIEW_FONTS, displayStyle, labelStyle, previewRootTypeStyle, type PreviewFonts } from './previewTypography';

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
  'brand1',
  'brand2',
  'brand3',
  'data1',
  'data2',
  'data3',
  'data4',
] as const;

export const DASHBOARD_CONTAINER_CLASS = '@container/dashboard';

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [range, setRange] = useState<DashboardRange>('30d');
  const greeting = getStudioGreeting(new Date().getHours());
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimaryFill = colors.primaryActionText;
  const activity = buildDashboardActivity(colors);
  const [featuredMetric, ...secondaryMetrics] = DASHBOARD_METRICS;

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${DASHBOARD_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text, ...previewRootTypeStyle() }}
    >
      <div className="flex min-h-[36rem] min-w-0">
        <DashboardSidebar
          colors={colors}
          fonts={fonts}
          primaryFill={primaryFill}
          onPrimaryFill={onPrimaryFill}
          onEditSlot={onEditSlot}
        />

        <main className="min-w-0 flex-1 p-6 @min-[900px]/dashboard:px-8 @min-[900px]/dashboard:py-7">
          <header
            className="preview-rise flex flex-wrap items-start justify-between gap-x-6 gap-y-5"
            style={{ animationDelay: previewStaggerDelay(0) }}
          >
            <div className="min-w-0 max-w-[42ch]">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...displayStyle(fonts), textWrap: 'balance' }}>
                {greeting}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="mt-3 text-pretty"
                style={bodyStyle(fonts, colors.mutedText)}
              >
                {STUDIO_SUBTITLE}
              </PreviewSlotTarget>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 pt-1">
              <SegmentedControl
                options={DASHBOARD_RANGES}
                value={range}
                onChange={(next) => setRange(next as DashboardRange)}
                trackColor={colors.surface}
                activeColor={colors.surfaceElevated}
                activeText={colors.text}
                mutedText={colors.mutedText}
                trackSlot="surface"
                onEditSlot={onEditSlot}
              />
              <PreviewSlotTarget
                slot="primaryAction"
                onEditSlot={onEditSlot}
                className="rounded-lg px-4 py-2.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(0_0_0/0.12)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimaryFill }}
              >
                Nuevo proyecto
              </PreviewSlotTarget>
            </div>
          </header>

          <section className="mt-8 grid min-w-0 gap-6 @min-[800px]/dashboard:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.9fr)] @min-[800px]/dashboard:gap-6 @min-[900px]/dashboard:gap-7">
            <div className="@container/dashmain flex min-w-0 flex-col gap-6">
              <section className="grid grid-cols-2 gap-3 @min-[400px]/dashmain:grid-cols-4 @min-[400px]/dashmain:gap-4">
                <div
                  className="preview-rise col-span-2 @min-[400px]/dashmain:col-span-1"
                  style={{ animationDelay: previewStaggerDelay(1) }}
                >
                  <DashboardMetricCard
                    colors={colors}
                    fonts={fonts}
                    metric={featuredMetric}
                    featured
                    onEditSlot={onEditSlot}
                  />
                </div>
                {secondaryMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="preview-rise"
                    style={{ animationDelay: previewStaggerDelay(index + 2) }}
                  >
                    <DashboardMetricCard colors={colors} fonts={fonts} metric={metric} onEditSlot={onEditSlot} />
                  </div>
                ))}
              </section>

              <div className="preview-rise" style={{ animationDelay: previewStaggerDelay(5) }}>
                <DashboardChannelPanel
                  colors={colors}
                  fonts={fonts}
                  range={range}
                  onEditSlot={onEditSlot}
                />
              </div>
            </div>

            <div className="preview-rise" style={{ animationDelay: previewStaggerDelay(6) }}>
              <DashboardAsidePanels
                colors={colors}
                fonts={fonts}
                activity={activity}
                onEditSlot={onEditSlot}
              />
            </div>
          </section>
        </main>
      </div>
    </PreviewSlotTarget>
  );
}
