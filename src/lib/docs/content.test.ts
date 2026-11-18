import { describe, expect, it } from 'vitest';

import { docsPath, getDocsGroups, getDocsPage, getDocsPages } from './content';

describe('docs content i18n', () => {
  it('returns both Spanish and English docs groups', () => {
    const esGroups = getDocsGroups('es');
    const enGroups = getDocsGroups('en');

    expect(esGroups.length).toBeGreaterThan(0);
    expect(enGroups.length).toBeGreaterThan(0);
    expect(esGroups[0].title).toBe('Sobre Craftie');
    expect(enGroups[0].title).toBe('About Craftie');
  });

  it('keeps page slugs in sync between Spanish and English', () => {
    const esPages = getDocsPages('es');
    const enPages = getDocsPages('en');

    expect(esPages.length).toBe(enPages.length);

    const esSlugs = esPages.map((p) => p.slug);
    const enSlugs = enPages.map((p) => p.slug);
    expect(enSlugs).toEqual(esSlugs);
  });

  it('provides distinct, translated titles and descriptions for each locale', () => {
    const homeEs = getDocsPage('', 'es');
    const homeEn = getDocsPage('', 'en');

    expect(homeEs).toBeDefined();
    expect(homeEn).toBeDefined();

    expect(homeEs?.title).toBe('Qué es Craftie');
    expect(homeEn?.title).toBe('What is Craftie');

    const exportEs = getDocsPage('export', 'es');
    const exportEn = getDocsPage('export', 'en');

    expect(exportEs?.title).toBe('Exportar');
    expect(exportEn?.title).toBe('Export');
  });

  it('falls back to default locale if unknown slug', () => {
    expect(getDocsPage('non-existent-page', 'en')).toBeUndefined();
  });

  it('formats docsPath correctly', () => {
    expect(docsPath('')).toBe('/docs');
    expect(docsPath('flow')).toBe('/docs/flow');
  });
});
