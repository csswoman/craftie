import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsChatPanel } from './AnalyticsChatPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_ENERGY_BY_DAY,
  ANALYTICS_ENERGY_INSIGHTS,
  ANALYTICS_GOALS,
  ANALYTICS_WEEK_ENERGY,
  ANALYTICS_WEEK_ENERGY_PREV,
} from './analyticsPreviewData';
import { AreaChart } from './previewCharts';
import { SegmentMeter } from './previewDataDisplays';
import { tint } from './previewPrimitives';
import { bodyStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type DetailPanelProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function AnalyticsDetailPanels({ colors, fonts, onEditSlot }: DetailPanelProps) {
  const peakDay = ANALYTICS_ENERGY_BY_DAY.reduce((best, day) => (day.value > best.value ? day : best));

  return (
    <div className="mt-4 grid gap-4">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="preview-rise rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Energía de la semana
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="mt-1 max-w-[44ch] text-pretty"
              style={bodyStyle(fonts, colors.mutedText)}
            >
              Cuánta cola movió Craftie de lunes a domingo.
            </PreviewSlotTarget>
          </div>
          <div className="flex items-center gap-3" style={labelStyle(fonts, colors.mutedText)}>
            <span className="inline-flex items-center gap-1.5">
              <PreviewSlotTarget
                slot="data1"
                onEditSlot={onEditSlot}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.data1 }}
              />
              Esta semana
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0 w-4 border-t border-dashed"
                style={{ borderColor: colors.mutedText }}
                aria-hidden="true"
              />
              Anterior
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 @min-[900px]/analytics:grid-cols-[minmax(0,1.35fr)_minmax(13rem,0.85fr)]">
          <div className="min-w-0">
            <PreviewSlotTarget slot="data1" onEditSlot={onEditSlot} className="block">
              <AreaChart
                values={[...ANALYTICS_WEEK_ENERGY]}
                compareValues={[...ANALYTICS_WEEK_ENERGY_PREV]}
                compareColor={tint(colors.mutedText, 55)}
                color={colors.data1}
                surfaceHex={colors.surfaceElevated}
                height={128}
              />
            </PreviewSlotTarget>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center" style={labelStyle(fonts, colors.mutedText)}>
              {ANALYTICS_ENERGY_BY_DAY.map((day) => (
                <div key={day.day} className="min-w-0">
                  <span
                    className="block tabular-nums font-semibold"
                    style={{
                      color: day.day === peakDay.day ? colors.data1 : colors.text,
                      fontSize: '0.75rem',
                    }}
                  >
                    {day.value}
                  </span>
                  <span>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-2.5">
            {ANALYTICS_ENERGY_INSIGHTS.map((insight) => (
              <div
                key={insight.label}
                className="rounded-[10px] px-3 py-2.5"
                style={{ backgroundColor: tint(colors.mutedText, 8) }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <PreviewSlotTarget
                    slot="mutedText"
                    onEditSlot={onEditSlot}
                    className="block"
                    style={labelStyle(fonts, colors.mutedText)}
                  >
                    {insight.label}
                  </PreviewSlotTarget>
                  <PreviewSlotTarget
                    slot={insight.slot}
                    onEditSlot={onEditSlot}
                    className="tabular-nums"
                    style={{ ...titleStyle(fonts), color: colors[insight.slot], fontWeight: 700 }}
                  >
                    {insight.value}
                  </PreviewSlotTarget>
                </div>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="mt-0.5 block"
                  style={labelStyle(fonts, colors.mutedText)}
                >
                  {insight.detail}
                </PreviewSlotTarget>
              </div>
            ))}

            <div
              className="rounded-[10px] border px-3 py-2.5"
              style={{ borderColor: colors.border, backgroundColor: tint(colors.mutedText, 6) }}
            >
              <PreviewSlotTarget
                slot="mutedText"
                onEditSlot={onEditSlot}
                className="block"
                style={labelStyle(fonts, colors.mutedText)}
              >
                Nota del día
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="text"
                onEditSlot={onEditSlot}
                className="mt-1 block text-pretty"
                style={bodyStyle(fonts)}
              >
                {peakDay.day} lideró la cola: más movimiento que el resto de la semana.
              </PreviewSlotTarget>
            </div>
          </div>
        </div>
      </PreviewSlotTarget>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsChatPanel colors={colors} fonts={fonts} onEditSlot={onEditSlot} />

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between gap-3">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Metas de Craftie
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              Este mes
            </PreviewSlotTarget>
          </div>
          <div className="mt-5 space-y-5">
            {ANALYTICS_GOALS.map((goal) => (
              <div key={goal.label}>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block" style={titleStyle(fonts)}>
                      {goal.label}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget
                      slot="mutedText"
                      onEditSlot={onEditSlot}
                      className="block"
                      style={labelStyle(fonts, colors.mutedText)}
                    >
                      {goal.total}
                    </PreviewSlotTarget>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums" style={titleStyle(fonts)}>
                    {goal.value}%
                  </span>
                </div>
                <SegmentMeter value={goal.value} color={colors[goal.slot]} slot={goal.slot} onEditSlot={onEditSlot} />
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </div>
    </div>
  );
}
