'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { previewStaggerDelay } from './dashboardPreviewData';
import {
  EDITORIAL_ARTICLE,
  EDITORIAL_CONTAINER_CLASS,
  EDITORIAL_GUTTER_CLASS,
  EDITORIAL_NAV,
  EDITORIAL_RELATED,
  EDITORIAL_TAGS,
} from './editorialPreviewData';
import { buttonPairOn, paletteTint } from './previewButtons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  bodyStyle,
  brandStyle,
  buttonStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  headingStyle,
  heroStyle,
  type PreviewFonts,
  previewRootTypeStyle,
} from './previewTypography';

export const EDITORIAL_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
  'primaryAction',
  'primaryActionText',
  'accent',
  'brand1',
  'brand2',
  'brand3',
] as const;

export function EditorialLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const dataByIndex = [colors.brand1, colors.brand2, colors.brand3];
  const headerButton = buttonPairOn(colors, colors.chrome);
  const quoteWash = paletteTint(colors.accent, colors.appBackground, 0.12);
  const quoteInk = readableOn(colors.text, quoteWash);
  const quoteMark = readableOn(colors.accent, quoteWash, 3);
  const cardWash = paletteTint(colors.brand2, colors.appBackground, 0.14);
  const cardInk = readableOn(colors.text, cardWash);
  const cardMuted = readableOn(colors.mutedText, cardWash);
  const cardButton = buttonPairOn(colors, cardWash);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${EDITORIAL_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className={`preview-rise flex items-center justify-between gap-4 py-4 ${EDITORIAL_GUTTER_CLASS}`}
        style={{ backgroundColor: colors.chrome, animationDelay: previewStaggerDelay(0) }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Revista Taller
        </PreviewSlotTarget>
        <nav className="hidden items-center gap-6 @min-[560px]/editorial:flex" aria-label="Secciones">
          {EDITORIAL_NAV.map((item) => (
            <span key={item} style={captionStyle(fonts, colors.mutedText)}>
              {item}
            </span>
          ))}
        </nav>
        <PreviewSlotTarget
          slot="primaryAction"
          onEditSlot={onEditSlot}
          className="rounded-lg px-4 py-2"
          style={{ ...buttonStyle(fonts), backgroundColor: headerButton.fill, color: headerButton.on }}
        >
          Suscribirse
        </PreviewSlotTarget>
      </PreviewSlotTarget>

      <div
        className={`grid gap-10 py-10 ${EDITORIAL_GUTTER_CLASS} @min-[820px]/editorial:grid-cols-[minmax(0,1fr)_17rem] @min-[820px]/editorial:gap-8 @min-[820px]/editorial:py-14`}
      >
        <article className="preview-rise min-w-0" style={{ animationDelay: previewStaggerDelay(1) }}>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[22ch]" style={heroStyle(fonts)}>
            {EDITORIAL_ARTICLE.title}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-4" style={captionStyle(fonts, colors.mutedText)}>
            {EDITORIAL_ARTICLE.category} · Por {EDITORIAL_ARTICLE.byline} · {EDITORIAL_ARTICLE.meta}
          </PreviewSlotTarget>

          <div className="mt-8 grid h-44 grid-cols-[1.4fr_1fr_0.8fr] items-end gap-2 @min-[560px]/editorial:h-60" aria-hidden="true">
            {dataByIndex.map((hex, index) => (
              <PreviewSlotTarget
                key={index}
                slot={(['brand1', 'brand2', 'brand3'] as const)[index]!}
                onEditSlot={onEditSlot}
                className="rounded-xl shadow-[0_18px_28px_-20px_rgb(0_0_0/0.5)]"
                style={{ backgroundColor: hex, height: `${[100, 78, 56][index]}%` }}
              />
            ))}
          </div>

          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={captionStyle(fonts, colors.mutedText)}>
            Tres tonos del mismo día, tal como salieron del taller.
          </PreviewSlotTarget>

          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-8 max-w-[62ch] text-pretty first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[3.2em] first-letter:leading-[0.85] first-letter:font-[var(--weight-heading)] first-letter:[font-family:var(--font-heading)]" style={{ ...bodyStyle(fonts), fontSize: 'calc(var(--size-body) * 1.1)' }}>
            {EDITORIAL_ARTICLE.lead}
          </PreviewSlotTarget>
          {EDITORIAL_ARTICLE.paragraphs.map((paragraph) => (
            <PreviewSlotTarget key={paragraph} slot="mutedText" onEditSlot={onEditSlot} className="mt-4 max-w-[62ch] text-pretty" style={bodyStyle(fonts, colors.mutedText)}>
              {paragraph}
            </PreviewSlotTarget>
          ))}

          <PreviewSlotTarget
            slot="accent"
            onEditSlot={onEditSlot}
            className="my-10 rounded-2xl px-6 py-7 @min-[560px]/editorial:px-9"
            style={{ backgroundColor: quoteWash, color: quoteInk }}
          >
            <span aria-hidden="true" className="block leading-none" style={{ ...heroStyle(fonts), color: quoteMark }}>
              &ldquo;
            </span>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 max-w-[40ch] text-balance" style={{ ...headingStyle(fonts), color: quoteInk }}>
              {EDITORIAL_ARTICLE.quote}
            </PreviewSlotTarget>
          </PreviewSlotTarget>

          <div className="flex flex-wrap gap-2">
            {EDITORIAL_TAGS.map((tag, index) => {
              const wash = paletteTint(dataByIndex[index]!, colors.appBackground, 0.18);

              return (
                <PreviewSlotTarget
                  key={tag}
                  slot={(['brand1', 'brand2', 'brand3'] as const)[index]!}
                  onEditSlot={onEditSlot}
                  className="rounded-full px-3 py-1"
                  style={{ ...captionStyle(fonts), backgroundColor: wash, color: readableOn(colors.text, wash) }}
                >
                  {tag}
                </PreviewSlotTarget>
              );
            })}
          </div>
        </article>

        <aside className="preview-rise space-y-6" style={{ animationDelay: previewStaggerDelay(2) }} aria-label="Lecturas relacionadas">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Sigue leyendo
          </PreviewSlotTarget>
          <ul className="space-y-4">
            {EDITORIAL_RELATED.map((item, index) => (
              <li key={item.title} className="flex items-center gap-3">
                <PreviewSlotTarget
                  slot={item.slot}
                  onEditSlot={onEditSlot}
                  className="size-11 shrink-0 rounded-[10px]"
                  style={{ backgroundColor: dataByIndex[index] }}
                />
                <span className="min-w-0">
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
                    {item.title}
                  </PreviewSlotTarget>
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
                    {item.meta}
                  </PreviewSlotTarget>
                </span>
              </li>
            ))}
          </ul>
          <PreviewSlotTarget
            slot="brand2"
            onEditSlot={onEditSlot}
            className="rounded-xl p-4"
            style={{ backgroundColor: cardWash }}
          >
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={{ ...brandStyle(fonts), color: cardInk }}>
              Una carta al mes
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={captionStyle(fonts, cardMuted)}>
              Un ensayo y tres enlaces. Sin ruido.
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="mt-3 rounded-lg py-2 text-center"
              style={{ ...buttonStyle(fonts), backgroundColor: cardButton.fill, color: cardButton.on }}
            >
              Quiero recibirla
            </PreviewSlotTarget>
          </PreviewSlotTarget>
        </aside>
      </div>
    </PreviewSlotTarget>
  );
}
