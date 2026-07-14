'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Avatar } from './previewPrimitives';
import { bodyStyle, eyebrowStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

type DashboardActivityItem = {
  label: string;
  detail: string;
  initials: string;
  color: string;
  slot: 'data1' | 'data2' | 'data3';
};

type DashboardAsidePanelsProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  activity: readonly DashboardActivityItem[];
  onEditSlot?: PreviewSlotEditHandler;
};

export function DashboardAsidePanels({
  colors,
  fonts,
  activity,
  onEditSlot,
}: DashboardAsidePanelsProps) {
  return (
    <div className="grid gap-4">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={eyebrowStyle(fonts, colors.mutedText)}>
          Focus
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1.5 text-[1.125rem]" style={headingStyle(fonts)}>
          Revenue quality
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 text-[0.8125rem]" style={bodyStyle(fonts, colors.mutedText)}>
          Keep the chrome quiet so the selected palette is judged on hierarchy, data color, and CTA emphasis.
        </PreviewSlotTarget>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1.125rem]" style={headingStyle(fonts)}>
          Activity
        </PreviewSlotTarget>
        <div className="mt-4 space-y-3">
          {activity.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <Avatar initials={item.initials} color={item.color} slot={item.slot} onEditSlot={onEditSlot} size={26} />
              <div className="min-w-0">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.8125rem]" style={labelStyle(fonts)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.75rem]" style={bodyStyle(fonts, colors.mutedText)}>
                  {item.detail}
                </PreviewSlotTarget>
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
