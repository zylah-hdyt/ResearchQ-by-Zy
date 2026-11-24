import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Transaction } from '../data/types';
import { ExportButton } from '../export/ExportDialog';
import { useConfirm } from '../components/Confirm';
import { FilterSheet } from '../components/FilterSheet';
import { Modal } from '../components/Modal';
import { useQuickAdd } from '../components/QuickAdd';
import { useToast } from '../components/Toast';
import { TxDetail } from '../components/TxDetail';
import { TxRow } from '../components/TxRow';
import { StatTiles } from '../components/StatTiles';
import { dedupe } from '../lib/finance';
import { formatDate, formatMoney, toLocalDate } from '../lib/format';
import { addDays } from '../lib/periods';
import { useMedia } from '../lib/hooks';
import { presetRange } from '../lib/ranges';
import { activeCount, applyFilters, defaultFilters, groupByDay, summarizeList, type FilterCtx, type TxFilters } from '../lib/txFilter';

const PAGE = 100;

type Incoming = { categoryId?: string; type?: 'income' | 'expense'; from?: string; to?: string; q?: string; all?: boolean; select?: string };
function filtersFrom(incoming: Incoming | null, txs: Transaction[]): TxFilters {
  const d = defaultFilters(presetRange('thisMonth', txs));
  if (incoming?.all) return { ...defaultFilters(presetRange('all', txs), 'all'), q: incoming.q ?? '', type: incoming.type ?? 'all', categoryIds: incoming.categoryId ? [incoming.categoryId] : [] };
  if (!incoming?.from || !incoming.to) return d;
  return { ...d, preset: 'custom', range: { from: incoming.from, to: incoming.to }, type: 'expense', categoryIds: incoming.categoryId ? [incoming.categoryId] : [] };
}

