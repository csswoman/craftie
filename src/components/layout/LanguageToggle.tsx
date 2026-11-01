'use client';

import { Languages } from 'lucide-react';
import { LOCALES, LOCALE_LABELS } from '@lib/i18n/locales';

import { useI18n } from '@/context/I18nContext';

type LanguageToggleProps = {
  variant?: 'icon' | 'menu';
};

/** Switches between the available interface languages. */
export function LanguageToggle({ variant = 'icon' }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();
  const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]!;
  const label = t('lang.switchTo', { language: LOCALE_LABELS[next].name });

  return (
    <button
      type="button"
      lang={next}
      aria-label={label}
      title={label}
      onClick={() => setLocale(next)}
      className={
        variant === 'menu'
          ? 'flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-chrome-body font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25'
          : 'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25'
      }
    >
      <Languages className={variant === 'menu' ? 'size-4.5 text-muted' : 'size-4'} aria-hidden="true" strokeWidth={1.8} />
      <span>{variant === 'menu' ? LOCALE_LABELS[next].name : LOCALE_LABELS[next].short}</span>
    </button>
  );
}
