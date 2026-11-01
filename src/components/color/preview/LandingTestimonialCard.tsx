'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { CRAFTIE_QUOTE, LANDING_GUTTER_CLASS } from './landingPreviewData';
import { paletteTint } from './previewButtons';
import { Avatar, Tag } from './previewPrimitives';
import { captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

type LandingTestimonialCardProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

/** Full-bleed band on a wash of the accent: the page ends in color, without a card inside the page. */
export function LandingTestimonialCard({ colors, fonts, onEditSlot }: LandingTestimonialCardProps) {
  const tx = useTx();
  const t = useT();
  const wash = paletteTint(colors.accent, colors.appBackground, 0.14);
  const ink = readableOn(colors.text, wash);
  const muted = readableOn(colors.mutedText, wash);

  return (
    <PreviewSlotTarget
      slot="accent"
      onEditSlot={onEditSlot}
      className={`preview-rise py-12 ${LANDING_GUTTER_CLASS} @min-[720px]/landing:py-16`}
      style={{ backgroundColor: wash, color: ink }}
    >
      <blockquote className="m-0 mx-auto flex max-w-[52ch] flex-col items-center text-center">
        <Tag
          label={tx(CRAFTIE_QUOTE.badge)}
          color={colors.success}
          surfaceHex={wash}
          slot="success"
          onEditSlot={onEditSlot}
        />

        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="mt-5 text-balance"
          style={{ ...headingStyle(fonts), color: ink, lineHeight: 1.3 }}
        >{t('ui.LandingTestimonialCard.ldquo-rdquo', { text: tx(CRAFTIE_QUOTE.text) })}</PreviewSlotTarget>

        <footer className="mt-6 flex items-center gap-3 text-left">
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
              {tx(CRAFTIE_QUOTE.author)}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="truncate"
              style={captionStyle(fonts, muted)}
            >
              {tx(CRAFTIE_QUOTE.role)}
            </PreviewSlotTarget>
          </div>
        </footer>
      </blockquote>
    </PreviewSlotTarget>
  );
}
