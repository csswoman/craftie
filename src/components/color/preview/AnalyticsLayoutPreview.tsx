'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsContrastTable } from './AnalyticsContrastTable';
import { AnalyticsDeliveriesPanel } from './AnalyticsDeliveriesPanel';
import { AnalyticsHabitsRow } from './AnalyticsHabitsRow';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { AnalyticsTimeSplit } from './AnalyticsTimeSplit';
import { AnalyticsTopBar } from './AnalyticsTopBar';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_KPIS,
  ANALYTICS_RANGES,
  ANALYTICS_SPLIT_CLASS,
  getAnalyticsGreeting,
} from './analyticsPreviewData';
import { previewStaggerDelay } from './dashboardPreviewData';
import { SegmentedControl } from './previewPrimitives';
import {
  bodyStyle,
  DEFAULT_PREVIEW_FONTS,
  displayStyle,
  type PreviewFonts,
  previewRootTypeStyle,
} from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

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
  'accent',
  'success',
  'warning',
  'error',
  'brand1',
  'brand2',
  'brand3',
  'brand4',
  'brand5',
  'brand6',
  'data1',
  'data2',
  'data3',
  'data4',
  'data5',
  'data6',
] as const;

export { ANALYTICS_CONTAINER_CLASS };

/**
 * Analytics page in four rows: KPI strip, the weekly deliveries hero chart,
 * contrast table beside the time split, then habits and goals. Chrome stays
 * neutral; the palette carries every data mark.
 */
export function AnalyticsLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const [range, setRange] = useState<string>('30d');
  const greeting = getAnalyticsGreeting(new Date().getHours());

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${ANALYTICS_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{ backgroundColor: colors.appBackground, color: colors.text, ...previewRootTypeStyle() }}
    >
      <AnalyticsTopBar colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

      <div className="space-y-6 p-6 @min-[900px]/analytics:px-8 @min-[900px]/analytics:py-8">
        <header className="preview-rise flex flex-wrap items-end justify-between gap-4" style={{ animationDelay: previewStaggerDelay(0) }}>
          <div className="min-w-0 max-w-[52ch]">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...displayStyle(fonts), textWrap: 'balance' }}>
              {tx(greeting)}
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2 text-pretty" style={bodyStyle(fonts, colors.mutedText)}>{t('ui.AnalyticsLayoutPreview.asi-avanza-el-estudio-paletas')}</PreviewSlotTarget>
          </div>
          <SegmentedControl
            options={ANALYTICS_RANGES}
            value={range}
            onChange={setRange}
            trackColor={colors.surfaceElevated}
            activeColor={colors.surface}
            activeText={colors.text}
            mutedText={colors.mutedText}
            trackSlot="surfaceElevated"
            onEditSlot={onEditSlot}
          />
        </header>

        <section className="@container/analyticsmain">
          <PreviewSlotTarget
            slot="divider"
            onEditSlot={onEditSlot}
            className="preview-rise grid grid-cols-2 gap-px overflow-hidden rounded-xl border @min-[640px]/analyticsmain:grid-cols-4"
            style={{ backgroundColor: colors.divider, borderColor: colors.border, animationDelay: previewStaggerDelay(1) }}
          >
            {ANALYTICS_KPIS.map((kpi) => (
              <AnalyticsMetricCard key={kpi.label} colors={colors} fonts={fonts} kpi={kpi} onEditSlot={onEditSlot} />
            ))}
          </PreviewSlotTarget>
        </section>

        <AnalyticsDeliveriesPanel colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

        <section className={`grid min-w-0 gap-6 ${ANALYTICS_SPLIT_CLASS}`}>
          <AnalyticsContrastTable colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          <AnalyticsTimeSplit colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </section>

        <AnalyticsHabitsRow colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </div>
    </PreviewSlotTarget>
  );
}
