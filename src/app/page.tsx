import Link from 'next/link';

import { SiteHeader } from '@/components/layout/SiteHeader';

const demoPalette = ['#2F5644', '#6B9E7A', '#C4D9C8', '#E8F0EA', '#1A2E24'];

export default function HomePage() {
  return (
    <>
      <SiteHeader activePath="/" />
      <main className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="max-w-md text-center">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.01em] text-ink">
            Palette &amp; Type Tool
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
            Paletas de color, accesibilidad y tipografía. La interfaz se queda en segundo plano;
            el color es tuyo.
          </p>
        </div>

        <div
          className="flex gap-2 rounded-lg border border-border bg-surface p-3"
          aria-label="Paleta de ejemplo"
        >
          {demoPalette.map((color) => (
            <div
              key={color}
              className="size-12 rounded-md border border-border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <Link
          href="/select-colors"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          Empezar con colores
        </Link>
      </main>
    </>
  );
}
