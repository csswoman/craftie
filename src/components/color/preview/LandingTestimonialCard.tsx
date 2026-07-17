'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { CRAFTIE_QUOTE } from './landingPreviewData';
import { Avatar, Tag } from './previewPrimitives';
import { bodyStyle, labelStyle, type PreviewFonts } from './previewTypography';

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
      className="rounded-[14px] border p-5"
      style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
    >
      <Tag
        label={CRAFTIE_QUOTE.badge}
        color={colors.success}
        surfaceHex={colors.surfaceElevated}
        slot="success"
        onEditSlot={onEditSlot}
      />

      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="mt-4 max-w-[40ch] text-pretty"
        style={{ ...bodyStyle(fonts), fontSize: '1.05em', lineHeight: 1.5 }}
      >
        &ldquo;{CRAFTIE_QUOTE.text}&rdquo;
      </PreviewSlotTarget>

      <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: colors.border }}>
        <Avatar
          initials={CRAFTIE_QUOTE.initials}
          color={colors.primaryAction}
          slot="primaryAction"
          onEditSlot={onEditSlot}
          size={36}
        />
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={labelStyle(fonts)}>
            {CRAFTIE_QUOTE.author}
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="truncate"
            style={labelStyle(fonts, colors.mutedText)}
          >
            {CRAFTIE_QUOTE.role}
          </PreviewSlotTarget>
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
