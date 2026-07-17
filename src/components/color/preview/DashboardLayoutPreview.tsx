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
import { onVividFill, vividFill } from './previewColor';
import { SegmentedControl } from './previewPrimitives';
import { bodyStyle, DEFAULT_PREVIEW_FONTS, displayStyle, eyebrowStyle, labelStyle, previewRootTypeStyle, type PreviewFonts } from './previewTypography';

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

export const DASHBOARD_CONTAINER_CLASS = '@container/dashboard';

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [range, setRange] = useState<DashboardRange>('30d');
  const greeting = getStudioGreeting(new Date().getHours());
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimaryFill = onVividFill(primaryFill);
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

        <main className="min-w-0 flex-1 overflow-hidden p-5 @min-[900px]/dashboard:p-6 @min-[1120px]/dashboard:p-7">
          <header
            className="preview-rise flex flex-wrap items-end justify-between gap-x-4 gap-y-3"
            style={{ animationDelay: previewStaggerDelay(0) }}
          >
            <div className="min-w-0">
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={eyebrowStyle(fonts, colors.mutedText)}>
                El estudio de Craftie
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1" style={{ ...displayStyle(fonts), textWrap: 'balance' }}>
                {greeting}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="mt-2 max-w-[34ch] text-pretty"
                style={bodyStyle(fonts, colors.mutedText)}
              >
                {STUDIO_SUBTITLE}
              </PreviewSlotTarget>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <SegmentedControl
                options={DASHBOARD_RANGES}
                value={range}
                onChange={(next) => setRange(next as DashboardRange)}
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
                className="rounded-lg px-3.5 py-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgb(0_0_0/0.12)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimaryFill }}
              >
                Nuevo proyecto
              </PreviewSlotTarget>
            </div>
          </header>

          <section className="mt-6 grid min-w-0 gap-5 @min-[1120px]/dashboard:grid-cols-[minmax(0,1.75fr)_minmax(15rem,0.85fr)] @min-[1120px]/dashboard:gap-6">
            <div className="flex min-w-0 flex-col gap-5">
              <section className="grid grid-cols-2 gap-2.5 @min-[640px]/dashboard:grid-cols-4 @min-[640px]/dashboard:gap-3">
                <div
                  className="preview-rise col-span-2 @min-[640px]/dashboard:col-span-1"
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
