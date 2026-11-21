import type { CurrencyCode, ExchangeRate } from '../data/types';

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
