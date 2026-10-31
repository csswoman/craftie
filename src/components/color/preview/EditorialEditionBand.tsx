import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { EditorialCoverArt } from './EditorialCoverArt';
import { EDITORIAL_GUTTER_CLASS, EDITORIAL_RELATED } from './editorialPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { captionStyle, displayStyle, headingStyle, labelStyle, type PreviewFonts } from './previewTypography';

/**
 * "En esta edición": a full-bleed band on a wash of the secondary color, with
 * three unboxed stories. Each story's section label takes its own palette color.
 */
export function EditorialEditionBand({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const wash = paletteTint(colors.brand2, colors.appBackground, 0.12);
  const ink = readableOn(colors.text, wash);
  const muted = readableOn(colors.mutedText, wash);

  return (
    <PreviewSlotTarget
      slot="brand2"
      onEditSlot={onEditSlot}
      className={`preview-rise py-10 ${EDITORIAL_GUTTER_CLASS}`}
      style={{ backgroundColor: wash, color: ink }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...displayStyle(fonts), color: ink }}>
          En esta edición
        </PreviewSlotTarget>
        <span style={labelStyle(fonts, muted)}>Ver todo</span>
      </div>

      <ul className="mt-6 grid gap-8 @min-[640px]/editorial:grid-cols-3 @min-[640px]/editorial:gap-6">
        {EDITORIAL_RELATED.map((story, index) => {
          const sectionInk = readableOn(colors[story.slot] ?? colors.accent, wash, 4.5);

          return (
            <li key={story.title} className="min-w-0">
              <EditorialCoverArt colors={colors} seed={index + 1} className="aspect-[3/2] w-full rounded-lg" />
              <PreviewSlotTarget slot={story.slot} onEditSlot={onEditSlot} className="mt-4 flex items-center gap-2" style={labelStyle(fonts, sectionInk)}>
                <span className="size-2 rounded-full" style={{ backgroundColor: colors[story.slot] }} aria-hidden="true" />
                {story.section}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1.5 text-balance" style={{ ...headingStyle(fonts), color: ink }}>
                {story.title}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1.5" style={captionStyle(fonts, muted)}>
                {story.meta} de lectura
              </PreviewSlotTarget>
            </li>
          );
        })}
      </ul>
    </PreviewSlotTarget>
  );
}
