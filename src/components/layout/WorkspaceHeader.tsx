import Link from 'next/link';
import { Accessibility, Download, Image, Palette, Type } from 'lucide-react';

import { ExportMenu } from '@/components/layout/ExportMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export type WorkspaceHeaderProps = {
  canExport: boolean;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
};

const HELP_ITEMS = [
  { icon: Image, label: 'Inspiración', description: 'Estilos curados o colores extraídos de una imagen.' },
  { icon: Palette, label: 'Colores', description: 'Roles semánticos, temas y ajustes en OKLCH.' },
  { icon: Accessibility, label: 'Accesibilidad', description: 'Contraste WCAG y lectura complementaria APCA.' },
  { icon: Type, label: 'Tipografía', description: 'Parejas curadas, Google Fonts y fuentes locales.' },
  { icon: Download, label: 'Exportación', description: 'Brand kit JSON y guía de diseño en Markdown.' },
] as const;

export function WorkspaceHeader({
  canExport,
  onExportDesignMd,
  onExportBrandKit,
}: WorkspaceHeaderProps) {
  return (
    <header className="relative z-sticky shrink-0 px-4 pt-4 lg:px-7 lg:pt-7">
      <div className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3 lg:px-5">
        <Link
          href="/"
          className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <h1 className="font-display text-[var(--chrome-text-display)] font-medium leading-none">
            Craftie
          </h1>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2">
          <ThemeToggle />
          <div className="group relative">
            <button
              type="button"
              title="Ver guía rápida"
              aria-label="Ver guía rápida de Craftie"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              <HintIcon />
              <span className="hidden sm:inline">Ayuda</span>
            </button>
            <div className="invisible pointer-events-none absolute right-0 top-full z-dropdown w-[min(100vw-2rem,360px)] pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div
                id="workspace-help"
                role="tooltip"
                className="rounded-xl border border-border bg-bg p-3"
                style={{ boxShadow: 'var(--shadow-float)' }}
              >
                <p className="text-chrome-label font-semibold text-ink">Guía rápida</p>
                <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">
                  Todo lo que puedes hacer en Craftie.
                </p>
                <ul className="mt-3 space-y-1.5" aria-label="Funcionalidades del proyecto">
                  {HELP_ITEMS.map(({ icon: Icon, label, description }) => (
                    <li key={label} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-raised">
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={1.8} />
                      <span className="min-w-0 text-chrome-caption leading-snug">
                        <span className="font-semibold text-ink">{label}:</span>{' '}
                        <span className="text-muted">{description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="hidden h-9 w-px bg-border sm:block" aria-hidden="true" />
          <ExportMenu
            canExport={canExport}
            onExportBrandKit={onExportBrandKit}
            onExportDesignMd={onExportDesignMd}
          />
        </div>
      </div>
    </header>
  );
}

function HintIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
      <path
        d="M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.25 6.35A1.9 1.9 0 0 1 8.1 5c1.05 0 1.8.62 1.8 1.5 0 .72-.42 1.13-1.05 1.5-.54.32-.85.58-.85 1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M8 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
