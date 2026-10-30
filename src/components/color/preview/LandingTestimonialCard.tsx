'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { CRAFTIE_QUOTE } from './landingPreviewData';
import { paletteTint } from './previewButtons';
import { Avatar, Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, titleStyle, type PreviewFonts } from './previewTypography';

type LandingTestimonialCardProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

/** The quote sits on a wash of the accent, so the page ends in color instead of white space. */
export function LandingTestimonialCard({ colors, fonts, onEditSlot }: LandingTestimonialCardProps) {
  const wash = paletteTint(colors.accent, colors.appBackground, 0.14);
  const ink = readableOn(colors.text, wash);
  const muted = readableOn(colors.mutedText, wash);

  return (
    <PreviewSlotTarget
      slot="accent"
      onEditSlot={onEditSlot}
      className="preview-rise mt-14 rounded-[18px] p-6 @min-[720px]/landing:p-9"
      style={{ backgroundColor: wash, color: ink }}
    >
      <blockquote className="m-0 max-w-[48ch]">
        <Tag
          label={CRAFTIE_QUOTE.badge}
          color={colors.success}
          surfaceHex={wash}
          slot="success"
          onEditSlot={onEditSlot}
        />

        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="mt-4 text-pretty"
          style={{ ...bodyStyle(fonts, ink), fontSize: '1.0625em', lineHeight: 1.55 }}
        >
          &ldquo;{CRAFTIE_QUOTE.text}&rdquo;
        </PreviewSlotTarget>

        <footer className="mt-5 flex items-center gap-3">
          <Avatar
            initials={CRAFTIE_QUOTE.initials}
            color={colors.primaryAction}
            slot="primaryAction"
            onEditSlot={onEditSlot}
            surfaceHex={wash}
            size={36}
          />
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...titleStyle(fonts), color: ink }}>
              {CRAFTIE_QUOTE.author}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="truncate"
              style={captionStyle(fonts, muted)}
            >
              {CRAFTIE_QUOTE.role}
            </PreviewSlotTarget>
          </div>
        </footer>
      </blockquote>
    </PreviewSlotTarget>
  );
}
