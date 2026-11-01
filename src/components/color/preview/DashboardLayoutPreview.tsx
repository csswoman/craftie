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
import {
  bodyStyle,
  buttonStyle,
  DEFAULT_PREVIEW_FONTS,
  displayStyle,
  type PreviewFonts,
  previewRootTypeStyle,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

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

export const DASHBOARD_CONTAINER_CLASS = 'preview-root @container/dashboard';

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const [range, setRange] = useState<DashboardRange>('30d');
  const greeting = getStudioGreeting(new Date().getHours());
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimaryFill = colors.primaryActionText;
  const activity = buildDashboardActivity(colors);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${DASHBOARD_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{ backgroundColor: colors.appBackground, color: colors.text, ...previewRootTypeStyle() }}
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
                {tx(greeting)}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="mt-3 text-pretty"
                style={bodyStyle(fonts, colors.mutedText)}
              >
                {tx(STUDIO_SUBTITLE)}
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
                style={{ ...buttonStyle(fonts), backgroundColor: primaryFill, color: onPrimaryFill }}
              >{t('ui.DashboardLayoutPreview.nuevo-proyecto')}</PreviewSlotTarget>
            </div>
          </header>

          <div className="@container/dashkpi mt-8">
            <PreviewSlotTarget
              slot="divider"
              onEditSlot={onEditSlot}
              className="preview-rise grid grid-cols-2 gap-px overflow-hidden rounded-xl border @min-[640px]/dashkpi:grid-cols-4"
              style={{ backgroundColor: colors.divider, borderColor: colors.border, animationDelay: previewStaggerDelay(1) }}
            >
              {DASHBOARD_METRICS.map((metric) => (
                <DashboardMetricCard key={metric.label} colors={colors} fonts={fonts} metric={metric} onEditSlot={onEditSlot} />
              ))}
            </PreviewSlotTarget>
          </div>

          <section className="mt-6 grid min-w-0 gap-6 @min-[800px]/dashboard:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.9fr)]">
            <div className="@container/dashmain flex min-w-0 flex-col gap-6">
              <div className="preview-rise h-full" style={{ animationDelay: previewStaggerDelay(5) }}>
                <DashboardChannelPanel
                  colors={colors}
                  fonts={fonts}
                  range={range}
                  onEditSlot={onEditSlot}
                />
              </div>
            </div>

            <div className="preview-rise flex min-w-0" style={{ animationDelay: previewStaggerDelay(6) }}>
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
