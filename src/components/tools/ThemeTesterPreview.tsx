'use client';

import type { CSSProperties } from 'react';

import { useT } from '@/context/I18nContext';

const RADIUS = 'rounded-[var(--radius,0.625rem)]';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]';

/**
 * A small product page painted only with the theme's shadcn/ui variables, so
 * what you see is exactly what the stylesheet gives a real app.
 */
export function ThemeTesterPreview({ properties }: { properties: Record<`--${string}`, string> }) {
  const t = useT();

  return (
    <div
      style={properties as CSSProperties}
      className={`overflow-hidden border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] ${RADIUS}`}
    >
      <nav className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="font-semibold">{t('ui.ThemeTester.demo-marca')}</span>
        <span className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span>{t('ui.ThemeTester.demo-nav-producto')}</span>
          <span className="font-medium text-[var(--foreground)]">{t('ui.ThemeTester.demo-nav-precios')}</span>
        </span>
      </nav>

      <div className="grid gap-6 p-5 md:grid-cols-[1.2fr_1fr]">
        <section>
          <span className={`inline-block bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-foreground)] ${RADIUS}`}>
            {t('ui.ThemeTester.demo-insignia')}
          </span>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--foreground)]">{t('ui.ThemeTester.demo-titulo')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{t('ui.ThemeTester.demo-texto')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={`min-h-10 bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] ${RADIUS} ${FOCUS}`}>
              {t('ui.ThemeTester.demo-boton-principal')}
            </button>
            <button type="button" className={`min-h-10 bg-[var(--secondary)] px-4 text-sm font-semibold text-[var(--secondary-foreground)] ${RADIUS} ${FOCUS}`}>
              {t('ui.ThemeTester.demo-boton-secundario')}
            </button>
          </div>
          <p role="note" className={`mt-4 border border-[var(--destructive)] px-3 py-2 text-sm font-medium text-[var(--destructive)] ${RADIUS}`}>
            {t('ui.ThemeTester.demo-error')}
          </p>
        </section>

        <section className={`border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--card-foreground)] ${RADIUS}`}>
          <h4 className="font-semibold text-[var(--card-foreground)]">{t('ui.ThemeTester.demo-tarjeta-titulo')}</h4>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('ui.ThemeTester.demo-tarjeta-texto')}</p>
          <label className="mt-3 block text-sm font-medium" htmlFor="theme-tester-demo-email">
            {t('ui.ThemeTester.demo-campo')}
          </label>
          <input
            id="theme-tester-demo-email"
            type="email"
            placeholder="ana@ejemplo.com"
            className={`mt-1 min-h-10 w-full border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] ${RADIUS} ${FOCUS}`}
          />
          <div className={`mt-3 bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)] ${RADIUS}`}>
            {t('ui.ThemeTester.demo-nota')}
          </div>
          <div className={`mt-3 border border-[var(--border)] bg-[var(--popover)] p-2 text-sm text-[var(--popover-foreground)] shadow-sm ${RADIUS}`}>
            {t('ui.ThemeTester.demo-menu')}
          </div>
        </section>
      </div>
    </div>
  );
}
