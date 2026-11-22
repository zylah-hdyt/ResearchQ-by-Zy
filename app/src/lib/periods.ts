import type { CurrencyCode, ExchangeRate, Language, Transaction, Wallet } from '../data/types';
import { collapse, summarize, txDate } from './finance';
import { convert } from './money';
import { localeOf, parseLocal, toLocalDate } from './format';

/** Dashboard / report ranges. All dates are local calendar days, "YYYY-MM-DD", inclusive. */
export type ChartRange = '7D' | '1M' | '3M' | '6M' | '1Y';
export const CHART_RANGES: ChartRange[] = ['7D', '1M', '3M', '6M', '1Y'];

export interface DateSpan { from: string; to: string }
export interface Bucket extends DateSpan { key: string; label: string; longLabel: string }
export interface FlowPoint extends Bucket { income: number; expense: number }

export const addDays = (s: string, n: number): string => {
  const d = parseLocal(s);
  d.setDate(d.getDate() + n);
  return toLocalDate(d);
};
/** Whole days from a to b (b − a), DST-safe. */
export const daysBetween = (a: string, b: string) => Math.round((parseLocal(b).getTime() - parseLocal(a).getTime()) / 86_400_000);
export const firstOfMonth = (s: string, monthOffset = 0) => {
  const d = parseLocal(s);
  return toLocalDate(new Date(d.getFullYear(), d.getMonth() + monthOffset, 1));
};
export const lastOfMonth = (s: string) => {
  const d = parseLocal(s);
  return toLocalDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
};

/** 7D = last 7 days incl. today · 1M = last 30 days · 3M/6M/1Y = whole calendar months up to today. */
export function rangeBounds(range: ChartRange, today: string): DateSpan {
  switch (range) {
    case '7D': return { from: addDays(today, -6), to: today };
    case '1M': return { from: addDays(today, -29), to: today };
    case '3M': return { from: firstOfMonth(today, -2), to: today };
    case '6M': return { from: firstOfMonth(today, -5), to: today };
    case '1Y': return { from: firstOfMonth(today, -11), to: today };
  }
}

/** The window of the same length immediately before `span` (used for "vs previous period"). */
export function previousSpan(span: DateSpan): DateSpan {
  const len = daysBetween(span.from, span.to) + 1;
  const to = addDays(span.from, -1);
  return { from: addDays(to, -(len - 1)), to };
}

const fmt = (lang: Language, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(localeOf(lang), o);

function dailyBuckets(span: DateSpan, lang: Language): Bucket[] {
  const out: Bucket[] = [];
  const short = fmt(lang, { weekday: 'short' }), long = fmt(lang, { weekday: 'long', day: 'numeric', month: 'long' });
  for (let d = span.from; d <= span.to; d = addDays(d, 1)) {
    out.push({ key: d, from: d, to: d, label: short.format(parseLocal(d)), longLabel: long.format(parseLocal(d)) });
  }
  return out;
}

function stepBuckets(span: DateSpan, days: number, lang: Language): Bucket[] {
  const out: Bucket[] = [];
  const sh = fmt(lang, { day: 'numeric', month: 'short' }), full = fmt(lang, { day: 'numeric', month: 'short', year: 'numeric' });
  for (let s = span.from; s <= span.to; s = addDays(s, days)) {
    const e = addDays(s, days - 1) > span.to ? span.to : addDays(s, days - 1);
    out.push({ key: s, from: s, to: e, label: sh.format(parseLocal(s)), longLabel: `${sh.format(parseLocal(s))} – ${full.format(parseLocal(e))}` });
  }
  return out;
}

function monthlyBuckets(span: DateSpan, lang: Language): Bucket[] {
  const out: Bucket[] = [];
  const short = fmt(lang, { month: 'short' }), long = fmt(lang, { month: 'long', year: 'numeric' }), day = fmt(lang, { day: 'numeric', month: 'short' });
  for (let s = firstOfMonth(span.from); s <= span.to; s = firstOfMonth(s, 1)) {
    const monthEnd = lastOfMonth(s);
    const from = s < span.from ? span.from : s;
    const to = monthEnd > span.to ? span.to : monthEnd;
    const partial = to < monthEnd;
    out.push({ key: s.slice(0, 7), from, to, label: short.format(parseLocal(s)), longLabel: partial ? `${long.format(parseLocal(s))} (${lang === 'id' ? 's.d.' : 'to'} ${day.format(parseLocal(to))})` : long.format(parseLocal(s)) });
  }
  return out;
}

/** Buckets for a dashboard range: 7D daily · 1M six 5-day steps · 3M/6M/1Y monthly. */
export function buildBuckets(range: ChartRange, today: string, lang: Language): Bucket[] {
  const span = rangeBounds(range, today);
  if (range === '7D') return dailyBuckets(span, lang);
  if (range === '1M') return stepBuckets(span, 5, lang);
  return monthlyBuckets(span, lang);
}

/** Buckets for an arbitrary report range: ≤ 14 days daily · ≤ 70 days weekly · otherwise monthly. */
export function autoBuckets(span: DateSpan, lang: Language): Bucket[] {
  const days = daysBetween(span.from, span.to) + 1;
  if (days <= 14) return dailyBuckets(span, lang);
  if (days <= 70) return stepBuckets(span, 7, lang);
  return monthlyBuckets(span, lang);
}

/**
 * Income and expense per bucket, converted into `target`. Transfers are excluded.
 * Currencies without a rate are skipped and reported (never silently added).
 */
export function flowByBucket(txs: Transaction[], wallets: Wallet[], buckets: Bucket[], target: CurrencyCode, base: CurrencyCode, rates: ExchangeRate[]) {
  const points: FlowPoint[] = buckets.map((b) => ({ ...b, income: 0, expense: 0 }));
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const missing = new Set<CurrencyCode>();
  for (const t of txs) {
    if (t.type === 'transfer') continue;
    const day = txDate(t);
    const p = points.find((x) => day >= x.from && day <= x.to);
    const c = cur.get(t.walletId);
    if (!p || !c) continue;
    const v = convert(t.amount, c, target, base, rates);
    if (v == null) { missing.add(c); continue; }
    if (t.type === 'income') p.income += v; else p.expense += v;
  }
  return { points, missing: [...missing] };
}

export interface PeriodTotals { income: number; expense: number; net: number; savingRate: number | null; missing: CurrencyCode[] }

/** Converted income / expense / net for a span (transfers excluded). savingRate = net ÷ income, null when there is no income. */
export function periodTotals(txs: Transaction[], wallets: Wallet[], span: DateSpan, base: CurrencyCode, rates: ExchangeRate[]): PeriodTotals {
  const s = summarize(txs, wallets, span);
  const inc = collapse(s.income, base, base, rates);
  const exp = collapse(s.expense, base, base, rates);
  const net = inc.value - exp.value;
  return { income: inc.value, expense: exp.value, net, savingRate: inc.value > 0 ? net / inc.value : null, missing: [...new Set([...inc.missing, ...exp.missing])] };
}
