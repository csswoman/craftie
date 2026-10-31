import { AlertTriangle } from 'lucide-react';

import type { ThemeId } from '@lib/color/themePalette';

export type ThemeContrastReport = {
  theme: ThemeId;
  failure: boolean;
  warnings: string[];
};

const THEME_LABEL: Record<ThemeId, string> = {
  light: 'Tema claro',
  dark: 'Tema oscuro',
};

export function PaletteCanvasNotices({
  activeTheme,
  reports,
  onSwitchTheme,
}: {
  activeTheme: ThemeId;
  reports: ThemeContrastReport[];
  onSwitchTheme?: (theme: ThemeId) => void;
}) {
  const failing = reports.filter((report) => report.failure);

  if (failing.length === 0) {
    return null;
  }

  const title =
    failing.length === reports.length
      ? 'Ambos temas tienen pares bajo AA'
      : `${THEME_LABEL[failing[0].theme]}: hay pares bajo AA`;

  return (
    <div className="absolute left-4 top-4 z-30 grid max-w-sm gap-2">
      <div
        role="alert"
        className="max-h-[60vh] overflow-y-auto rounded-xl border border-fail/40 border-l-4 border-l-fail bg-bg/95 px-3.5 py-3 shadow-[var(--shadow-float)] backdrop-blur"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-fail" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-semibold text-ink">{title}</p>
            <p className="mt-0.5 text-[0.75rem] leading-snug text-muted">
              Toca el rol marcado para ver una variante accesible, o ajusta su luminosidad en OKLCH.
            </p>
          </div>
        </div>

        {failing.map((report) => (
          <section key={report.theme} className="mt-2.5 border-t border-border pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[0.75rem] font-semibold text-ink">
                {THEME_LABEL[report.theme]}
                {report.theme === activeTheme ? ' · en edición' : ''}
              </h3>
              {report.theme !== activeTheme && onSwitchTheme ? (
                <button
                  type="button"
                  onClick={() => onSwitchTheme(report.theme)}
                  className="min-h-8 rounded-md border border-border bg-surface px-2.5 text-[0.75rem] font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  Ir a este tema
                </button>
              ) : null}
            </div>
            <ul className="mt-1.5 space-y-1">
              {report.warnings.map((warning) => (
                <li
                  key={warning}
                  className="flex gap-1.5 text-[0.75rem] font-medium leading-snug text-ink"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fail" aria-hidden="true" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
