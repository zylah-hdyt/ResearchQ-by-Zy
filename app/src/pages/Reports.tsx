import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { RangePicker } from '../components/RangePicker';
import { CashflowChart, RankedBars } from '../components/Charts';
import { Money } from '../components/Money';
import { ExportButton } from '../export/ExportDialog';
import { collapse, dedupe, inRange, summarize, walletPeriods } from '../lib/finance';
import { autoBuckets, flowByBucket } from '../lib/periods';
import { convert } from '../lib/money';
import { formatMoney } from '../lib/format';
import { presetRange, type RangePreset } from '../lib/ranges';
import type { CurrencyCode } from '../data/types';

export function Reports() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const base = profile!.preferredCurrency;
  const [preset, setPreset] = useState<RangePreset>('last3');
  const [range, setRange] = useState(() => presetRange('last3', data.transactions));
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);

  const sum = summarize(txs, data.wallets, range);
  const inc = collapse(sum.income, base, base, data.rates);
  const exp = collapse(sum.expense, base, base, data.rates);
  const missing = [...new Set([...inc.missing, ...exp.missing])];

  // Category totals converted to the reporting currency.
  const byCat = (type: 'income' | 'expense') => {
    const cur = new Map(data.wallets.map((w) => [w.id, w.currency]));
    const m = new Map<string, number>();
    for (const x of txs) {
      if (x.type !== type || !inRange(x, range) || !x.categoryId) continue;
      const v = convert(x.amount, cur.get(x.walletId) as CurrencyCode, base, base, data.rates);
      if (v != null) m.set(x.categoryId, (m.get(x.categoryId) ?? 0) + v);
    }
    const total = [...m.values()].reduce((a, b) => a + b, 0);
    return [...m.entries()].map(([id, v]) => ({ cat: data.categories.find((c) => c.id === id), value: v, share: total ? v / total : 0 })).sort((a, b) => b.value - a.value);
  };
  const expCats = byCat('expense');
  const incCats = byCat('income');

  const points = flowByBucket(txs, data.wallets, autoBuckets(range, lang), base, base, data.rates).points;
  const periods = walletPeriods(data.wallets, txs, range);

  const catList = (items: ReturnType<typeof byCat>, tone: 'income' | 'expense') => items.length === 0 ? <p className="muted small">{t('rep.noData')}</p> : (
    <RankedBars tone={tone} currency={base} items={items.map((i) => ({ key: i.cat?.id ?? 'x', label: categoryLabel(i.cat, t), value: i.value, share: i.share }))} />
  );

  return (
    <>
      <div className="page-head">
        <div><h1>{t('rep.title')}</h1><span className="muted small">{t('rep.reportingIn', { currency: base })}</span></div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ minWidth: 180 }}><RangePicker preset={preset} range={range} onChange={(p, r) => { setPreset(p); setRange(r); }} /></div>
          <ExportButton context="reports" defaults={{ preset, range }} />
        </div>
      </div>
      {missing.length > 0 && <div className="banner">{t('common.notConverted', { codes: missing.join(', ') })}</div>}
      <section className="grid grid-3">
        <div className="card stat"><div className="stat-main"><span className="label"><i className="swatch" style={{ background: 'var(--chart-income)' }} />{t('dash.income')}</span><Money className="value" value={inc.value} currency={base} /></div></div>
        <div className="card stat"><div className="stat-main"><span className="label"><i className="swatch" style={{ background: 'var(--chart-expense)' }} />{t('dash.expense')}</span><Money className="value" value={exp.value} currency={base} /></div></div>
        <div className="card stat"><div className="stat-main"><span className="label"><i className="swatch" style={{ background: 'var(--brand)' }} />{t('dash.net')}</span><Money className="value" value={inc.value - exp.value} currency={base} sign /></div></div>
      </section>
      <section className="card"><div className="card-head"><h2>{t('dash.cashflow')}</h2></div><CashflowChart points={points} currency={base} /></section>
      <div className="grid grid-2">
        <section className="card"><div className="card-head"><h2>{t('rep.byCategory')}</h2></div>{catList(expCats, 'expense')}</section>
        <section className="card"><div className="card-head"><h2>{t('rep.incomeByCategory')}</h2></div>{catList(incCats, 'income')}</section>
      </div>
      <section className="card">
        <div className="card-head"><h2>{t('rep.walletMovement')}</h2></div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>{t('xl.account')}</th><th className="r">{t('rep.opening')}</th><th className="r">{t('rep.inflow')}</th><th className="r">{t('rep.outflow')}</th><th className="r">{t('rep.closing')}</th></tr></thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.wallet.id}>
                  <td>{p.wallet.name} <span className="muted small">{p.wallet.currency}</span></td>
                  <td className="r">{formatMoney(p.opening, p.wallet.currency, lang)}</td>
                  <td className="r income">{formatMoney(p.inflow, p.wallet.currency, lang)}</td>
                  <td className="r expense">{formatMoney(p.outflow ? -p.outflow : 0, p.wallet.currency, lang)}</td>
                  <td className="r"><strong>{formatMoney(p.closing, p.wallet.currency, lang)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
