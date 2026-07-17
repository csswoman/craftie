'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsAsidePanels } from './AnalyticsAsidePanels';
import { AnalyticsDetailPanels } from './AnalyticsDetailPanels';
import { AnalyticsSourceInsights } from './AnalyticsSourceInsights';
import { AnalyticsWorkspacePanels } from './AnalyticsWorkspacePanels';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_ACTIVITY_MIX,
  ANALYTICS_CONTAINER_CLASS,
  ANALYTICS_KPIS,
  getAnalyticsGreeting,
} from './analyticsPreviewData';
import { previewStaggerDelay } from './dashboardPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { DonutChart, Sparkline, type ChartSeries } from './previewCharts';
import { PreviewIcon } from './previewIcons';
import { StatDelta, tint } from './previewPrimitives';
import {
  bodyStyle,
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
  const filterFill = vividFill(colors.primaryAction, colors.surface);
  const greeting = getAnalyticsGreeting(new Date().getHours());
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
      <div className="min-h-[32rem] p-4 sm:p-5 lg:p-6">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="preview-rise mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border px-4 py-3"
          style={{
            backgroundColor: colors.chrome,
            borderColor: colors.border,
            animationDelay: previewStaggerDelay(0),
          }}
        >
          <div className="min-w-0">
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              Diario de Craftie
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-0.5" style={headingStyle(fonts)}>
              {greeting}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="mt-1 max-w-[42ch] text-pretty"
              style={bodyStyle(fonts, colors.mutedText)}
            >
              Metas de perro artista: croquetas, carrera, pelota y charlar contigo.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{
              ...labelStyle(fonts),
              backgroundColor: filterFill,
              color: onVividFill(filterFill),
              outlineColor: colors.primaryAction,
            }}
          >
            <PreviewIcon name="filter" size={13} />
            Filtrar día
          </PreviewSlotTarget>
        </PreviewSlotTarget>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 @min-[900px]/analytics:grid-cols-4">
          {ANALYTICS_KPIS.map((kpi, index) => {
            const kpiColor = colors[kpi.slot];
            const trendColor = kpi.dir === 'up' ? colors.success : colors.error;
            const trendSlot = kpi.dir === 'up' ? ('success' as const) : ('error' as const);

            return (
              <PreviewSlotTarget
                key={kpi.label}
                slot="surface"
                onEditSlot={onEditSlot}
                className="preview-rise rounded-[14px] border p-3.5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  animationDelay: previewStaggerDelay(index + 1),
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
                    {kpi.label}
                  </PreviewSlotTarget>
                  <StatDelta value={kpi.trend} direction={kpi.dir} color={trendColor} slot={trendSlot} onEditSlot={onEditSlot} />
                </div>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 tabular-nums" style={displayStyle(fonts)}>
                  {kpi.value}
                </PreviewSlotTarget>
                <div className="mt-2.5">
                  <Sparkline values={[...kpi.spark]} color={kpiColor} surfaceHex={colors.surface} height={26} />
                </div>
              </PreviewSlotTarget>
            );
          })}
        </section>

        <section className="grid gap-4 @min-[1000px]/analytics:grid-cols-[minmax(0,1.4fr)_minmax(17.5rem,0.95fr)]">
          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="preview-rise flex h-full flex-col rounded-[14px] border p-4 lg:p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              animationDelay: previewStaggerDelay(5),
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
                  Cómo pasó el día
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="mt-1 max-w-[40ch] text-pretty"
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
                <ul className="space-y-1.5" style={labelStyle(fonts)}>
                  {series.map((item) => (
                    <li
                      key={item.label}
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex items-center gap-2 rounded-md px-1.5 py-0.5 transition-[background-color,opacity] duration-150"
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
            <AnalyticsAsidePanels colors={colors} fonts={fonts} series={series} onEditSlot={onEditSlot} />
          </div>
        </section>

        <AnalyticsDetailPanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        <AnalyticsWorkspacePanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
      </div>
    </PreviewSlotTarget>
  );
}
