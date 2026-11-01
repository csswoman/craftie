import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { EDITORIAL_ARTICLE, EDITORIAL_GUTTER_CLASS, EDITORIAL_MOST_READ, EDITORIAL_TAGS } from './editorialPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { bodyStyle, captionStyle, displayStyle, headingStyle, heroStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

const NUMERAL_SLOTS = ['brand1', 'brand2', 'brand3', 'brand1'] as const;
const TAG_SLOTS = ['brand1', 'brand2', 'brand3'] as const;

/**
 * Reading column with a drop cap and pull quote in the accent, beside a
 * "most read" list whose large numerals take the palette colors in turn.
 */
export function EditorialArticleBody({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const lead = tx(EDITORIAL_ARTICLE.lead);
  const t = useT();
  const accentInk = readableOn(colors.accent, colors.appBackground, 3);

  return (
    <div className={`grid gap-12 py-12 ${EDITORIAL_GUTTER_CLASS} @min-[820px]/editorial:grid-cols-[minmax(0,1fr)_15rem]`}>
      <article className="preview-rise min-w-0">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[62ch] text-pretty" style={{ ...bodyStyle(fonts), fontSize: 'calc(var(--size-body) * 1.1)' }}>
          <PreviewSlotTarget
            slot="accent"
            onEditSlot={onEditSlot}
            className="float-left mr-3 mt-1"
            style={{ ...heroStyle(fonts), color: accentInk, fontSize: '4.2em', lineHeight: 0.8 }}
          >
            {tx(lead.charAt(0))}
          </PreviewSlotTarget>
          {tx(lead.slice(1))}
        </PreviewSlotTarget>
        {EDITORIAL_ARTICLE.paragraphs.map((paragraph) => (
          <PreviewSlotTarget key={paragraph} slot="text" onEditSlot={onEditSlot} className="mt-5 max-w-[62ch] text-pretty" style={bodyStyle(fonts)}>
            {tx(paragraph)}
          </PreviewSlotTarget>
        ))}

        <figure className="m-0 my-10 max-w-[62ch]">
          <PreviewSlotTarget slot="accent" onEditSlot={onEditSlot} className="leading-none" style={{ ...heroStyle(fonts), color: accentInk, fontSize: 'calc(var(--role-hero-size, var(--size-h1)) * 1.6)', lineHeight: 0.6 }} aria-hidden="true">{t('ui.EditorialArticleBody.ldquo')}</PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 max-w-[30ch] text-balance" style={displayStyle(fonts)}>
            {tx(EDITORIAL_ARTICLE.quote)}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3" style={captionStyle(fonts, colors.mutedText)}>
            — {tx(EDITORIAL_ARTICLE.byline)}
          </PreviewSlotTarget>
        </figure>

        <div className="flex flex-wrap gap-2">
          {EDITORIAL_TAGS.map((tag, index) => {
            const slot = TAG_SLOTS[index]!;
            const wash = paletteTint(colors[slot], colors.appBackground, 0.18);

            return (
              <PreviewSlotTarget
                key={tag}
                slot={slot}
                onEditSlot={onEditSlot}
                className="rounded-full px-3 py-1"
                style={{ ...captionStyle(fonts), backgroundColor: wash, color: readableOn(colors.text, wash) }}
              >
                {tx(tag)}
              </PreviewSlotTarget>
            );
          })}
        </div>
      </article>

      <aside className="preview-rise min-w-0" aria-label={t('ui.EditorialArticleBody.lo-mas-leido')}>
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="border-b-2 pb-3" style={{ ...headingStyle(fonts), borderColor: colors.text }}>{t('ui.EditorialArticleBody.lo-mas-leido')}</PreviewSlotTarget>
        <ol>
          {EDITORIAL_MOST_READ.map((title, index) => {
            const slot = NUMERAL_SLOTS[index]!;

            return (
              <PreviewSlotTarget
                key={title}
                slot="divider"
                onEditSlot={onEditSlot}
                className="flex items-baseline gap-4 border-b py-4"
                style={{ borderColor: colors.divider }}
              >
                <PreviewSlotTarget
                  slot={slot}
                  onEditSlot={onEditSlot}
                  className="w-7 shrink-0 tabular-nums"
                  style={{ ...heroStyle(fonts), color: readableOn(colors[slot], colors.appBackground, 3), lineHeight: 1 }}
                >
                  {index + 1}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="min-w-0 text-balance" style={titleStyle(fonts)}>
                  {tx(title)}
                </PreviewSlotTarget>
              </PreviewSlotTarget>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
