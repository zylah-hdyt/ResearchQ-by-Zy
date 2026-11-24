import type { Transaction } from '../data/types';
import type { DateRange } from './finance';
import { toLocalDate } from './format';

export type RangePreset = 'thisMonth' | 'lastMonth' | 'last3' | 'last6' | 'last12' | 'thisYear' | 'all' | 'custom';
export const PRESETS: RangePreset[] = ['thisMonth', 'lastMonth', 'last3', 'last6', 'last12', 'thisYear', 'all', 'custom'];

export function presetRange(p: RangePreset, txs: Transaction[], now = new Date()): DateRange {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (yy: number, mm: number, dd: number) => toLocalDate(new Date(yy, mm, dd));
  switch (p) {
    case 'lastMonth': return { from: d(y, m - 1, 1), to: d(y, m, 0) };
    case 'last3': return { from: d(y, m - 2, 1), to: d(y, m + 1, 0) };
    case 'last6': return { from: d(y, m - 5, 1), to: d(y, m + 1, 0) };
    case 'last12': return { from: d(y, m - 11, 1), to: d(y, m + 1, 0) };
    case 'thisYear': return { from: d(y, 0, 1), to: d(y, 11, 31) };
    case 'all': {
      const dates = txs.map((t) => t.occurredAt.slice(0, 10)).sort();
      return { from: dates[0] ?? d(y, m, 1), to: dates[dates.length - 1] && dates[dates.length - 1] > d(y, m + 1, 0) ? dates[dates.length - 1] : d(y, m + 1, 0) };
    }
    default: return { from: d(y, m, 1), to: d(y, m + 1, 0) };
  }
}
