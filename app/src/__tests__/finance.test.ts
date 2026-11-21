import { describe, expect, it } from 'vitest';
import { fixture } from './fixtures';
import { budgetLines, dedupe, summarize, walletBalance, walletPeriods, monthsIn } from '../lib/finance';
import { convert, toMinor } from '../lib/money';
import { dayPart } from '../lib/greeting';
import { initialsOf } from '../lib/avatar';

const nov = { from: '2026-11-01', to: '2026-11-30' };

describe('finance rules', () => {
  it('excludes transfers from income and expense totals', () => {
    const d = fixture();
    const s = summarize(dedupe(d.transactions.filter((t) => t.userId === 'u_test')), d.wallets, nov);
    expect(s.income).toEqual({ IDR: 10_000_000_00 });
    expect(s.expense).toEqual({ IDR: 300_000_00, USD: 20_00 });
  });

  it('never mixes currencies in totals', () => {
    const d = fixture();
    const s = summarize(dedupe(d.transactions), d.wallets, nov);
    expect(Object.keys(s.expense).sort()).toEqual(['IDR', 'USD']);
  });

  it('computes opening and closing balances', () => {
    const d = fixture();
    const txs = dedupe(d.transactions.filter((t) => t.userId === 'u_test'));
    const bank = d.wallets[0];
    expect(walletBalance(bank, txs, '2026-11-01')).toBe(1_500_000_00);
    const [p] = walletPeriods([bank], txs, nov);
    expect(p.opening).toBe(1_500_000_00);
    // +10m salary −250k food −500k transfer −1.6m transfer
    expect(p.closing).toBe(1_500_000_00 + 10_000_000_00 - 250_000_00 - 500_000_00 - 1_600_000_00);
    expect(p.closing).toBe(walletBalance(bank, txs, '2026-12-01'));
  });

  it('converts with rates and reports missing ones', () => {
    expect(convert(100_00, 'USD', 'IDR', 'IDR', [{ code: 'USD', rate: 16000 }])).toBe(1_600_000_00);
    expect(convert(100_00, 'EUR', 'IDR', 'IDR', [])).toBeNull();
    expect(toMinor('12.345')).toBe(1235);
  });

  it('budget utilisation and status', () => {
    const d = fixture();
    const [l] = budgetLines(d.budgets, d.categories, dedupe(d.transactions), d.wallets, nov, 'IDR', d.rates);
    expect(l.spent).toBe(300_000_00);
    expect(l.status).toBe('exceeded');
    expect(monthsIn({ from: '2026-10-15', to: '2026-12-02' })).toEqual(['2026-10', '2026-11', '2026-12']);
  });

  it('greeting and initials', () => {
    expect(dayPart(new Date(2026, 0, 1, 7))).toBe('morning');
    expect(dayPart(new Date(2026, 0, 1, 13))).toBe('afternoon');
    expect(dayPart(new Date(2026, 0, 1, 18))).toBe('evening');
    expect(dayPart(new Date(2026, 0, 1, 23))).toBe('night');
    expect(initialsOf('Alex Morgan')).toBe('AM');
    expect(initialsOf('  siti  ')).toBe('SI');
  });
});
