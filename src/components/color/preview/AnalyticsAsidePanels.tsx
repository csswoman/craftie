'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAY_STATS, ANALYTICS_TOP_ACTIVITIES } from './analyticsPreviewData';
import type { ChartSeries } from './previewCharts';
import { StatDelta, tint } from './previewPrimitives';
import { displayStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
        className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Estado de ánimo
        </PreviewSlotTarget>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 @min-[1000px]/analytics:grid-cols-1">
          {ANALYTICS_DAY_STATS.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <div>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="mt-1 block tabular-nums"
                  style={displayStyle(fonts)}
                >
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
        className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Mix del día
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="shrink-0 tabular-nums"
            style={labelStyle(fonts, colors.mutedText)}
          >
            100%
          </PreviewSlotTarget>
        </div>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          {series.map((item) => (
            <PreviewSlotTarget
              key={item.label}
              slot={item.slot}
              onEditSlot={onEditSlot}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {series.map((item) => (
            <div key={item.label} className="preview-list-in">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <PreviewSlotTarget
                    slot={item.slot}
                    onEditSlot={onEditSlot}
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={titleStyle(fonts)}>
                    {item.label}
                  </PreviewSlotTarget>
                </span>
                <span className="shrink-0 tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                  {item.display}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: tint(item.color, 14) }}>
                <PreviewSlotTarget
                  slot={item.slot}
                  onEditSlot={onEditSlot}
                  className="block h-full rounded-full"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Sitios favoritos
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="shrink-0"
            style={labelStyle(fonts, colors.mutedText)}
          >
            Top 4
          </PreviewSlotTarget>
        </div>
        <div className="mt-4 space-y-3">
          {ANALYTICS_TOP_ACTIVITIES.map((place, index) => (
            <div
              key={place.label}
              className="preview-list-in"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold tabular-nums"
                  style={{ backgroundColor: tint(colors[place.slot], 14), color: colors[place.slot] }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1" title={place.label}>
                  <PreviewSlotTarget
                    slot="text"
                    onEditSlot={onEditSlot}
                    className="block truncate"
                    style={titleStyle(fonts)}
                  >
                    {place.label}
                  </PreviewSlotTarget>
                </div>
                <span className="shrink-0 tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                  {place.share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: tint(colors[place.slot], 14) }}>
                <PreviewSlotTarget
                  slot={place.slot}
                  onEditSlot={onEditSlot}
                  className="block h-full rounded-full"
                  style={{ width: `${place.share}%`, backgroundColor: colors[place.slot] }}
                />
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
