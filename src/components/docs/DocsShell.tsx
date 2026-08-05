import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Check, Menu } from 'lucide-react';
import type { ReactNode } from 'react';

import { DocsInteractiveDemo } from '@/components/docs/DocsInteractiveDemo';
import { DocsStudioWalkthrough } from '@/components/docs/DocsStudioWalkthrough';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { docsPath, type DocsPage, DOCS_GROUPS, DOCS_PAGES } from '@/lib/docs/content';

type DocsShellProps = { page: DocsPage };

export function DocsShell({ page }: DocsShellProps) {
  const index = DOCS_PAGES.findIndex((entry) => entry.slug === page.slug);
  const previous = index > 0 ? DOCS_PAGES[index - 1] : null;
  const next = index < DOCS_PAGES.length - 1 ? DOCS_PAGES[index + 1] : null;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-sticky border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white"><BookOpen className="size-4" aria-hidden="true" /></span>
            <span className="font-display text-lg font-semibold">Craftie</span>
            <span className="hidden border-l border-border pl-2.5 text-sm font-semibold text-muted sm:inline">Docs</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <ThemeToggle />
            <Link href="/" className="rounded-lg px-3 py-2 font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">Volver al estudio</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-border px-4 py-4 sm:px-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
          <details className="group lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2"><Menu className="size-4 text-muted" aria-hidden="true" /> En esta documentación</span>
              <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="pt-4"> <DocsNavigation currentSlug={page.slug} /> </div>
          </details>
          <div className="hidden lg:block"><DocsNavigation currentSlug={page.slug} /></div>
        </aside>

        <main className="min-w-0 px-4 py-8 sm:px-8 sm:py-12 lg:px-16 lg:py-16">
          <article className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
              <Link href="/docs" className="hover:text-ink">Docs</Link>
            </div>
            <header className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl font-medium leading-tight tracking-[-0.02em] text-ink sm:text-5xl">{page.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{page.description}</p>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink">{page.lead}</p>
            </header>

            {page.kind === 'home' ? <div className="mt-10"><DocsStudioWalkthrough /></div> : null}
            {page.kind === 'semantic-roles' ? (
              <div className="mt-10"><DocsInteractiveDemo /></div>
            ) : null}

            {page.kind === 'home' ? (
              <div className="mt-10 grid gap-4 border-y border-border py-6 md:grid-cols-3">
                <InfoBlock
                  title="Qué obtienes"
                  items={page.generated}
                  icon={<Check className="size-4" aria-hidden="true" />}
                />
                <InfoBlock title="Cómo empezar" items={page.usage} />
                <InfoBlock title="Limitaciones" items={page.limitations} muted />
              </div>
            ) : null}

            <div className="mt-10 space-y-10">
              {page.sections.map((section) => <DocsSectionBlock key={section.heading} section={section} />)}
            </div>

            <nav className="mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-2" aria-label="Navegación entre páginas">
              {previous ? <PageDirection href={docsPath(previous.slug)} label="Anterior" page={previous} direction="previous" /> : <span />}
              {next ? <PageDirection href={docsPath(next.slug)} label="Siguiente" page={next} direction="next" /> : null}
            </nav>
          </article>
        </main>
      </div>
    </div>
  );
}

function DocsNavigation({ currentSlug }: { currentSlug: string }) {
  const group = DOCS_GROUPS[0];

  return (
    <nav aria-label="Documentación de Craftie">
      {group ? (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-muted">{group.title}</h2>
          <ul className="space-y-0.5">
            {group.pages.map((entry) => {
              const active = entry.slug === currentSlug;
              return (
                <li key={entry.slug}>
                  <Link
                    href={docsPath(entry.slug)}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md px-2.5 py-2 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                      active ? 'bg-surface-raised font-bold text-ink' : 'text-muted hover:bg-surface hover:text-ink'
                    }`}
                  >
                    {entry.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </nav>
  );
}

function InfoBlock({ title, items, icon, muted = false }: { title: string; items: string[]; icon?: ReactNode; muted?: boolean }) {
  return (
    <section className={muted ? 'md:border-l md:border-border md:pl-4' : ''}>
      <h2 className="flex items-center gap-2 text-sm font-bold text-ink">{icon ? <span className="text-pass">{icon}</span> : null}{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function DocsSectionBlock({ section }: { section: DocsPage['sections'][number] }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-ink">{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 max-w-3xl text-base leading-7 text-muted">{paragraph}</p>)}
      {section.bullets ? <ul className="mt-4 space-y-3 text-base leading-7 text-muted">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> <span>{bullet}</span></li>)}</ul> : null}
      {section.code ? <pre className="mt-5 overflow-x-auto rounded-lg bg-[#19211d] p-4 text-sm leading-6 text-[#edf5ef]"><code>{section.code}</code></pre> : null}
    </section>
  );
}

function PageDirection({ href, label, page, direction }: { href: string; label: string; page: DocsPage; direction: 'previous' | 'next' }) {
  return <Link href={href} className={`group rounded-lg border border-border p-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${direction === 'next' ? 'text-right' : ''}`}><span className={`flex items-center gap-2 text-xs font-bold text-muted ${direction === 'next' ? 'justify-end' : ''}`}>{direction === 'previous' ? <ArrowLeft className="size-3.5" aria-hidden="true" /> : null}{label}{direction === 'next' ? <ArrowRight className="size-3.5" aria-hidden="true" /> : null}</span><span className="mt-2 block text-sm font-bold text-ink group-hover:text-primary">{page.title}</span></Link>;
}
