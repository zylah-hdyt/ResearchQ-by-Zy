import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Category, Language } from '../data/types';
import { en, type MessageKey } from './en';
import { id } from './id';

export const dictionaries: Record<Language, Record<MessageKey, string>> = { en, id };

export type TFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function translator(lang: Language): TFn {
  const dict = dictionaries[lang] ?? en;
  return (key, vars) => {
    let s: string = dict[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
}

export function categoryLabel(c: Category | undefined, t: TFn): string {
  if (!c) return '—';
  if (c.key) return t(`category.${c.key}` as MessageKey);
  return c.name ?? '—';
}

/** Indonesian is the default for everyone; people switch to English themselves. */
export function detectLanguage(): Language {
  return 'id';
}

interface I18nValue {
  lang: Language;
  t: TFn;
}

const Ctx = createContext<I18nValue>({ lang: 'en', t: translator('en') });

export function I18nProvider({ lang, children }: { lang: Language; children: ReactNode }) {
  const value = useMemo(() => ({ lang, t: translator(lang) }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
