'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { getPaletteProgressNote, previewStaggerDelay } from './dashboardPreviewData';
import { Avatar, ProgressBar, Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
    <aside className="flex min-w-0 flex-col gap-6">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5 @min-[800px]/dashboard:p-6"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Atelier Pigmento
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="mutedText"
          onEditSlot={onEditSlot}
          className="mt-3 max-w-[40ch] text-pretty"
          style={bodyStyle(fonts, colors.mutedText)}
        >
          El fondo todavía no cumple AA. El resto de la paleta ya está nombrado.
        </PreviewSlotTarget>
        <div className="mt-5 flex flex-wrap gap-2">
          <Tag label="Nombres" color={colors.data1} surfaceHex={colors.surfaceElevated} slot="data1" onEditSlot={onEditSlot} />
          <Tag label="Color" color={colors.data2} surfaceHex={colors.surfaceElevated} slot="data2" onEditSlot={onEditSlot} />
          <Tag label="Tipografía" color={colors.data3} surfaceHex={colors.surfaceElevated} slot="data3" onEditSlot={onEditSlot} />
        </div>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
              Sistema de marca
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={titleStyle(fonts)}>
              {paletteProgress}%
            </PreviewSlotTarget>
          </div>
          <ProgressBar value={paletteProgress} color={colors.accent} slot="accent" onEditSlot={onEditSlot} />
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3" style={captionStyle(fonts, colors.mutedText)}>
            {paletteNote}
          </PreviewSlotTarget>
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5 @min-[800px]/dashboard:p-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Actividad
        </PreviewSlotTarget>
        <div className="mt-5 space-y-4">
          {activity.map((item, index) => (
            <div
              key={item.label}
              className="preview-list-in flex items-start gap-3"
              style={{ animationDelay: previewStaggerDelay(index, 80) }}
            >
              <Avatar initials={item.initials} color={item.color} slot={item.slot} onEditSlot={onEditSlot} size={28} />
              <div className="min-w-0 pt-0.5">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={captionStyle(fonts, colors.mutedText)}>
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
