import type { MetadataRoute } from 'next';

import { DOCS_PAGES, docsPath } from '@/lib/docs/content';
import { SITE_URL } from '@/lib/site';
import { TOOLS } from '@/lib/tools/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', ...TOOLS.map((tool) => tool.path), ...DOCS_PAGES.map((page) => docsPath(page.slug))];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
