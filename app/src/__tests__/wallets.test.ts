import { describe, expect, it } from 'vitest';
import { makeData } from './gen';
import { balanceSeries, netWorthSeries, runningBalances, walletOverview, walletTransactions } from '../lib/wallets';
import { dedupe, effectOn, walletBalance } from '../lib/finance';
import { buildBuckets } from '../lib/periods';

describe('wallet overview', () => {
  const d = makeData(700, 21); const txs = dedupe(d.transactions);
  it('net worth = assets + liabilities = Σ converted balances of active wallets', () => {
    const o = walletOverview(d.wallets, txs, 'IDR', d.rates);
    const manual = d.wallets.reduce((s, w) => s + walletBalance(w, txs) * (w.currency === 'USD' ? 16000 : 1), 0);
    expect(o.netWorth).toBe(Math.round(manual));
    expect(o.assets + o.liabilities).toBe(o.netWorth);
    expect(o.groups.reduce((s, g) => s + g.subtotal, 0)).toBe(o.netWorth);
  });
  it('archived wallets are left out; a missing rate is reported, not guessed', () => {
    const archived = d.wallets.map((w, i) => (i === 0 ? { ...w, archived: true } : w));
    const o = walletOverview(archived, txs, 'IDR', d.rates);
    expect(o.groups.flatMap((g) => g.rows).some((r) => r.wallet.id === 'w0')).toBe(false);
    expect(walletOverview(d.wallets, txs, 'IDR', []).missing).toEqual(['USD']);
  });
  it('liabilities appear when a balance is negative', () => {
    const credit = [{ ...d.wallets[0], type: 'credit' as const, initialBalance: 0 }];
    const o = walletOverview(credit, [{ ...txs[0], type: 'expense', walletId: credit[0].id, amount: 1_000_000_00, categoryId: 'cat_food', toWalletId: undefined, toAmount: undefined }], 'IDR', d.rates);
    expect(o.liabilities).toBe(-1_000_000_00); expect(o.assets).toBe(0); expect(o.groups[0].type).toBe('credit');
  });
});

describe('wallet history', () => {
  const d = makeData(500, 33); const txs = dedupe(d.transactions);
  it('running balance after the newest transaction equals the wallet balance', () => {
    for (const w of d.wallets) {
      const own = walletTransactions(w, txs); if (!own.length) continue;
      const rb = runningBalances(w, txs);
      expect(rb.get(own[0].id)).toBe(walletBalance(w, txs));
      expect(rb.size).toBe(own.length);
    }
  });
  it('every step moves the balance by exactly that transaction’s effect', () => {
    const w = d.wallets[0]; const own = walletTransactions(w, txs).reverse(); const rb = runningBalances(w, txs);
    let prev = w.initialBalance;
    for (const t of own) { expect(rb.get(t.id)! - prev).toBe(effectOn(w.id, t)); prev = rb.get(t.id)!; }
  });
  it('balance series at a bucket end equals the independent balance that day', () => {
    const buckets = buildBuckets('3M', '2026-11-22', 'id');
    const w = d.wallets[1]; const s = balanceSeries(w, txs, buckets);
    for (const p of s) {
      const manual = w.initialBalance + txs.filter((t) => t.occurredAt.slice(0, 10) <= p.to).reduce((a, t) => a + effectOn(w.id, t), 0);
      expect(p.value).toBe(manual);
    }
    // the last bucket ends today, so it equals the current balance only if nothing is dated later
    expect(s[s.length - 1].value).toBe(walletBalance(w, txs.filter((t) => t.occurredAt.slice(0, 10) <= '2026-11-22')));
  });
  it('net worth series: the last point equals the overview net worth', () => {
    const buckets = buildBuckets('1Y', '2026-11-22', 'id');
    const { points } = netWorthSeries(d.wallets, txs, buckets, 'IDR', d.rates);
    expect(points[points.length - 1].value).toBe(walletOverview(d.wallets, txs, 'IDR', d.rates).netWorth);
  });
});
