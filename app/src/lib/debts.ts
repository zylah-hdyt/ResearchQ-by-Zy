import type { Category, CurrencyCode, ExchangeRate, Transaction, Wallet } from '../data/types';
import { convert } from './money';

/**
 * Debts and receivables, kept as ordinary transactions so wallet balances, reports and exports stay right:
 *   I borrow  → income  "loanIn"        · I repay   → expense "debtPaid"
 *   I lend    → expense "loanOut"       · I'm repaid → income "debtCollected"
 * The person is the transaction description; an optional due date is a "Jatuh tempo: YYYY-MM-DD" / "Due: …" line in notes.
 */
export type DebtSide = 'owe' | 'owed';
export const DEBT_KEYS = { owe: { principal: 'loanIn', payment: 'debtPaid' }, owed: { principal: 'loanOut', payment: 'debtCollected' } } as const;

const DUE_RE = /^(?:Jatuh tempo|Due):\s*(\d{4}-\d{2}-\d{2})\s*$/im;
export const dueOf = (notes: string): string | null => notes.match(DUE_RE)?.[1] ?? null;
export const noteWithoutDue = (notes: string) => notes.replace(DUE_RE, '').trim();
export const composeNotes = (due: string | null, note: string, lang: 'id' | 'en') =>
  [due ? `${lang === 'id' ? 'Jatuh tempo' : 'Due'}: ${due}` : '', note.trim()].filter(Boolean).join('\n');
export const partyKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

export interface DebtEntry {
  key: string;
  side: DebtSide;
  /** Display name: as written on the first loan. */
  name: string;
  /** In the base currency. */
  principal: number;
  paid: number;
  remaining: number;
  /** Earliest due date among the loans, if any. */
  due: string | null;
  /** Wallet of the most recent loan (default for a payment). */
  walletId: string;
  lastAt: string;
  items: Transaction[];
}

export function debtLedger(txs: Transaction[], wallets: Wallet[], categories: Category[], base: CurrencyCode, rates: ExchangeRate[]): { entries: DebtEntry[]; missing: CurrencyCode[] } {
  const keyOf = new Map(categories.map((c) => [c.id, c.key]));
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const map = new Map<string, DebtEntry>();
  const missing = new Set<CurrencyCode>();
  const sorted = [...txs].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  for (const t of sorted) {
    if (t.type === 'transfer' || !t.categoryId) continue;
    const k = keyOf.get(t.categoryId);
    const side: DebtSide | null = k === 'loanIn' || k === 'debtPaid' ? 'owe' : k === 'loanOut' || k === 'debtCollected' ? 'owed' : null;
    if (!side) continue;
    const isPrincipal = k === 'loanIn' || k === 'loanOut';
    const name = t.description.trim() || '—';
    const id = `${side}:${partyKey(name)}`;
    const from = cur.get(t.walletId);
    const v = from ? convert(t.amount, from, base, base, rates) : null;
    if (v == null) { if (from) missing.add(from); continue; }
    const e = map.get(id) ?? { key: id, side, name, principal: 0, paid: 0, remaining: 0, due: null, walletId: t.walletId, lastAt: t.occurredAt, items: [] };
    if (isPrincipal) {
      e.principal += v;
      e.walletId = t.walletId;
      const d = dueOf(t.notes);
      if (d && (!e.due || d < e.due)) e.due = d;
    } else e.paid += v;
    e.lastAt = t.occurredAt;
    e.items.push(t);
    map.set(id, e);
  }
  const entries = [...map.values()].map((e) => ({ ...e, remaining: Math.max(0, e.principal - e.paid), items: e.items.reverse() }));
  entries.sort((a, b) => (b.remaining > 0 ? 1 : 0) - (a.remaining > 0 ? 1 : 0) || (a.due ?? '9999').localeCompare(b.due ?? '9999') || b.lastAt.localeCompare(a.lastAt));
  return { entries, missing: [...missing] };
}
