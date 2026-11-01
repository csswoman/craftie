import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { EditorialCoverArt } from './EditorialCoverArt';
import { EDITORIAL_ARTICLE, EDITORIAL_GUTTER_CLASS } from './editorialPreviewData';
import { previewStaggerDelay } from './dashboardPreviewData';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { Avatar, Tag } from './previewPrimitives';
import { bodyStyle, captionStyle, heroStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useTx } from '@/context/I18nContext';

/** Cover story: a large painted cover beside the headline, dek, section tag and byline. */
export function EditorialLeadStory({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  return (
    <section
      className={`preview-rise grid items-center gap-8 py-10 ${EDITORIAL_GUTTER_CLASS} @min-[760px]/editorial:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] @min-[760px]/editorial:gap-10 @min-[760px]/editorial:py-12`}
      style={{ animationDelay: previewStaggerDelay(1) }}
    >
      <EditorialCoverArt colors={colors} onEditSlot={onEditSlot} className="aspect-[4/3] w-full rounded-xl" />

      <div className="min-w-0">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[18ch]" style={heroStyle(fonts)}>
          {tx(EDITORIAL_ARTICLE.title)}
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-4 max-w-[46ch] text-pretty" style={bodyStyle(fonts, colors.mutedText)}>
          {tx(EDITORIAL_ARTICLE.dek)}
        </PreviewSlotTarget>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <Avatar initials="MI" color={colors.brand1} slot="brand1" surfaceHex={colors.appBackground} onEditSlot={onEditSlot} size={36} />
            <div className="min-w-0">
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
                {tx(EDITORIAL_ARTICLE.byline)}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
                {tx(EDITORIAL_ARTICLE.meta)}
              </PreviewSlotTarget>
            </div>
          </div>
          <Tag label={tx(EDITORIAL_ARTICLE.category)} color={colors.accent} slot="accent" surfaceHex={colors.appBackground} onEditSlot={onEditSlot} />
        </div>
      </div>
    </section>
  );
}
