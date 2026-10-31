'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsPanel } from './AnalyticsPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_DELIVERY_TYPES,
  ANALYTICS_WEEKLY_DELIVERIES,
  deliveryWeekTotal,
} from './analyticsPreviewData';
import { paletteTint } from './previewButtons';
import { StatDelta } from './previewPrimitives';
import { captionStyle, displayStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

const GRID_STEPS = [0, 15, 30, 45] as const;

/**
 * Hero chart: twelve weeks of deliveries as stacked columns, one palette color
 * per type, with the totals by type beside it. Hovering a week dims the rest.
 */
export function AnalyticsDeliveriesPanel({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const weeks = ANALYTICS_WEEKLY_DELIVERIES;
  const ceiling = GRID_STEPS[GRID_STEPS.length - 1]!;
  const totals = ANALYTICS_DELIVERY_TYPES.map((type) => ({
    ...type,
    value: weeks.reduce((sum, week) => sum + week[type.key], 0),
  }));
  const grand = totals.reduce((sum, type) => sum + type.value, 0);
  const latest = weeks[weeks.length - 1]!;

  return (
    <AnalyticsPanel
      colors={colors}
      fonts={fonts}
      title="Entregas por semana"
      subtitle="Últimas 12 semanas, por tipo de entrega"
      onEditSlot={onEditSlot}
      trailing={
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Leyenda">
          {ANALYTICS_DELIVERY_TYPES.map((type) => (
            <li key={type.key} className="flex items-center gap-1.5" style={labelStyle(fonts, colors.mutedText)}>
              <PreviewSlotTarget slot={type.slot} onEditSlot={onEditSlot} className="size-2.5 rounded-[3px]" style={{ backgroundColor: colors[type.slot] }} />
              {type.label}
            </li>
          ))}
        </ul>
      }
    >
      <div className="grid gap-6 pt-3 @min-[700px]/analytics:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
          <div className="relative h-52" style={captionStyle(fonts, colors.mutedText)} aria-hidden="true">
            {GRID_STEPS.map((step) => (
              <span key={step} className="absolute right-0 -translate-y-1/2 tabular-nums" style={{ bottom: `${(step / ceiling) * 100}%` }}>
                {step}
              </span>
            ))}
          </div>
          <div className="relative h-52">
            {GRID_STEPS.map((step) => (
              <PreviewSlotTarget
                key={step}
                slot="divider"
                onEditSlot={onEditSlot}
                className="absolute inset-x-0 border-t"
                style={{ bottom: `${(step / ceiling) * 100}%`, borderColor: colors.divider, borderStyle: step === 0 ? 'solid' : 'dashed' }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-[6%] px-1">
              {weeks.map((week, index) => {
                const dimmed = hovered !== null && hovered !== week.week;

                return (
                  <div
                    key={week.week}
                    onMouseEnter={() => setHovered(week.week)}
                    onMouseLeave={() => setHovered(null)}
                    className="preview-bar-grow flex h-full min-w-0 flex-1 flex-col-reverse gap-[2px] transition-opacity duration-150"
                    style={{ opacity: dimmed ? 0.35 : 1, animationDelay: `${index * 30}ms` }}
                    aria-label={`${week.week}: ${deliveryWeekTotal(week)} entregas`}
                  >
                    {ANALYTICS_DELIVERY_TYPES.map((type, layer) => (
                      <PreviewSlotTarget
                        key={type.key}
                        slot={type.slot}
                        onEditSlot={onEditSlot}
                        className={layer === ANALYTICS_DELIVERY_TYPES.length - 1 ? 'rounded-t-[4px]' : ''}
                        style={{ height: `${(week[type.key] / ceiling) * 100}%`, backgroundColor: colors[type.slot] }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <span />
          <div className="mt-2 flex gap-[6%] px-1" style={captionStyle(fonts, colors.mutedText)} aria-hidden="true">
            {weeks.map((week, index) => (
              <span key={week.week} className="min-w-0 flex-1 text-center tabular-nums">
                {index % 2 === 1 ? week.week : ''}
              </span>
            ))}
          </div>
        </div>

        <PreviewSlotTarget
          slot="divider"
          onEditSlot={onEditSlot}
          className="flex flex-col gap-5 border-t pt-5 @min-[700px]/analytics:border-l @min-[700px]/analytics:border-t-0 @min-[700px]/analytics:pl-6 @min-[700px]/analytics:pt-0"
          style={{ borderColor: colors.divider }}
        >
          <div>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              Total del periodo
            </PreviewSlotTarget>
            <div className="mt-1 flex items-baseline gap-2">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={{ ...displayStyle(fonts), lineHeight: 1 }}>
                {grand}
              </PreviewSlotTarget>
              <StatDelta value="12%" direction="up" color={colors.success} slot="success" surfaceHex={colors.surface} onEditSlot={onEditSlot} />
            </div>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={captionStyle(fonts, colors.mutedText)}>
              {deliveryWeekTotal(latest)} esta semana
            </PreviewSlotTarget>
          </div>

          <ul className="space-y-3.5">
            {totals.map((type) => {
              const share = Math.round((type.value / grand) * 100);

              return (
                <li key={type.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span style={labelStyle(fonts, colors.text)}>{type.label}</span>
                    <span className="tabular-nums" style={titleStyle(fonts)}>
                      {type.value}
                      <span className="ml-1.5" style={captionStyle(fonts, colors.mutedText)}>{share}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: paletteTint(colors[type.slot] ?? colors.accent, colors.surface, 0.18) }}>
                    <PreviewSlotTarget slot={type.slot} onEditSlot={onEditSlot} className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: colors[type.slot] }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </PreviewSlotTarget>
      </div>
    </AnalyticsPanel>
  );
}
