import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Transaction, TxType } from '../data/types';
import { TransactionForm } from '../components/Forms';
import { RangePicker } from '../components/RangePicker';
import { ExportButton } from '../export/ExportDialog';
import { dedupe, inRange } from '../lib/finance';
import { presetRange, type RangePreset } from '../lib/ranges';
import { formatDate } from '../lib/format';
import { TxRow } from './Dashboard';

export function Transactions() {
  const { t, lang } = useI18n();
  const data = useData();
  const [preset, setPreset] = useState<RangePreset>('thisMonth');
  const [range, setRange] = useState(() => presetRange('thisMonth', data.transactions));
  const [type, setType] = useState<'all' | TxType>('all');
  const [walletId, setWalletId] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return dedupe(data.transactions)
      .filter((x) => inRange(x, range))
      .filter((x) => type === 'all' || x.type === type)
      .filter((x) => walletId === 'all' || x.walletId === walletId || x.toWalletId === walletId)
      .filter((x) => categoryId === 'all' || x.categoryId === categoryId)
      .filter((x) => !needle || `${x.description} ${x.notes}`.toLowerCase().includes(needle))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [data.transactions, range, type, walletId, categoryId, q]);

  const groups = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const x of list) {
      const d = x.occurredAt.slice(0, 10);
      m.set(d, [...(m.get(d) ?? []), x]);
    }
    return [...m.entries()];
  }, [list]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('tx.title')}</h1>
          <span className="muted small">{t('tx.count', { n: list.length })}</span>
        </div>
        <div className="row">
          <ExportButton context="transactions" defaults={{ preset, range, type, walletId, categoryId }} />
          <button className="btn primary" onClick={() => setEditing('new')} disabled={data.wallets.length === 0}><Plus size={16} />{t('tx.add')}</button>
        </div>
      </div>

      <section className="card filters">
        <label className="field" style={{ flex: 2 }}>{t('common.search')}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 11, top: 12, color: 'var(--muted)' }} />
            <input className="input" style={{ paddingLeft: 34 }} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </label>
        <div className="field">{t('rep.period')}<RangePicker preset={preset} range={range} onChange={(p, r) => { setPreset(p); setRange(r); }} /></div>
        <label className="field">{t('tx.filterType')}
          <select className="input" value={type} onChange={(e) => { setType(e.target.value as 'all' | TxType); setCategoryId('all'); }}>
            <option value="all">{t('common.all')}</option>
            {(['income', 'expense', 'transfer'] as TxType[]).map((x) => <option key={x} value={x}>{t(`tx.type.${x}` as MessageKey)}</option>)}
          </select>
        </label>
        <label className="field">{t('tx.filterWallet')}
          <select className="input" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
            <option value="all">{t('common.all')}</option>
            {data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        <label className="field">{t('tx.filterCategory')}
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={type === 'transfer'}>
            <option value="all">{t('common.all')}</option>
            {data.categories.filter((c) => type === 'all' || c.type === type).map((c) => <option key={c.id} value={c.id}>{categoryLabel(c, t)}</option>)}
          </select>
        </label>
      </section>

      <section className="card" style={{ paddingTop: 4 }}>
        {groups.length === 0 && <div className="empty">{t('tx.empty')}</div>}
        {groups.map(([day, items]) => (
          <div key={day}>
            <div className="date-head">{formatDate(day, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="list">{items.map((x) => <TxRow key={x.id} tx={x} onClick={() => setEditing(x)} />)}</div>
          </div>
        ))}
      </section>

      {data.wallets.length > 0 && <button className="fab" aria-label={t('tx.add')} onClick={() => setEditing('new')}><Plus size={24} /></button>}
      {editing && <TransactionForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
