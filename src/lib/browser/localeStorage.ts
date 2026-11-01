import { isLocale, type Locale } from '@lib/i18n/locales';

const LOCALE_KEY = 'craftie:locale';

/** The language the visitor chose explicitly, or `null` to fall back to the browser language. */
export function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(LOCALE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Best-effort only (private mode, quota).
  }
}
