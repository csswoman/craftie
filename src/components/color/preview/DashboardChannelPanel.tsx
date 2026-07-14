'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import type { DashboardRange } from './dashboardPreviewData';
import { AreaChart } from './previewCharts';
import { Tag } from './previewPrimitives';
import type { PreviewFonts } from './previewTypography';

type DashboardChannelPanelProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  range: DashboardRange;
  onEditSlot?: PreviewSlotEditHandler;
};

export function DashboardChannelPanel({
  colors,
  fonts,
  range,
  onEditSlot,
}: DashboardChannelPanelProps) {
  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="mt-4 rounded-xl border p-4 lg:p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
            Channel performance
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
            Trailing {range} · updates live
          </PreviewSlotTarget>
        </div>
        <Tag label="Live" color={colors.accent} slot="accent" onEditSlot={onEditSlot} />
      </div>
      <div className="mt-4">
        <AreaChart values={[14, 22, 18, 28, 24, 33, 29, 38, 34, 42]} color={colors.accent} surfaceHex={colors.surface} />
      </div>
    </PreviewSlotTarget>
  );
}
