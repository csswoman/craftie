import Link from 'next/link';
import type { ReactNode } from 'react';

import { TOOLS } from '@/lib/tools/catalog';

type ToolShellProps = {
  title: string;
  lead: string;
  children: ReactNode;
  about: ReactNode;
  currentPath: string;
};

/** Page frame shared by the standalone tools: header, tool area, explanation and links. */
export function ToolShell({ title, lead, children, about, currentPath }: ToolShellProps) {
  const others = TOOLS.filter((tool) => tool.path !== currentPath);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Craftie
          </Link>
          <nav aria-label="Herramientas" className="flex items-center gap-1 text-sm font-semibold text-muted">
            <Link href="/docs" className="rounded-lg px-3 py-2 hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
              Docs
            </Link>
            <Link href="/" className="rounded-lg px-3 py-2 hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
              Abrir el estudio
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-display text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>

        <div className="mt-10">{children}</div>

        <section aria-labelledby="tool-about" className="mt-16 max-w-3xl border-t border-border pt-10">
          <h2 id="tool-about" className="font-display text-2xl font-medium">Cómo funciona</h2>
          <div className="mt-4 space-y-4 text-base leading-7 text-ink">{about}</div>
        </section>

        <section aria-labelledby="tool-more" className="mt-16 border-t border-border pt-10">
          <h2 id="tool-more" className="font-display text-2xl font-medium">Más con Craftie</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((tool) => (
              <li key={tool.path}>
                <Link
                  href={tool.path}
                  className="block rounded-xl border border-border p-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  <span className="block font-semibold">{tool.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{tool.description}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                className="block rounded-xl border border-border p-4 transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                <span className="block font-semibold">El estudio completo</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  Roles semánticos, maquetas, tipografía y exportación a CSS, Tailwind y shadcn/ui.
                </span>
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
