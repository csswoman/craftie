'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  dashboardRangeLabel,
  getPaletteReviewStatus,
  PALETTE_REVIEW_ROLES,
  previewStaggerDelay,
  type DashboardRange,
} from './dashboardPreviewData';
import { PreviewIcon } from './previewIcons';
import { readableInk } from './previewColor';
import { Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
  const actionInk = readableInk(colors.primaryAction, colors.surface);
  const accentInk = readableInk(colors.accent, colors.surface);
  const successInk = readableInk(colors.success, colors.surface);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="preview-surface rounded-xl border p-5 @min-[900px]/dashboard:p-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-[48ch]">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Revisión de paleta
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={bodyStyle(fonts, colors.mutedText)}>
            Atelier Pigmento · últimos {dashboardRangeLabel(range)}
          </PreviewSlotTarget>
        </div>
        <Tag label={statusLabel} color={colors.accent} surfaceHex={colors.surface} slot="accent" onEditSlot={onEditSlot} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 @min-[480px]/dashmain:grid-cols-4">
        {PALETTE_REVIEW_ROLES.map((role, index) => (
          <div key={role.label} className="min-w-0">
            <PreviewSlotTarget
              slot={role.slot}
              onEditSlot={onEditSlot}
              className="preview-segment-in h-[4.5rem] rounded-lg"
              style={{
                backgroundColor: colors[role.slot],
                animationDelay: previewStaggerDelay(index, 70),
                transformOrigin: 'left center',
              }}
            />
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="min-w-0 truncate" style={captionStyle(fonts)}>
                {role.label}
              </PreviewSlotTarget>
              {role.pending ? (
                <PreviewSlotTarget
                  slot="accent"
                  onEditSlot={onEditSlot}
                  className="shrink-0 whitespace-nowrap"
                  style={{ ...captionStyle(fonts), color: accentInk }}
                >
                  Ajustar
                </PreviewSlotTarget>
              ) : (
                <PreviewSlotTarget
                  slot="success"
                  onEditSlot={onEditSlot}
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap"
                  style={{ ...captionStyle(fonts), color: successInk }}
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
        className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderColor: colors.divider }}
      >
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          12 de 14 pares cumplen AA
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="primaryAction"
          onEditSlot={onEditSlot}
          className="flex items-center gap-1.5 transition-transform duration-200 ease-out hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0"
          style={{ ...titleStyle(fonts), fontSize: 'var(--size-small)', color: actionInk }}
        >
          Revisar contraste
          <PreviewIcon name="arrowRight" size={13} strokeWidth={2.25} />
        </PreviewSlotTarget>
      </PreviewSlotTarget>
    </PreviewSlotTarget>
  );
}
