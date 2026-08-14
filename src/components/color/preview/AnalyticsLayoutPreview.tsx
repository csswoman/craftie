'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsAsidePanels } from './AnalyticsAsidePanels';
import { AnalyticsDetailPanels } from './AnalyticsDetailPanels';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { AnalyticsSourceInsights } from './AnalyticsSourceInsights';
import { AnalyticsTreatPanel } from './AnalyticsTreatPanel';
import { AnalyticsWorkspacePanels } from './AnalyticsWorkspacePanels';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_ACTIVITY_MIX,
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_KPIS,
  getAnalyticsGreeting,
} from './analyticsPreviewData';
import { previewStaggerDelay } from './dashboardPreviewData';
import { DonutChart, type ChartSeries } from './previewCharts';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import {
  bodyStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  displayStyle,
  headingStyle,
  labelStyle,
  previewRootTypeStyle,
  type PreviewFonts,
} from './previewTypography';

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
  'error',
  'data1',
  'data2',
  'data3',
  'data4',
  'data5',
  'data6',
] as const;

export { ANALYTICS_CONTAINER_CLASS };

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
  const greeting = getAnalyticsGreeting(new Date().getHours());
  const [featuredKpi, ...secondaryKpis] = ANALYTICS_KPIS;
  const series: ChartSeries[] = ANALYTICS_ACTIVITY_MIX.map((item) => ({
    label: item.label,
    value: item.value,
    display: item.display,
    color: colors[item.slot],
    slot: item.slot,
  }));

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${ANALYTICS_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <header
        className="preview-rise flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b px-6 py-5 @min-[900px]/analytics:px-8"
        style={{
          backgroundColor: colors.chrome,
          borderColor: colors.divider,
          animationDelay: previewStaggerDelay(0),
        }}
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
            Metas de perro artista: croquetas, carrera, pelota y charlar contigo.
          </PreviewSlotTarget>
        </div>
        <PreviewSlotTarget
          slot="border"
          onEditSlot={onEditSlot}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4"
          style={{
            ...labelStyle(fonts),
            fontWeight: 500,
            backgroundColor: 'transparent',
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          <PreviewIcon name="filter" size={13} />
          Filtrar día
        </PreviewSlotTarget>
      </header>

      <div className="min-h-[32rem] p-6 @min-[900px]/analytics:px-8 @min-[900px]/analytics:py-7">
        <section className="@container/analyticsmain">
          <div className="grid grid-cols-2 gap-3 @min-[400px]/analyticsmain:grid-cols-4 @min-[400px]/analyticsmain:gap-4">
            <div
              className="preview-rise col-span-2 @min-[400px]/analyticsmain:col-span-1"
              style={{ animationDelay: previewStaggerDelay(1) }}
            >
              <AnalyticsMetricCard colors={colors} fonts={fonts} kpi={featuredKpi} featured onEditSlot={onEditSlot} />
            </div>
            {secondaryKpis.map((kpi, index) => (
              <div key={kpi.label} className="preview-rise" style={{ animationDelay: previewStaggerDelay(index + 2) }}>
                <AnalyticsMetricCard colors={colors} fonts={fonts} kpi={kpi} onEditSlot={onEditSlot} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid min-w-0 gap-6 @min-[800px]/analytics:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="preview-rise flex h-full min-w-0 flex-col rounded-xl border p-5 @min-[800px]/analytics:p-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              animationDelay: previewStaggerDelay(5),
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="min-w-0">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
                  Cómo pasó el día
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="mt-2 max-w-[40ch] text-pretty"
                  style={bodyStyle(fonts, colors.mutedText)}
                >
                  Pasa el cursor por un segmento para ver dónde puso la energía Craftie.
                </PreviewSlotTarget>
              </div>
              <div className="flex items-center gap-4">
                <DonutChart
                  segments={series}
                  centerLabel="Día"
                  centerValue="100%"
                  surfaceHex={colors.surface}
                  size={132}
                />
                <ul className="space-y-2" style={captionStyle(fonts)}>
                  {series.map((item) => (
                    <li
                      key={item.label}
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex items-center gap-2 rounded-md px-1.5 py-0.5"
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
                      <span className="tabular-nums" style={{ color: colors.mutedText }}>
                        {item.display}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <AnalyticsSourceInsights colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          </PreviewSlotTarget>

          <div className="preview-rise min-w-0" style={{ animationDelay: previewStaggerDelay(6) }}>
            <AnalyticsAsidePanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
          </div>
        </section>

        <div className="mt-6">
          <AnalyticsTreatPanel colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </div>

        <AnalyticsDetailPanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        <AnalyticsWorkspacePanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </div>
    </PreviewSlotTarget>
  );
}
