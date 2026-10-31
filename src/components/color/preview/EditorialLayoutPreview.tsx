'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { EditorialArticleBody } from './EditorialArticleBody';
import { EditorialEditionBand } from './EditorialEditionBand';
import { EditorialLeadStory } from './EditorialLeadStory';
import { EditorialMasthead } from './EditorialMasthead';
import { EditorialNewsletterBand } from './EditorialNewsletterBand';
import {
  EDITORIAL_CONTAINER_CLASS,
  EDITORIAL_FOOTER_LINKS,
  EDITORIAL_GUTTER_CLASS,
  EDITORIAL_MASTHEAD,
} from './editorialPreviewData';
import { PreviewSiteFooter } from './PreviewSiteFooter';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts, previewRootTypeStyle } from './previewTypography';

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

/**
 * Magazine page: masthead, cover story, the issue band on a secondary wash, the
 * article with its most-read rail, and a primary-color newsletter band.
 * Neutral paper carries the reading; each palette color gets one clear job.
 */
export function EditorialLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const shared = { colors, fonts, onEditSlot };

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${EDITORIAL_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{ backgroundColor: colors.appBackground, color: colors.text, ...previewRootTypeStyle() }}
    >
      <EditorialMasthead {...shared} />
      <EditorialLeadStory {...shared} />
      <EditorialEditionBand {...shared} />
      <EditorialArticleBody {...shared} />
      <EditorialNewsletterBand {...shared} />
      <PreviewSiteFooter
        {...shared}
        brand={EDITORIAL_MASTHEAD.name}
        legal="© 2026 Revista Taller"
        links={EDITORIAL_FOOTER_LINKS}
        gutterClass={EDITORIAL_GUTTER_CLASS}
      />
    </PreviewSlotTarget>
  );
}
