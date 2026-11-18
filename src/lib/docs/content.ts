import type { Locale } from '@lib/i18n/locales';

import { DOCS_GROUPS_EN } from './content.en';
import { DOCS_GROUPS_ES } from './content.es';
import type { DocsGroup, DocsPage } from './content.types';

export * from './content.types';

const GROUPS_BY_LOCALE: Record<Locale, DocsGroup[]> = {
  es: DOCS_GROUPS_ES,
  en: DOCS_GROUPS_EN,
};

export const DOCS_GROUPS: DocsGroup[] = DOCS_GROUPS_ES;
export const DOCS_PAGES: DocsPage[] = DOCS_GROUPS.flatMap((group) => group.pages);

export function getDocsGroups(locale: Locale = 'es'): DocsGroup[] {
  return GROUPS_BY_LOCALE[locale] ?? DOCS_GROUPS_ES;
}

export function getDocsPages(locale: Locale = 'es'): DocsPage[] {
  return getDocsGroups(locale).flatMap((group) => group.pages);
}

export function getDocsPage(slug: string, locale: Locale = 'es'): DocsPage | undefined {
  const pages = getDocsPages(locale);
  return pages.find((entry) => entry.slug === slug) ?? DOCS_PAGES.find((entry) => entry.slug === slug);
}

export function docsPath(slug: string) {
  return slug ? `/docs/${slug}` : '/docs';
}
