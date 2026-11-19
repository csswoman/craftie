'use client';

import { Check, X } from 'lucide-react';

import type { ShadcnThemeAudit } from '@lib/export/shadcnThemeAudit';
import type { ThemeMode } from '@lib/export/themeCssVariables';
import type { MessageKey } from '@lib/i18n/translate';
import { useT } from '@/context/I18nContext';

const PAIR_LABEL: Record<string, MessageKey> = {
  page: 'ui.ThemeTester.par-page',
  card: 'ui.ThemeTester.par-card',
  popover: 'ui.ThemeTester.par-popover',
  primary: 'ui.ThemeTester.par-primary',
  secondary: 'ui.ThemeTester.par-secondary',
  accent: 'ui.ThemeTester.par-accent',
  'muted-on-page': 'ui.ThemeTester.par-muted-on-page',
  'muted-on-muted': 'ui.ThemeTester.par-muted-on-muted',
  destructive: 'ui.ThemeTester.par-destructive',
  ring: 'ui.ThemeTester.par-ring',
};

/** WCAG results for the stylesheet's own variables in one mode. */
export function ThemeTesterAudit({ audit, mode }: { audit: ShadcnThemeAudit; mode: ThemeMode }) {
  const t = useT();
  const results = audit.results.filter((result) => result.mode === mode);
  const missing = audit.missing.filter((entry) => entry.mode === mode);

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{t('ui.ThemeTester.auditoria-titulo')}</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="py-2 pr-3 font-semibold">{t('ui.ThemeTester.columna-par')}</th>
            <th scope="col" className="py-2 pr-3 font-semibold">{t('ui.ThemeTester.columna-muestra')}</th>
            <th scope="col" className="py-2 pr-3 text-right font-semibold">{t('ui.ThemeTester.columna-ratio')}</th>
            <th scope="col" className="py-2 font-semibold">{t('ui.ThemeTester.columna-resultado')}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-border/60">
              <th scope="row" className="py-2 pr-3 text-left font-medium text-ink">
                {t(PAIR_LABEL[result.id])}
                <span className="block font-mono text-[0.6875rem] font-normal text-muted">
                  --{result.foreground} / --{result.background}
                </span>
              </th>
              <td className="py-2 pr-3">
                <span
                  className="inline-flex min-w-10 justify-center rounded-md border border-border px-2 py-0.5 font-semibold"
                  style={{ color: result.foregroundHex, backgroundColor: result.backgroundHex }}
                  aria-hidden="true"
                >
                  Aa
                </span>
              </td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums text-ink">
                {result.ratio.toFixed(2)}:1
                <span className="block text-[0.6875rem] text-muted">≥ {result.required}:1</span>
              </td>
              <td className="py-2">
                <span className={`inline-flex items-center gap-1 font-semibold ${result.passes ? 'text-pass' : 'text-fail'}`}>
                  {result.passes ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
                  {result.passes ? t('ui.ThemeTester.cumple') : t('ui.ThemeTester.no-cumple')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {missing.length > 0 ? (
        <p className="mt-3 text-sm text-muted">
          {t('ui.ThemeTester.sin-verificar', { pairs: missing.map((entry) => t(PAIR_LABEL[entry.id])).join(', ') })}
        </p>
      ) : null}
    </div>
  );
}
