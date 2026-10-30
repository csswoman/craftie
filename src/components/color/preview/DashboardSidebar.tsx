'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DASHBOARD_NAV, getWeeklyRhythmNote } from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { readableInk } from './previewColor';
import { LiveDot, ProgressBar } from './previewPrimitives';
import {
  brandStyle,
  captionStyle,
  headingStyle,
  type PreviewFonts,
  ROLE_WEIGHT,
} from './previewTypography';

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
  const weeklyPercent = 92;
  const weeklyNote = getWeeklyRhythmNote(weeklyPercent);
  const activeInk = readableInk(colors.primaryAction, colors.surfaceElevated);

  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className="preview-rise hidden w-60 shrink-0 border-r p-6 @min-[900px]/dashboard:block"
      style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
    >
      <div className="flex h-full flex-col gap-8">
        <div className="flex items-center gap-3">
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-200 ease-out hover:rotate-[-2deg] motion-reduce:transition-none motion-reduce:hover:rotate-0"
            style={{ backgroundColor: primaryFill, color: onPrimaryFill }}
          >
            <span className="text-sm" style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-heading)' }} aria-label="Craftie, perro diseñador">C</span>
            <PreviewIcon
              name="sparkles"
              size={10}
              className="pointer-events-none absolute -right-0.5 -top-0.5 opacity-85"
            />
          </PreviewSlotTarget>
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate" style={brandStyle(fonts)}>
              Craftie
            </PreviewSlotTarget>
            <LiveDot
              color={colors.success}
              slot="success"
              onEditSlot={onEditSlot}
              label="En el estudio"
              surfaceHex={colors.chrome}
            />
          </div>
        </div>

        <nav className="space-y-1" style={captionStyle(fonts)}>
          {DASHBOARD_NAV.map((item, index) => (
            <PreviewSlotTarget
              key={item.label}
              slot={index === 0 ? 'surfaceElevated' : 'chrome'}
              onEditSlot={onEditSlot}
              className="flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150"
              style={{
                backgroundColor: index === 0 ? colors.surfaceElevated : 'transparent',
                color: index === 0 ? activeInk : colors.text,
                fontWeight: index === 0 ? ROLE_WEIGHT.button : ROLE_WEIGHT.label,
              }}
            >
              <PreviewIcon name={item.icon} size={15} />
              <span className="min-w-0 truncate">{item.label}</span>
            </PreviewSlotTarget>
          ))}
        </nav>

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="mt-auto preview-surface rounded-xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
            Esta semana
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 tabular-nums" style={headingStyle(fonts)}>
            {weeklyPercent}%
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={captionStyle(fonts, colors.mutedText)}>
            {weeklyNote}
          </PreviewSlotTarget>
          <div className="mt-4">
            <ProgressBar value={weeklyPercent} color={primaryFill} slot="primaryAction" onEditSlot={onEditSlot} />
          </div>
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
