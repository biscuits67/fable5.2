import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStored, writeStored } from '../lib/storage';
import { en, type Dict } from './locales/en';
import { es } from './locales/es';
import { it } from './locales/it';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';

const DICTS = { en, es, it, fr, de, pt } satisfies Record<string, Dict>;
export type Locale = keyof typeof DICTS;

export const LOCALES: readonly { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

const STORAGE_KEY = 'eai.lang';
const isLocale = (value: string | null | undefined): value is Locale => !!value && value in DICTS;

function detectLocale(): Locale {
  const stored = readStored(STORAGE_KEY);
  if (isLocale(stored)) return stored;
  for (const tag of navigator.languages ?? []) {
    const base = tag.slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return 'en';
}

/** Replaces `{name}` placeholders. Unknown placeholders are left visible so mistakes are easy to spot. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const t = DICTS[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.meta.title;
  }, [locale, t]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStored(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