export function Transactions() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openAdd, openEdit, openDuplicate } = useQuickAdd();
  const toast = useToast();
  const confirm = useConfirm();
  const base = profile!.preferredCurrency;
  const wide = useMedia('(min-width: 1100px)');

  // Arrivals from a budget ("see transactions") or from the global search (query / category / one transaction, all time).
  const loc = useLocation();
  const incoming = loc.state as Incoming | null;
  const [filters, setFilters] = useState<TxFilters>(() => filtersFrom(incoming, data.transactions));
  // A new search result while already on this page: apply it (the page does not remount).
  const firstKey = useRef(loc.key);
  useEffect(() => {
    if (loc.key === firstKey.current || !incoming) return;
    setFilters(filtersFrom(incoming, data.transactions));
    setSelId(incoming.select ?? null);
  }, [loc.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sheet, setSheet] = useState(false);
  const [selId, setSelId] = useState<string | null>(incoming?.select ?? null);
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(filters.q);

  const ctx: FilterCtx = useMemo(() => ({
    wallets: data.wallets, base, rates: data.rates,
    categoryLabel: (id) => categoryLabel(data.categories.find((c) => c.id === id), t),
  }), [data.wallets, data.categories, data.rates, base, t]);

  const all = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const list = useMemo(() => applyFilters(all, { ...filters, q }, ctx).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id)), [all, filters, q, ctx]);
  const totals = useMemo(() => summarizeList(list, ctx), [list, ctx]);
  const groups = useMemo(() => groupByDay(list.slice(0, limit), ctx), [list, limit, ctx]);
  const selected = list.find((x) => x.id === selId) ?? null;
  const badge = activeCount(filters);

  useEffect(() => setLimit(PAGE), [filters.range, filters.type, filters.walletIds, filters.categoryIds, filters.min, filters.max, q]);

  const remove = async (tx: Transaction) => {
    if (!(await confirm({ title: t('tx.deleteTitle'), body: t('tx.deleteBody'), confirmLabel: t('tx.delete'), danger: true }))) return;
    data.deleteTransaction(tx.id);
    setSelId(null);
    toast(t('tx.deleted'), { label: t('tx.undo'), onClick: () => { data.restoreTransaction(tx); toast(t('tx.restored')); } });
  };
  const detail = (tx: Transaction) => <TxDetail tx={tx} onEdit={() => openEdit(tx)} onDuplicate={() => openDuplicate(tx)} onDelete={() => remove(tx)} />;

  // Removable chips for every active filter.
  const chips: { key: string; label: string; clear: () => void }[] = [];
  const set = (p: Partial<TxFilters>) => setFilters((f) => ({ ...f, ...p }));
  if (filters.preset !== 'thisMonth') chips.push({ key: 'p', label: `${formatDate(filters.range.from, lang)} – ${formatDate(filters.range.to, lang)}`, clear: () => set({ preset: 'thisMonth', range: presetRange('thisMonth', data.transactions) }) });
  // Type has its own tabs above the list, so it is not repeated as a chip.
  for (const id of filters.walletIds) chips.push({ key: 'w' + id, label: data.wallets.find((w) => w.id === id)?.name ?? '', clear: () => set({ walletIds: filters.walletIds.filter((x) => x !== id) }) });
  for (const id of filters.categoryIds) chips.push({ key: 'c' + id, label: categoryLabel(data.categories.find((c) => c.id === id), t), clear: () => set({ categoryIds: filters.categoryIds.filter((x) => x !== id) }) });
  if (filters.min != null || filters.max != null) {
    const range = filters.min != null && filters.max != null ? `${formatMoney(filters.min, base, lang, { compact: true })} – ${formatMoney(filters.max, base, lang, { compact: true })}` : filters.max != null ? t('tx.filter.upTo', { v: formatMoney(filters.max, base, lang, { compact: true }) }) : t('tx.filter.from', { v: formatMoney(filters.min!, base, lang, { compact: true }) });
    chips.push({ key: 'a', label: t('tx.filter.amountChip', { range }), clear: () => set({ min: null, max: null }) });
  }

  const exportDefaults = {
    preset: filters.preset, range: filters.range, type: filters.type,
    walletId: filters.walletIds.length === 1 ? filters.walletIds[0] : 'all',
    categoryId: filters.categoryIds.length === 1 ? filters.categoryIds[0] : 'all',
  };
  const today = toLocalDate(new Date());
  const yesterday = addDays(today, -1);
  const dayLabel = (day: string) => {
    const d = formatDate(day, lang, { day: 'numeric', month: 'short', year: 'numeric' });
    return day === today ? `${t('tx.today')}, ${d}` : day === yesterday ? `${t('tx.yesterday')}, ${d}` : formatDate(day, lang, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  };
  const compact = (v: number, signed = false) => formatMoney(v, base, lang, { compact: true, sign: signed });

  return (
    <>
      <div className="page-head">
        <div><h1>{t('tx.title')}</h1><div className="sub">{t('tx.count', { n: list.length })}</div></div>
        <div className="page-actions">
          <ExportButton context="transactions" defaults={exportDefaults} />
          <button className="btn primary desktop-only" onClick={() => openAdd()}><Plus size={16} aria-hidden />{t('tx.add')}</button>
        </div>
      </div>

      <div className="tx-toolbar">
        <label className="input-affix grow">
          <Search size={17} aria-hidden />
          <input className="input" type="search" value={filters.q} onChange={(e) => set({ q: e.target.value })} placeholder={t('tx.searchPlaceholder')} aria-label={t('common.search')} />
        </label>
        <button className="btn filter-btn" onClick={() => setSheet(true)} aria-haspopup="dialog" title={t('tx.filters')} aria-label={badge > 0 ? `${t('tx.filters')} (${badge})` : t('tx.filters')}><SlidersHorizontal size={18} aria-hidden />{badge > 0 && <span className="count-badge">{badge}</span>}</button>
      </div>

      <div className="segmented fill tx-types" role="group" aria-label={t('tx.type')}>
        {(['all', 'income', 'expense', 'transfer'] as const).map((k) => (
          <button key={k} className={filters.type === k ? 'on' : ''} aria-pressed={filters.type === k} onClick={() => set({ type: k })}>{k === 'all' ? t('common.all') : t(`tx.type.${k}` as MessageKey)}</button>
        ))}
      </div>

      {chips.length > 0 && (
        <div className="chips" aria-label={t('tx.filters')}>
          {chips.map((c) => <span key={c.key} className="chip filter">{c.label}<button onClick={c.clear} aria-label={t('tx.filter.clear', { name: c.label })}><X size={14} aria-hidden /></button></span>)}
          <button className="btn ghost sm" onClick={() => setFilters(defaultFilters(presetRange('thisMonth', data.transactions), 'thisMonth'))}>{t('tx.filter.reset')}</button>
        </div>
      )}

      <StatTiles currency={base} label={t('dash.summary')} stats={[
        { kind: 'income', label: t('tx.sum.income'), value: totals.income },
        { kind: 'expense', label: t('tx.sum.expense'), value: totals.expense },
        { kind: 'net', label: t('tx.sum.net'), value: totals.net },
      ]} />

      <div className="split aside-right">
        <section className="tx-list" aria-label={t('tx.title')}>
          {groups.length === 0 && (
            <div className="card empty">
              <p>{data.wallets.length === 0 ? t('tx.emptyNoWallet') : all.length === 0 ? t('tx.emptyFirst') : t('tx.empty2')}</p>
              {data.wallets.length === 0 && <Link className="btn primary" to="/accounts"><Plus size={16} aria-hidden />{t('acc.add')}</Link>}
              {all.length === 0 && data.wallets.length > 0 && <button className="btn primary" onClick={() => openAdd()}><Plus size={16} aria-hidden />{t('tx.add')}</button>}
              {all.length > 0 && <button className="btn" onClick={() => setFilters(defaultFilters(presetRange('all', data.transactions), 'all'))}>{t('tx.showAll')}</button>}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.day} className="card flush day-card" role="group" aria-label={formatDate(g.day, lang)}>
              <div className="day-head"><span>{dayLabel(g.day)}</span><span className="net">{t('tx.dayNet', { v: compact(g.net, true) })}</span></div>
              <div className="list list-pad">{g.items.map((x) => <TxRow key={x.id} tx={x} selected={x.id === selId} onClick={() => setSelId(x.id)} />)}</div>
            </div>
          ))}
          {list.length > limit && (
            <div className="row" style={{ justifyContent: 'center', padding: '16px 0' }}>
              <button className="btn" onClick={() => setLimit(limit + PAGE)}>{t('common.showMore')} ({list.length - limit})</button>
            </div>
          )}
        </section>
        {wide && (
          <aside className="card sticky-col" aria-label={t('tx.details')}>
            {selected ? detail(selected) : <p className="muted small" style={{ textAlign: 'center', padding: '24px 8px' }}>{t('tx.pickOne')}</p>}
          </aside>
        )}
      </div>

      {!wide && selected && <Modal title={t('tx.details')} onClose={() => setSelId(null)}>{detail(selected)}</Modal>}
      {sheet && <FilterSheet value={filters} onApply={setFilters} onClose={() => setSheet(false)} />}
    </>
  );
}
