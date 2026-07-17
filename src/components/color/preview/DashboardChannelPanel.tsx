'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  getPaletteReviewStatus,
  PALETTE_REVIEW_ROLES,
  previewStaggerDelay,
  type DashboardRange,
} from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { Tag } from './previewPrimitives';
import { bodyStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

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
  const pendingCount = PALETTE_REVIEW_ROLES.filter((role) => role.pending).length;
  const statusLabel = getPaletteReviewStatus(pendingCount);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-xl border p-4 @min-[900px]/dashboard:p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-[48ch]">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Paleta en desarrollo
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={bodyStyle(fonts, colors.mutedText)}>
            Identidad para Atelier Pigmento · últimos {range}
          </PreviewSlotTarget>
        </div>
        <Tag label={statusLabel} color={colors.accent} surfaceHex={colors.surface} slot="accent" onEditSlot={onEditSlot} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 @min-[900px]/dashboard:grid-cols-4">
        {PALETTE_REVIEW_ROLES.map((role, index) => (
          <div key={role.label} className="min-w-0">
            <PreviewSlotTarget
              slot={role.slot}
              onEditSlot={onEditSlot}
              className="preview-segment-in h-16 rounded-lg"
              style={{
                backgroundColor: colors[role.slot],
                animationDelay: previewStaggerDelay(index, 70),
                transformOrigin: 'left center',
              }}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="min-w-0 truncate" style={labelStyle(fonts)}>
                {role.label}
              </PreviewSlotTarget>
              {role.pending ? (
                <PreviewSlotTarget
                  slot="accent"
                  onEditSlot={onEditSlot}
                  className="shrink-0 whitespace-nowrap text-[0.6875rem] font-semibold"
                  style={{ color: colors.accent }}
                >
                  Ajustar
                </PreviewSlotTarget>
              ) : (
                <PreviewSlotTarget
                  slot="success"
                  onEditSlot={onEditSlot}
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[0.6875rem] font-semibold"
                  style={{ color: colors.success }}
                >
                  <PreviewIcon name="check" size={11} strokeWidth={2.5} />
                  AA
                </PreviewSlotTarget>
              )}
            </div>
          </div>
        ))}
      </div>

      <PreviewSlotTarget
        slot="divider"
        onEditSlot={onEditSlot}
        className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: colors.divider }}
      >
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
          Contraste AA · 12 de 14 pares aprobados
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="primaryAction"
          onEditSlot={onEditSlot}
          className="flex items-center gap-1.5 transition-transform duration-200 ease-out hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0"
          style={{ ...labelStyle(fonts), fontWeight: 600, color: colors.primaryAction }}
        >
          Revisar contraste
          <PreviewIcon name="arrowRight" size={13} strokeWidth={2.25} />
        </PreviewSlotTarget>
      </PreviewSlotTarget>
    </PreviewSlotTarget>
  );
}
