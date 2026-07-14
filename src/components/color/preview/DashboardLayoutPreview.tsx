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
  type DashboardRange,
} from './dashboardPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { SegmentedControl } from './previewPrimitives';
import { DEFAULT_PREVIEW_FONTS, displayStyle, eyebrowStyle, labelStyle, type PreviewFonts } from './previewTypography';

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

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [range, setRange] = useState<DashboardRange>('30d');
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimaryFill = onVividFill(primaryFill);
  const activity = buildDashboardActivity(colors);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className="overflow-hidden rounded-xl border"
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text, fontFamily: fonts.bodyFamily }}
    >
      <div className="flex min-h-[34rem]">
        <DashboardSidebar
          colors={colors}
          fonts={fonts}
          primaryFill={primaryFill}
          onPrimaryFill={onPrimaryFill}
          onEditSlot={onEditSlot}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={eyebrowStyle(fonts, colors.mutedText)}>
                Week overview
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1.5 text-[1.5rem] sm:text-[1.75rem]" style={{ ...displayStyle(fonts), textWrap: 'balance' }}>
                Revenue operations
              </PreviewSlotTarget>
            </div>
            <div className="flex items-center gap-2">
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
                className="rounded-lg px-3.5 py-2 text-[0.75rem] transition-transform duration-200 hover:-translate-y-0.5"
                style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimaryFill }}
              >
                Export
              </PreviewSlotTarget>
            </div>
          </div>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.95fr)]">
            <div className="min-w-0">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {DASHBOARD_METRICS.map((metric) => (
                  <DashboardMetricCard key={metric.label} colors={colors} fonts={fonts} metric={metric} onEditSlot={onEditSlot} />
                ))}
              </section>
              <DashboardChannelPanel
                colors={colors}
                fonts={fonts}
                range={range}
                onEditSlot={onEditSlot}
              />
            </div>

            <DashboardAsidePanels
              colors={colors}
              fonts={fonts}
              activity={activity}
              onEditSlot={onEditSlot}
            />
          </section>
        </main>
      </div>
    </PreviewSlotTarget>
  );
}
