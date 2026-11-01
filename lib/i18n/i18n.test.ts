import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, detectLocale, isLocale } from './locales';
import { en } from './messages.en';
import { es } from './messages.es';
import { translate } from './translate';

describe('locales', () => {
  it('detects the first supported language and defaults to Spanish', () => {
    expect(detectLocale(['en-US', 'es'])).toBe('en');
    expect(detectLocale(['fr-FR', 'es-MX'])).toBe('es');
    expect(detectLocale(['fr-FR'])).toBe(DEFAULT_LOCALE);
    expect(detectLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it('validates locale values', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('messages', () => {
  it('keeps every locale in sync with Spanish', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it('keeps the same placeholders in every translation', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(es) as Array<keyof typeof es>) {
      expect(placeholders(en[key]), key).toEqual(placeholders(es[key]));
    }
  });

  it('has no empty translations', () => {
    for (const value of Object.values(en)) expect(value.trim()).not.toBe('');
  });
});

describe('translate', () => {
  it('interpolates parameters', () => {
    expect(translate('en', 'export.missing', { what: 'text' })).toBe('Missing: text');
    expect(translate('es', 'export.missing', { what: 'fondo' })).toBe('Falta: fondo');
  });
});

import { enText } from './text.en';
import { enTextExtra } from './text.en.extra';
import { translateText } from './translate';

describe('translateText', () => {
  it('returns the Spanish source for the default locale', () => {
    expect(translateText('es', 'Fondo')).toBe('Fondo');
  });

  it('translates known data strings and leaves unknown ones alone', () => {
    expect(translateText('en', 'Fondo')).toBe('Background');
    expect(translateText('en', 'Craftie Studio')).toBe('Craftie Studio');
    expect(translateText('en', 'Algo que no existe')).toBe('Algo que no existe');
  });

  it('applies patterns for strings with numbers', () => {
    expect(translateText('en', 'Acento 3')).toBe('Accent 3');
    expect(translateText('en', 'Familia Inter')).toBe('Inter family');
    expect(translateText('en', '20 estilos disponibles · toca cualquiera para cargar')).toBe(
      '20 styles available · tap any to load',
    );
  });

  it('passes through null and undefined', () => {
    expect(translateText('en', null)).toBeNull();
    expect(translateText('en', undefined)).toBeUndefined();
  });

  it('has no empty English text', () => {
    for (const value of [...Object.values(enText), ...Object.values(enTextExtra)]) {
      expect(value.trim()).not.toBe('');
    }
  });
});
