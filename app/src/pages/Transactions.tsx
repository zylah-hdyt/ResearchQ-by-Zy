import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { dedupe } from '../lib/finance';
import { formatDate, formatMoney } from '../lib/format';
import { useMedia } from '../lib/hooks';
import { presetRange } from '../lib/ranges';
import { activeCount, applyFilters, defaultFilters, groupByDay, summarizeList, type FilterCtx, type TxFilters } from '../lib/txFilter';

const PAGE = 100;

export function Transactions() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openAdd, openEdit, openDuplicate } = useQuickAdd();
  const toast = useToast();
  const confirm = useConfirm();
  const base = profile!.preferredCurrency;
  const wide = useMedia('(min-width: 1100px)');

  const incoming = useLocation().state as { categoryId?: string; from?: string; to?: string } | null;
  const [filters, setFilters] = useState<TxFilters>(() => {
    const d = defaultFilters(presetRange('thisMonth', data.transactions));
    if (!incoming?.from || !incoming.to) return d;
    return { ...d, preset: 'custom', range: { from: incoming.from, to: incoming.to }, type: 'expense', categoryIds: incoming.categoryId ? [incoming.categoryId] : [] };
  });
  const [sheet, setSheet] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);
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
  if (filters.type !== 'all') chips.push({ key: 't', label: t(`tx.type.${filters.type}` as MessageKey), clear: () => set({ type: 'all' }) });
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
  const compact = (v: number, signed = false) => formatMoney(v, base, lang, { compact: true, sign: signed });

  return (
    <>
      <div className="page-head">
        <div><h1>{t('tx.title')}</h1><div className="sub">{t('tx.count', { n: list.length })}</div></div>
        <div className="page-actions">
          <ExportButton context="transactions" defaults={exportDefaults} />
          <button className="btn primary desktop-only" onClick={() => openAdd()} disabled={data.wallets.length === 0}><Plus size={16} aria-hidden />{t('tx.add')}</button>
        </div>
      </div>

      <div className="tx-toolbar">
        <label className="input-affix grow">
          <Search size={17} aria-hidden />
          <input className="input" type="search" value={filters.q} onChange={(e) => set({ q: e.target.value })} placeholder={t('tx.searchPlaceholder')} aria-label={t('common.search')} />
        </label>
        <button className="btn" onClick={() => setSheet(true)} aria-haspopup="dialog" aria-label={badge > 0 ? `${t('tx.filters')} (${badge})` : t('tx.filters')}><SlidersHorizontal size={17} aria-hidden /><span>{t('tx.filters')}</span>{badge > 0 && <span className="count-badge">{badge}</span>}</button>
      </div>

      {chips.length > 0 && (
        <div className="chips" aria-label={t('tx.filters')}>
          {chips.map((c) => <span key={c.key} className="chip filter">{c.label}<button onClick={c.clear} aria-label={t('tx.filter.clear', { name: c.label })}><X size={14} aria-hidden /></button></span>)}
          <button className="btn ghost sm" onClick={() => setFilters(defaultFilters(presetRange('thisMonth', data.transactions), 'thisMonth'))}>{t('tx.filter.reset')}</button>
        </div>
      )}

      <div className="mini-strip card flush" aria-label={t('dash.summary')}>
        <div><span className="mini-label"><i className="swatch" style={{ background: 'var(--chart-income)' }} />{t('tx.sum.income')}</span><strong className="num" title={formatMoney(totals.income, base, lang)}>{compact(totals.income)}</strong></div>
        <div><span className="mini-label"><i className="swatch" style={{ background: 'var(--chart-expense)' }} />{t('tx.sum.expense')}</span><strong className="num" title={formatMoney(totals.expense, base, lang)}>{compact(totals.expense)}</strong></div>
        <div><span className="mini-label"><i className="swatch" style={{ background: 'var(--brand)' }} />{t('tx.sum.net')}</span><strong className="num" title={formatMoney(totals.net, base, lang, { sign: true })}>{compact(totals.net, true)}</strong></div>
      </div>

      <div className="split aside-right">
        <section className="card flush tx-list" aria-label={t('tx.title')}>
          {groups.length === 0 && (
            <div className="empty">
              <p>{all.length === 0 ? t('tx.emptyFirst') : t('tx.empty2')}</p>
              {all.length === 0 && data.wallets.length > 0 && <button className="btn primary" onClick={() => openAdd()}><Plus size={16} aria-hidden />{t('tx.add')}</button>}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.day} role="group" aria-label={formatDate(g.day, lang)}>
              <div className="date-head"><span>{formatDate(g.day, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><span className="net">{t('tx.dayNet', { v: compact(g.net, true) })}</span></div>
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
