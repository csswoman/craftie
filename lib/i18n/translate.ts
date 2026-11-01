import { DEFAULT_LOCALE, type Locale } from './locales';
import { en } from './messages.en';
import { es, type MessageKey } from './messages.es';

export type { MessageKey } from './messages.es';
export type TranslateParams = Record<string, string | number>;
export type Translate = (key: MessageKey, params?: TranslateParams) => string;

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { es, en };

/** Looks a message up, falling back to Spanish, and fills `{name}` placeholders. */
export function translate(locale: Locale, key: MessageKey, params?: TranslateParams): string {
  const template = MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function createTranslator(locale: Locale): Translate {
  return (key, params) => translate(locale, key, params);
}

import { enText } from './text.en';
import { enTextExtra, enTextPatterns } from './text.en.extra';

/** Translates a data string (Spanish source text). Unknown text is returned unchanged. */
export function translateText<T extends string | null | undefined>(
  locale: Locale,
  text: T,
): T extends string ? string : T {
  type R = T extends string ? string : T;
  if (typeof text !== 'string' || locale === DEFAULT_LOCALE) return text as R;
  const exact = enTextExtra[text] ?? enText[text];
  if (exact !== undefined) return exact as R;
  for (const [pattern, replacement] of enTextPatterns) {
    if (pattern.test(text)) return text.replace(pattern, replacement) as R;
  }
  return text as R;
}

export type TranslateText = <T extends string | null | undefined>(text: T) => T extends string ? string : T;
