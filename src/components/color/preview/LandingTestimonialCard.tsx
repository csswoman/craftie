'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { CRAFTIE_QUOTE } from './landingPreviewData';
import { Avatar, Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingTestimonialCardProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function LandingTestimonialCard({ colors, fonts, onEditSlot }: LandingTestimonialCardProps) {
  return (
    <blockquote className="preview-rise mt-14 max-w-[48ch]">
      <Tag
        label={CRAFTIE_QUOTE.badge}
        color={colors.success}
        surfaceHex={colors.appBackground}
        slot="success"
        onEditSlot={onEditSlot}
      />

      <PreviewSlotTarget
        slot="text"
        onEditSlot={onEditSlot}
        className="mt-4 text-pretty"
        style={{ ...bodyStyle(fonts), fontSize: '1.0625em', lineHeight: 1.55 }}
      >
        &ldquo;{CRAFTIE_QUOTE.text}&rdquo;
      </PreviewSlotTarget>

      <footer className="mt-5 flex items-center gap-3">
        <Avatar
          initials={CRAFTIE_QUOTE.initials}
          color={colors.primaryAction}
          slot="primaryAction"
          onEditSlot={onEditSlot}
          size={36}
        />
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
            {CRAFTIE_QUOTE.author}
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="truncate"
            style={captionStyle(fonts, colors.mutedText)}
          >
            {CRAFTIE_QUOTE.role}
          </PreviewSlotTarget>
        </div>
      </footer>
    </blockquote>
  );
}
