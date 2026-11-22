import type { CurrencyCode, ExchangeRate, Language } from '../data/types';

/** Convert user-entered major units (e.g. "12500.5") to integer minor units. */
export function toMinor(major: number | string): number {
  const n = typeof major === 'string' ? Number(major.replace(/,/g, '.')) : major;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function toMajor(minor: number): number {
  return minor / 100;
}

/**
 * Convert an amount between currencies using the user's rate table.
 * Rates are relative to the preferred (base) currency. Returns null when a
 * rate is missing so callers never silently mix currencies.
 */
export function convert(
  minor: number,
  from: CurrencyCode,
  to: CurrencyCode,
  base: CurrencyCode,
  rates: ExchangeRate[],
): number | null {
  if (from === to) return minor;
  const rateOf = (c: CurrencyCode): number | null => {
    if (c === base) return 1;
    const r = rates.find((x) => x.code === c);
    return r && r.rate > 0 ? r.rate : null;
  };
  const rf = rateOf(from);
  const rt = rateOf(to);
  if (rf == null || rt == null) return null;
  return Math.round((minor * rf) / rt);
}

/** Sum of amounts grouped by currency. Never mixes currencies. */
export type CurrencyTotals = Partial<Record<CurrencyCode, number>>;

export function addTo(totals: CurrencyTotals, c: CurrencyCode, minor: number) {
  totals[c] = (totals[c] ?? 0) + minor;
}

/** Currencies without minor units in everyday use. */
export const decimalsOf = (c: CurrencyCode) => (c === 'IDR' || c === 'JPY' ? 0 : 2);

/**
 * Parse a number a person typed, tolerating both conventions:
 * "1.250.000,50" (Indonesian) and "1,250,000.50" (English).
 * A lone separator followed by exactly three digits ("12.500") is read in the user's own language convention:
 * Indonesian → thousands, English → decimal (and the reverse for ",").
 */
export function parseNumber(text: string, lang: Language): number {
  let s = text.replace(/[^\d.,-]/g, '');
  const neg = s.startsWith('-');
  s = s.replace(/-/g, '');
  if (!/\d/.test(s)) return 0;
  const langDecimal = lang === 'id' ? ',' : '.';
  let dec: string | null = null;
  const dots = s.split('.').length - 1;
  const commas = s.split(',').length - 1;
  if (dots && commas) dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
  else if (dots || commas) {
    const sep = dots ? '.' : ',';
    const parts = s.split(sep);
    if (parts.length === 2) {
      const frac = parts[1];
      dec = frac.length === 3 ? (sep === langDecimal ? sep : null) : sep;
    }
  }
  const cleaned = s
    .split('')
    .filter((ch) => /\d/.test(ch) || ch === dec)
    .join('')
    .replace(dec ?? '\0', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}

/** Text typed by the user → integer minor units of `currency`. For IDR/JPY every separator is a thousands separator. */
export function parseAmount(text: string, currency: CurrencyCode, lang: Language): number {
  if (decimalsOf(currency) === 0) {
    const digits = text.replace(/\D/g, '');
    return digits ? Number(digits) * 100 : 0;
  }
  return Math.round(parseNumber(text, lang) * 100);
}

/** Minor units → text for an input field (grouped for IDR, plain with the language's decimal mark otherwise). */
export function toInputText(minor: number | undefined, currency: CurrencyCode, lang: Language): string {
  if (minor == null) return '';
  if (decimalsOf(currency) === 0) return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US').format(Math.round(minor / 100));
  const s = String(minor / 100);
  return lang === 'id' ? s.replace('.', ',') : s;
}
