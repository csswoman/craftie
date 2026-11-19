'use client';

import { useEffect, useId, useMemo, useState } from 'react';

import { auditShadcnTheme } from '@lib/export/shadcnThemeAudit';
import {
  MAX_THEME_CSS_LENGTH,
  parseThemeCssVariables,
  type ThemeMode,
} from '@lib/export/themeCssVariables';
import {
  missingPreviewVariables,
  SAMPLE_SHADCN_THEME,
  themePreviewProperties,
} from '@lib/export/themePreviewStyle';
import { takeThemeTesterHandoff } from '@/lib/browser/themeTesterHandoff';
import { useT } from '@/context/I18nContext';

import { ThemeTesterAudit } from './ThemeTesterAudit';
import { ThemeTesterPreview } from './ThemeTesterPreview';

type Source = 'sample' | 'studio' | 'pasted';

const MODES: ThemeMode[] = ['light', 'dark'];

/** Paste a shadcn/ui theme, see it on a real page and audit its contrast per mode. */
export function ThemeTester() {
  const t = useT();
  const inputId = useId();
  const [css, setCss] = useState(SAMPLE_SHADCN_THEME);
  const [source, setSource] = useState<Source>('sample');
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const handed = takeThemeTesterHandoff();
    if (handed) {
      // Reading localStorage must wait for the client; one update after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCss(handed);
      setSource('studio');
    }
  }, []);

  const vars = useMemo(() => parseThemeCssVariables(css), [css]);
  const audit = useMemo(() => auditShadcnTheme(vars), [vars]);
  const activeMode = audit.modes.includes(mode) ? mode : 'light';
  const properties = useMemo(() => themePreviewProperties(vars, activeMode), [vars, activeMode]);
  const missing = useMemo(() => missingPreviewVariables(vars, activeMode), [vars, activeMode]);
  const failures = audit.results.filter((result) => result.mode === activeMode && !result.passes).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div>
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {t('ui.ThemeTester.campo-css')}
        </label>
        <p className="mt-1 text-sm text-muted">
          {source === 'studio' ? t('ui.ThemeTester.origen-estudio') : t('ui.ThemeTester.origen-pegar')}
        </p>
        <textarea
          id={inputId}
          value={css}
          maxLength={MAX_THEME_CSS_LENGTH}
          spellCheck={false}
          onChange={(event) => {
            setCss(event.target.value);
            setSource('pasted');
          }}
          className="mt-3 h-[28rem] w-full resize-y rounded-lg border border-border bg-surface p-3 font-mono text-xs leading-relaxed text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <button
          type="button"
          onClick={() => {
            setCss(SAMPLE_SHADCN_THEME);
            setSource('sample');
          }}
          className="mt-2 min-h-10 rounded-md border border-border px-3 text-sm font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          {t('ui.ThemeTester.usar-ejemplo')}
        </button>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label={t('ui.ThemeTester.modo')} className="inline-flex rounded-lg border border-border p-0.5">
            {MODES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={activeMode === option}
                disabled={!audit.modes.includes(option)}
                onClick={() => setMode(option)}
                className="min-h-9 rounded-md px-3 text-sm font-semibold text-muted aria-pressed:bg-surface-raised aria-pressed:text-ink disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                {option === 'light' ? t('ui.ThemeTester.modo-claro') : t('ui.ThemeTester.modo-oscuro')}
              </button>
            ))}
          </div>
          <p role="status" className={`text-sm font-semibold ${failures > 0 ? 'text-fail' : 'text-pass'}`}>
            {failures === 0
              ? t('ui.ThemeTester.resumen-ok')
              : failures === 1
                ? t('ui.ThemeTester.resumen-un-fallo')
                : t('ui.ThemeTester.resumen-fallos', { count: failures })}
          </p>
        </div>

        <ThemeTesterPreview properties={properties} />
        {missing.length > 0 ? (
          <p className="text-sm text-muted">
            {t('ui.ThemeTester.variables-faltantes', { names: missing.map((name) => `--${name}`).join(', ') })}
          </p>
        ) : null}

        <section aria-labelledby="theme-tester-audit">
          <h2 id="theme-tester-audit" className="font-display text-xl font-medium text-ink">
            {t('ui.ThemeTester.auditoria-titulo')}
          </h2>
          <div className="mt-3">
            <ThemeTesterAudit audit={audit} mode={activeMode} />
          </div>
        </section>
      </div>
    </div>
  );
}
