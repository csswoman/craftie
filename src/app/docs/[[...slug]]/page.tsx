import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsShell } from '@/components/docs/DocsShell';
import { DOCS_PAGES, getDocsPage } from '@/lib/docs/content';

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS_PAGES.map((page) => ({ slug: page.slug ? page.slug.split('/') : [] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocsPage(slug?.join('/') ?? '');
  return {
    title: page ? `${page.title} · Craftie Docs` : 'Craftie Docs',
    description: page?.description ?? 'Documentación de Craftie.',
  };
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = getDocsPage(slug?.join('/') ?? '');
  if (!page) notFound();
  return <DocsShell page={page} />;
}
