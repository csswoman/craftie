'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsPanel } from './AnalyticsPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_ACTIVITY_MIX } from './analyticsPreviewData';
import { DonutChart, type ChartSeries } from './previewCharts';
import { labelStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

/** Where the week's hours went: a thick donut and a legend table that highlights on hover. */
export function AnalyticsTimeSplit({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const [hovered, setHovered] = useState<string | null>(null);
  const series: ChartSeries[] = ANALYTICS_ACTIVITY_MIX.map((item) => ({
    label: item.label,
    value: item.value,
    display: item.display,
    color: colors[item.slot],
    slot: item.slot,
  }));
  const focus = series.find((item) => item.label === hovered) ?? series[0]!;

  return (
    <AnalyticsPanel colors={colors} fonts={fonts} title={t('ui.AnalyticsTimeSplit.reparto-del-tiempo')} subtitle={t('ui.AnalyticsTimeSplit.38-h-de-trabajo-esta')} onEditSlot={onEditSlot}>
      <div className="flex flex-1 flex-col items-center gap-5">
        <DonutChart segments={series} centerLabel={focus.label} centerValue={focus.display ?? ''} surfaceHex={colors.surface} size={156} />
        <ul className="w-full">
          {series.map((item) => (
            <li
              key={item.label}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-opacity duration-150"
              style={{ opacity: hovered && hovered !== item.label ? 0.45 : 1 }}
            >
              <PreviewSlotTarget slot={item.slot} onEditSlot={onEditSlot} className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 truncate" style={labelStyle(fonts, colors.text)}>
                {tx(item.label)}
              </span>
              <span className="tabular-nums" style={titleStyle(fonts)}>
                {tx(item.display)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnalyticsPanel>
  );
}
