'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { BookOpen, FolderOpen, Menu, X } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { HELP_ITEMS, HintIcon } from '@/components/layout/workspaceHelp';

export function WorkspaceMobileMenu({ onOpenMyProjects }: { onOpenMyProjects: () => void }) {
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
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenMyProjects();
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-chrome-body font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <FolderOpen className="size-4.5 text-muted" aria-hidden="true" strokeWidth={1.8} />
            Mis proyectos
          </button>
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
