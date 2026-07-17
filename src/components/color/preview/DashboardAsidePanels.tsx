'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { getPaletteProgressNote, previewStaggerDelay } from './dashboardPreviewData';
import { Avatar, ProgressBar, Tag } from './previewPrimitives';
import { bodyStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

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
  const paletteProgress = 68;
  const paletteNote = getPaletteProgressNote(paletteProgress);

  return (
    <aside className="flex min-w-0 flex-col gap-5">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Identidad Atelier Pigmento
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="mutedText"
          onEditSlot={onEditSlot}
          className="mt-2 max-w-[36ch]"
          style={bodyStyle(fonts, colors.mutedText)}
        >
          Una marca artística y cercana, lista para validar su sistema de color.
        </PreviewSlotTarget>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Tag label="Naming" color={colors.data1} surfaceHex={colors.surfaceElevated} slot="data1" onEditSlot={onEditSlot} />
          <Tag label="Color" color={colors.data2} surfaceHex={colors.surfaceElevated} slot="data2" onEditSlot={onEditSlot} />
          <Tag label="Tipografía" color={colors.data3} surfaceHex={colors.surfaceElevated} slot="data3" onEditSlot={onEditSlot} />
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              Progreso
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-xs font-bold tabular-nums">
              {paletteProgress}%
            </PreviewSlotTarget>
          </div>
          <ProgressBar value={paletteProgress} color={colors.accent} slot="accent" onEditSlot={onEditSlot} />
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={labelStyle(fonts, colors.mutedText)}>
            {paletteNote}
          </PreviewSlotTarget>
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Actividad reciente
        </PreviewSlotTarget>
        <div className="mt-4 space-y-3.5">
          {activity.map((item, index) => (
            <div
              key={item.label}
              className="preview-list-in flex items-start gap-3"
              style={{ animationDelay: previewStaggerDelay(index, 80) }}
            >
              <Avatar initials={item.initials} color={item.color} slot={item.slot} onEditSlot={onEditSlot} size={28} />
              <div className="min-w-0 pt-0.5">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={labelStyle(fonts)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5" style={bodyStyle(fonts, colors.mutedText)}>
                  {item.detail}
                </PreviewSlotTarget>
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>
    </aside>
  );
}
