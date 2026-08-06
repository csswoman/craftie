'use client';

import { Accessibility, BookOpen, Download, Image, Menu, Palette, Type, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { ExportMenu } from '@/components/layout/ExportMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export type WorkspaceHeaderProps = {
  canExport: boolean;
  onCraftieHome: () => void;
  onExportCss: () => void;
  onExportTokensJson: () => void;
  onExportFigmaTokens: () => void;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
};

const HELP_ITEMS = [
  { icon: Image, label: 'Inspiración', description: 'Estilos curados o colores extraídos de una imagen.' },
  { icon: Palette, label: 'Colores', description: 'Roles semánticos, temas y ajustes en OKLCH.' },
  { icon: Accessibility, label: 'Accesibilidad', description: 'Contraste WCAG y lectura complementaria APCA.' },
  { icon: Type, label: 'Tipografía', description: 'Parejas curadas, Google Fonts y fuentes locales.' },
  { icon: Download, label: 'Exportación', description: 'CSS, design tokens (JSON), Figma, DESIGN.md y brand kit.' },
] as const;

export function WorkspaceHeader({
  canExport,
  onCraftieHome,
  onExportCss,
  onExportTokensJson,
  onExportFigmaTokens,
  onExportDesignMd,
  onExportBrandKit,
}: WorkspaceHeaderProps) {
  return (
    <header className="relative z-sticky shrink-0 px-2 pt-2 xl:px-4 xl:pt-4">
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 xl:px-4">
        <button
          type="button"
          onClick={onCraftieHome}
          aria-label="Volver al inicio"
          className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <h1 className="font-display text-(--chrome-text-display) font-medium leading-none">
            Craftie
          </h1>
        </button>

        <div className="flex min-w-0 items-center justify-end gap-1">
          <nav aria-label="Acciones del espacio de trabajo" className="hidden min-w-0 items-center justify-end gap-1 sm:flex">
          <ThemeToggle />
          <Link
            href="/docs"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
          >
            <BookOpen className="size-4" aria-hidden="true" strokeWidth={1.8} />
            <span>Docs</span>
          </Link>
          <div className="group relative">
            <button
              type="button"
              title="Ver guía rápida"
              aria-label="Ver guía rápida de Craftie"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
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
          {canExport ? (
            <>
              <div className="ml-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
              <div className="ml-1">
                <ExportMenu
                  canExport={canExport}
                  onExportCss={onExportCss}
                  onExportTokensJson={onExportTokensJson}
                  onExportFigmaTokens={onExportFigmaTokens}
                  onExportDesignMd={onExportDesignMd}
                  onExportBrandKit={onExportBrandKit}
                />
              </div>
            </>
          ) : null}
          </nav>
          {canExport ? (
            <div className="sm:hidden">
              <ExportMenu
                canExport={canExport}
                onExportCss={onExportCss}
                onExportTokensJson={onExportTokensJson}
                onExportFigmaTokens={onExportFigmaTokens}
                onExportDesignMd={onExportDesignMd}
                onExportBrandKit={onExportBrandKit}
              />
            </div>
          ) : null}
          <WorkspaceMobileMenu />
        </div>
      </div>
    </header>
  );
}

function WorkspaceMobileMenu() {
  const [open, setOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', closeOnOutsideInteraction);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideInteraction);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="workspace-mobile-menu"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => {
          setOpen((value) => !value);
          setShowHelp(false);
        }}
        className="inline-grid min-h-11 min-w-11 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      {open ? (
        <div
          id="workspace-mobile-menu"
          className="absolute right-0 top-full z-dropdown mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-bg p-2"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <Link
            href="/docs"
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-chrome-body font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <BookOpen className="size-4.5 text-muted" aria-hidden="true" strokeWidth={1.8} />
            Documentación
          </Link>
          <ThemeToggle variant="menu" />
          <div className="border-t border-border pt-1">
            <button
              type="button"
              aria-expanded={showHelp}
              aria-controls="workspace-mobile-help"
              onClick={() => setShowHelp((value) => !value)}
              className="flex min-h-12 w-full items-center justify-between rounded-lg px-3 text-left text-chrome-body font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              <span className="flex items-center gap-3">
                <HintIcon className="size-4.5" />
                Guía rápida
              </span>
              <span className="text-muted" aria-hidden="true">{showHelp ? '−' : '+'}</span>
            </button>
            {showHelp ? (
              <div id="workspace-mobile-help" className="px-3 pb-2 pt-1">
                <p className="text-chrome-label leading-relaxed text-muted">
                  Todo lo que puedes hacer en Craftie.
                </p>
                <ul className="mt-2 space-y-1.5" aria-label="Funcionalidades del proyecto">
                  {HELP_ITEMS.map(({ icon: Icon, label, description }) => (
                    <li key={label} className="flex items-start gap-2 py-1">
                      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={1.8} />
                      <span className="text-chrome-label leading-snug text-muted">
                        <span className="font-semibold text-ink">{label}:</span> {description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HintIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none">
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
