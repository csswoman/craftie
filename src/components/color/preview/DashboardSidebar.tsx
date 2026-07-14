'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DASHBOARD_NAV } from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { LiveDot, ProgressBar } from './previewPrimitives';
import type { PreviewFonts } from './previewTypography';

type DashboardSidebarProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  primaryFill: string;
  onPrimaryFill: string;
  onEditSlot?: PreviewSlotEditHandler;
};

export function DashboardSidebar({
  colors,
  fonts,
  primaryFill,
  onPrimaryFill,
  onEditSlot,
}: DashboardSidebarProps) {
  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className="hidden w-52 shrink-0 border-r p-4 lg:block"
      style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3">
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ backgroundColor: primaryFill, color: onPrimaryFill }}
          >
            <PreviewIcon name="zap" size={16} />
          </PreviewSlotTarget>
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate text-[0.8125rem] font-bold">
              Craftie Ops
            </PreviewSlotTarget>
            <LiveDot color={colors.success} slot="success" onEditSlot={onEditSlot} label="All systems live" />
          </div>
        </div>

        <nav className="mt-6 space-y-1 text-[0.75rem] font-semibold">
          {DASHBOARD_NAV.map((item, index) => (
            <PreviewSlotTarget
              key={item.label}
              slot={index === 0 ? 'surfaceElevated' : 'chrome'}
              onEditSlot={onEditSlot}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150"
              style={{ backgroundColor: index === 0 ? colors.surfaceElevated : 'transparent', color: index === 0 ? colors.primaryAction : colors.text }}
            >
              <PreviewIcon name={item.icon} size={15} />
              {item.label}
            </PreviewSlotTarget>
          ))}
        </nav>

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="mt-auto rounded-xl border p-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
            This week
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
            92% on track
          </PreviewSlotTarget>
          <div className="mt-2">
            <ProgressBar value={92} color={primaryFill} slot="primaryAction" onEditSlot={onEditSlot} />
          </div>
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
