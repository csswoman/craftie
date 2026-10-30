'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { previewStaggerDelay } from './dashboardPreviewData';
import {
  EDITORIAL_ARTICLE,
  EDITORIAL_CONTAINER_CLASS,
  EDITORIAL_GUTTER_CLASS,
  EDITORIAL_NAV,
  EDITORIAL_RELATED,
  EDITORIAL_TAGS,
} from './editorialPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { tint } from './previewPrimitives';
import {
  bodyStyle,
  brandStyle,
  buttonStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  eyebrowStyle,
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
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);
  const dataByIndex = [colors.brand1, colors.brand2, colors.brand3];

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
        className={`preview-rise flex items-center justify-between gap-4 border-b py-4 ${EDITORIAL_GUTTER_CLASS}`}
        style={{ backgroundColor: colors.chrome, borderColor: colors.divider, animationDelay: previewStaggerDelay(0) }}
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
          style={{ ...buttonStyle(fonts), backgroundColor: primaryFill, color: onPrimary }}
        >
          Suscribirse
        </PreviewSlotTarget>
      </PreviewSlotTarget>

      <div
        className={`grid gap-10 py-10 ${EDITORIAL_GUTTER_CLASS} @min-[820px]/editorial:grid-cols-[minmax(0,1fr)_17rem] @min-[820px]/editorial:gap-8 @min-[820px]/editorial:py-14`}
      >
        <article className="preview-rise min-w-0" style={{ animationDelay: previewStaggerDelay(1) }}>
          <PreviewSlotTarget slot="accent" onEditSlot={onEditSlot} className="inline-block" style={eyebrowStyle(fonts, colors.mutedText)}>
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-2 rounded-full align-middle"
              style={{ backgroundColor: colors.accent }}
            />
            {EDITORIAL_ARTICLE.category}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-3 max-w-[22ch]" style={heroStyle(fonts)}>
            {EDITORIAL_ARTICLE.title}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-4" style={captionStyle(fonts, colors.mutedText)}>
            Por {EDITORIAL_ARTICLE.byline} · {EDITORIAL_ARTICLE.meta}
          </PreviewSlotTarget>

          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="preview-surface mt-8 grid h-44 grid-cols-3 gap-2 overflow-hidden rounded-xl border p-2 @min-[560px]/editorial:h-56"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
          >
            {dataByIndex.map((hex, index) => (
              <span key={index} aria-hidden="true" className="rounded-lg" style={{ backgroundColor: tint(hex, 80) }} />
            ))}
          </PreviewSlotTarget>

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
            slot="divider"
            onEditSlot={onEditSlot}
            className="my-10 border-y py-6"
            style={{ borderColor: colors.divider }}
          >
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="max-w-[40ch] text-balance" style={headingStyle(fonts)}>
              “{EDITORIAL_ARTICLE.quote}”
            </PreviewSlotTarget>
          </PreviewSlotTarget>

          <div className="flex flex-wrap gap-2">
            {EDITORIAL_TAGS.map((tag) => (
              <PreviewSlotTarget
                key={tag}
                slot="surface"
                onEditSlot={onEditSlot}
                className="rounded-full border px-3 py-1"
                style={{ ...captionStyle(fonts), backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
              >
                {tag}
              </PreviewSlotTarget>
            ))}
          </div>
        </article>

        <aside className="preview-rise space-y-6 @min-[820px]/editorial:border-l @min-[820px]/editorial:pl-8" style={{ animationDelay: previewStaggerDelay(2), borderColor: colors.divider }} aria-label="Lecturas relacionadas">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={eyebrowStyle(fonts, colors.mutedText)}>
            Sigue leyendo
          </PreviewSlotTarget>
          <ul className="space-y-4">
            {EDITORIAL_RELATED.map((item, index) => (
              <li key={item.title} className="flex gap-3 border-t pt-4" style={{ borderColor: colors.divider }}>
                <span aria-hidden="true" className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: dataByIndex[index] }} />
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
            slot="surface"
            onEditSlot={onEditSlot}
            className="rounded-xl border p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
              Una carta al mes
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={captionStyle(fonts, colors.mutedText)}>
              Un ensayo y tres enlaces. Sin ruido.
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="mt-3 rounded-lg py-2 text-center"
              style={{ ...buttonStyle(fonts), backgroundColor: primaryFill, color: onPrimary }}
            >
              Quiero recibirla
            </PreviewSlotTarget>
          </PreviewSlotTarget>
        </aside>
      </div>
    </PreviewSlotTarget>
  );
}
