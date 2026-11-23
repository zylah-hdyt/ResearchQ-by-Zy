import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { Modal } from './Modal';
import { dedupe } from '../lib/finance';
import { matchesQuery, type FilterCtx } from '../lib/txFilter';
import { categoryIcon, transferIcon, walletIcon } from '../lib/categoryIcons';
import { formatDate, formatMoney } from '../lib/format';

type Hit = { key: string; group: 'wallets' | 'categories' | 'transactions'; label: string; sub: string; right?: string; icon: typeof Search; go: () => void };

/** Search across wallets, categories and transactions. Opens with the button, Ctrl/⌘+K or "/". */
export function SearchButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <button className={`search-trigger ${className}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={t('search.open')}>
        <Search size={18} aria-hidden /><span className="search-trigger-text">{t('search.placeholder')}</span><kbd className="search-kbd">Ctrl K</kbd>
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const base = profile!.preferredCurrency;
  const go = (fn: () => void) => () => { onClose(); fn(); };

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const ctx: FilterCtx = { wallets: data.wallets, base, rates: data.rates, categoryLabel: (id) => categoryLabel(data.categories.find((c) => c.id === id), t) };
    const wallets = data.wallets.filter((w) => w.name.toLowerCase().includes(s)).slice(0, 4).map<Hit>((w) => ({
      key: 'w' + w.id, group: 'wallets', label: w.name, sub: `${t(`acc.type.${w.type}` as MessageKey)} · ${w.currency}${w.archived ? ' · ' + t('acc.archived') : ''}`, icon: walletIcon(w.type),
      go: go(() => nav(`/accounts/${w.id}`)),
    }));
    const categories = data.categories.filter((c) => categoryLabel(c, t).toLowerCase().includes(s)).slice(0, 4).map<Hit>((c) => ({
      key: 'c' + c.id, group: 'categories', label: categoryLabel(c, t), sub: t(`tx.type.${c.type}` as MessageKey), icon: categoryIcon(c) ?? Tag,
      go: go(() => nav('/transactions', { state: { categoryId: c.id, type: c.type, all: true } })),
    }));
    const txs = dedupe(data.transactions).filter((x) => matchesQuery(x, s, ctx)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const transactions = txs.slice(0, 8).map<Hit>((x) => {
      const w = data.wallets.find((y) => y.id === x.walletId);
      const cat = data.categories.find((c) => c.id === x.categoryId);
      return {
        key: 't' + x.id, group: 'transactions', label: x.description || (x.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t)),
        sub: `${formatDate(x.occurredAt, lang, { day: 'numeric', month: 'short', year: 'numeric' })} · ${x.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t)} · ${w?.name ?? ''}`,
        right: w ? formatMoney(x.type === 'expense' ? -x.amount : x.amount, w.currency, lang, { sign: x.type === 'income' }) : '', icon: x.type === 'transfer' ? transferIcon : categoryIcon(cat),
        go: go(() => nav('/transactions', { state: { q: q.trim(), all: true, select: x.id } })),
      };
    });
    const more: Hit[] = txs.length > 8 ? [{ key: 'more', group: 'transactions', label: t('search.allResults', { n: txs.length }), sub: '', icon: Search, go: go(() => nav('/transactions', { state: { q: q.trim(), all: true } })) }] : [];
    return [...wallets, ...categories, ...transactions, ...more];
  }, [q, data, base, t, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setActive(0), [q]);
  useEffect(() => { listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter' && hits[active]) { e.preventDefault(); hits[active].go(); }
  };
  const groups: Hit['group'][] = ['wallets', 'categories', 'transactions'];
  let i = -1;
  return (
    <Modal title={t('search.title')} onClose={onClose} wide>
      <label className="input-affix">
        <Search size={17} aria-hidden />
        <input className="input" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={t('search.placeholder')}
          role="combobox" aria-expanded={hits.length > 0} aria-controls="search-results" aria-activedescendant={hits[active] ? 'sr-' + hits[active].key : undefined} aria-label={t('search.title')} />
      </label>
      <div id="search-results" ref={listRef} role="listbox" aria-label={t('search.results')} className="search-results">
        {!q.trim() ? <p className="muted small">{t('search.hint')}</p> : hits.length === 0 ? <p className="muted">{t('search.none', { q: q.trim() })}</p> : groups.map((g) => {
          const items = hits.filter((h) => h.group === g);
          if (!items.length) return null;
          return (
            <div key={g} role="group" aria-label={t(`search.group.${g}` as MessageKey)}>
              <div className="search-group">{t(`search.group.${g}` as MessageKey)}</div>
              {items.map((h) => { i += 1; const idx = i; return (
                <div key={h.key} id={'sr-' + h.key} data-i={idx} role="option" aria-selected={idx === active} className={`list-item search-hit${idx === active ? ' selected' : ''}`} onClick={h.go} onMouseMove={() => setActive(idx)}>
                  <span className="tile sm"><h.icon size={16} aria-hidden /></span>
                  <span className="grow"><span className="title" style={{ display: 'block' }}>{h.label}</span>{h.sub && <span className="sub" style={{ display: 'block' }}>{h.sub}</span>}</span>
                  {h.right && <span className="amount">{h.right}</span>}
                </div>
              ); })}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
