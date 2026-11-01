'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_LOCALE, detectLocale, type Locale } from '@lib/i18n/locales';
import { createTranslator, translateText, type Translate, type TranslateText } from '@lib/i18n/translate';

import { readStoredLocale, writeStoredLocale } from '@/lib/browser/localeStorage';

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
  /** Translates a data string whose Spanish text is the key (labels, copy from lib data). */
  tx: TranslateText;
};

const DEFAULT_VALUE: I18nValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: createTranslator(DEFAULT_LOCALE),
  tx: ((text: string | null | undefined) => text) as TranslateText,
};

const I18nContext = createContext<I18nValue>(DEFAULT_VALUE);

/**
 * Holds the interface language. The server and the first client render use the
 * default locale so markup matches; the stored or browser language is applied
 * right after mount.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const next = readStoredLocale() ?? detectLocale(navigator.languages ?? [navigator.language]);
    // The stored language is only known on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: createTranslator(locale),
      tx: ((text: string | null | undefined) => translateText(locale, text)) as TranslateText,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translator and locale. Falls back to Spanish outside the provider. */
export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useT(): Translate {
  return useContext(I18nContext).t;
}

/** Translator for data strings; see {@link I18nValue.tx}. */
export function useTx(): TranslateText {
  return useContext(I18nContext).tx;
}
