'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PROOF_POINTS } from './landingPreviewData';
import { PreviewIcon } from './previewIcons';
import { Avatar, StatDelta } from './previewPrimitives';
import { bodyStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingTestimonialCardProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingTestimonialCard({ colors, fonts, onEditSlot }: LandingTestimonialCardProps) {
  return (
    <PreviewSlotTarget
      slot="surfaceElevated"
      onEditSlot={onEditSlot}
      className="rounded-xl border p-5 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials="JM" color={colors.primaryAction} slot="primaryAction" onEditSlot={onEditSlot} />
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.8125rem]" style={{ ...titleStyle(fonts), fontWeight: 600 }}>
              Jordan Mejía
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={labelStyle(fonts, colors.mutedText)}>
              Head of Brand, Aster
            </PreviewSlotTarget>
          </div>
        </div>
        <StatDelta value="Retention 96%" direction="up" color={colors.success} slot="success" onEditSlot={onEditSlot} />
      </div>
      <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 flex items-center gap-0.5" style={{ color: colors.primaryAction }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <PreviewIcon key={index} name="heart" size={11} strokeWidth={2} />
        ))}
      </PreviewSlotTarget>
      <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-3 text-[0.875rem]" style={{ ...bodyStyle(fonts), fontStyle: 'italic' }}>
        &ldquo;Shortened our launch cycle by half without losing the parts of our brand that make it recognizable.&rdquo;
      </PreviewSlotTarget>
      <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: colors.border }}>
        {PROOF_POINTS.map((item, index) => (
          <div key={item.label} className="flex items-start gap-3">
            <PreviewSlotTarget
              slot={item.slot}
              onEditSlot={onEditSlot}
              className="mt-1 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: [colors.data1, colors.data2, colors.data3][index] }}
            />
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={bodyStyle(fonts, colors.mutedText)}>
              {item.label}
            </PreviewSlotTarget>
          </div>
        ))}
      </div>
    </PreviewSlotTarget>
  );
}
