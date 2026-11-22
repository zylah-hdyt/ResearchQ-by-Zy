import type { CurrencyCode, Language } from '../data/types';

const LOCALES: Record<Language, string> = { id: 'id-ID', en: 'en-US' };
export const localeOf = (lang: Language) => LOCALES[lang];

export function formatMoney(minor: number, currency: CurrencyCode, lang: Language, opts?: { compact?: boolean; sign?: boolean }) {
  const major = minor / 100;
  const digits = currency === 'IDR' || currency === 'JPY' ? 0 : 2;
  const fmt = new Intl.NumberFormat(localeOf(lang), {
    style: 'currency',
    currency,
    minimumFractionDigits: opts?.compact ? 0 : digits,
    maximumFractionDigits: opts?.compact ? 1 : digits,
    notation: opts?.compact ? 'compact' : 'standard',
    signDisplay: opts?.sign ? 'exceptZero' : 'auto',
  });
  return fmt.format(major);
}

export function formatDate(iso: string, lang: Language, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = parseLocal(iso);
  return new Intl.DateTimeFormat(localeOf(lang), opts).format(d);
}

export function formatTime(iso: string, lang: Language) {
  return new Intl.DateTimeFormat(localeOf(lang), { hour: '2-digit', minute: '2-digit' }).format(parseLocal(iso));
}

export function formatPercent(v: number, lang: Language) {
  return new Intl.NumberFormat(localeOf(lang), { style: 'percent', maximumFractionDigits: 0 }).format(v);
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as a local-time Date. */
export function parseLocal(iso: string): Date {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0);
}

const pad = (n: number) => String(n).padStart(2, '0');
export function toLocalDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function toLocalDateTime(d: Date) {
  return `${toLocalDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function monthKey(iso: string) {
  return iso.slice(0, 7);
}
