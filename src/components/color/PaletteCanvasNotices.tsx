import { AlertTriangle, ArrowRight, Wand2 } from 'lucide-react';

import type { RoleContrastFix } from '@lib/color/roleContrastFixes';
import { ROLE_LABELS } from '@lib/color/roleTypes';
import type { ThemeId } from '@lib/color/themePalette';
import { useT, useTx } from '@/context/I18nContext';

export type ThemeContrastReport = {
  theme: ThemeId;
  failure: boolean;
  warnings: string[];
  fixes: RoleContrastFix[];
};

const THEME_LABEL: Record<ThemeId, string> = {
  light: 'Tema claro',
  dark: 'Tema oscuro',
};

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded border border-border"
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}

function FixRow({ fix, onApply }: { fix: RoleContrastFix; onApply?: () => void }) {
  const tx = useTx();
  const t = useT();

  return (
    <li className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 text-[0.75rem] text-ink">
        <span className="truncate font-medium">{tx(ROLE_LABELS[fix.role])}</span>
        <Swatch hex={fix.fromHex} />
        <ArrowRight size={12} className="shrink-0 text-muted" aria-hidden="true" />
        <Swatch hex={fix.toHex} />
        <span className="font-mono text-[0.6875rem] text-muted">{fix.toHex}</span>
      </span>
      {onApply ? (
        <button
          type="button"
          onClick={onApply}
          className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2.5 text-[0.75rem] font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <Wand2 size={12} aria-hidden="true" />
          {t('ui.PaletteCanvasNotices.corregir-tono')}
        </button>
      ) : null}
    </li>
  );
}

export function PaletteCanvasNotices({
  activeTheme,
  reports,
  onApplyFix,
}: {
  activeTheme: ThemeId;
  reports: ThemeContrastReport[];
  onApplyFix?: (theme: ThemeId, fix: RoleContrastFix) => void;
}) {
  const tx = useTx();
  const t = useT();
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
            <p className="text-[0.8125rem] font-semibold text-ink">{tx(title)}</p>
            <p className="mt-0.5 text-[0.75rem] leading-snug text-muted">{t('ui.PaletteCanvasNotices.toca-el-rol-marcado-para')}</p>
          </div>
        </div>

        {failing.map((report) => (
          <section key={report.theme} className="mt-2.5 border-t border-border pt-2.5">
            <h3 className="text-[0.75rem] font-semibold text-ink">
              {tx(THEME_LABEL[report.theme])}
              {report.theme === activeTheme ? t('ui.PaletteCanvasNotices.en-edicion') : ''}
            </h3>
            <ul className="mt-1.5 space-y-1">
              {report.warnings.map((warning) => (
                <li
                  key={warning}
                  className="flex gap-1.5 text-[0.75rem] font-medium leading-snug text-ink"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fail" aria-hidden="true" />
                  <span>{tx(warning)}</span>
                </li>
              ))}
            </ul>
            {report.fixes.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {report.fixes.map((fix) => (
                  <FixRow
                    key={fix.role}
                    fix={fix}
                    onApply={onApplyFix ? () => onApplyFix(report.theme, fix) : undefined}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.75rem] leading-snug text-muted">
                {t('ui.PaletteCanvasNotices.sin-correccion')}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
