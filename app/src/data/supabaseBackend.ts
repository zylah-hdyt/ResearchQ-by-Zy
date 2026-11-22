import type { SupabaseClient } from '@supabase/supabase-js';
import type { Budget, Category, CurrencyCode, ExchangeRate, Transaction, Wallet } from './types';
import type { DataBackend } from './backend';

const PAGE = 1000;
const CHUNK = 500;

type Row = Record<string, unknown>;

const walletFrom = (r: Row): Wallet => ({
  id: r.id as string, userId: r.user_id as string, name: r.name as string, type: r.type as Wallet['type'],
  currency: r.currency as CurrencyCode, initialBalance: Number(r.initial_balance), color: r.color as string,
  archived: r.archived as boolean, createdAt: r.created_at as string,
});
const walletTo = (w: Wallet, uid: string): Row => ({
  user_id: uid, id: w.id, name: w.name, type: w.type, currency: w.currency,
  initial_balance: w.initialBalance, color: w.color, archived: w.archived,
});

const categoryFrom = (r: Row): Category => ({
  id: r.id as string, userId: r.user_id as string, key: (r.key as string) ?? undefined, name: (r.name as string) ?? undefined,
  type: r.type as Category['type'], color: r.color as string,
});

const txFrom = (r: Row): Transaction => ({
  id: r.id as string, userId: r.user_id as string, type: r.type as Transaction['type'],
  walletId: r.wallet_id as string, toWalletId: (r.to_wallet_id as string) ?? undefined,
  categoryId: (r.category_id as string) ?? undefined, amount: Number(r.amount),
  toAmount: r.to_amount == null ? undefined : Number(r.to_amount),
  occurredAt: (r.occurred_at as string).slice(0, 16), description: r.description as string,
  notes: r.notes as string, createdAt: r.created_at as string,
});
const txTo = (t: Transaction, uid: string): Row => ({
  user_id: uid, id: t.id, type: t.type, wallet_id: t.walletId, to_wallet_id: t.toWalletId ?? null,
  category_id: t.categoryId ?? null, amount: t.amount, to_amount: t.toAmount ?? null,
  occurred_at: t.occurredAt, description: t.description, notes: t.notes,
});

const budgetFrom = (r: Row): Budget => ({
  id: r.id as string, userId: r.user_id as string, categoryId: r.category_id as string,
  amount: Number(r.amount), period: ((r.period as string) ?? 'monthly') as Budget['period'], currency: r.currency as CurrencyCode, createdAt: r.created_at as string,
});
const budgetTo = (b: Budget, uid: string): Row => ({
  user_id: uid, id: b.id, category_id: b.categoryId, amount: b.amount, period: b.period, currency: b.currency,
});

const chunks = <T,>(xs: T[], n = CHUNK) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

/** Entities that differ between two lists, keyed by id. Reference equality first, JSON as fallback. */
function diff<T>(prev: T[], next: T[], key: (x: T) => string) {
  const before = new Map(prev.map((x) => [key(x), x]));
  const after = new Set(next.map(key));
  const upserts = next.filter((x) => {
    const old = before.get(key(x));
    return old !== x && JSON.stringify(old) !== JSON.stringify(x);
  });
  const removed = prev.filter((x) => !after.has(key(x))).map(key);
  return { upserts, removed };
}

export function createSupabaseBackend(db: SupabaseClient): DataBackend {
  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(e.message);
  };

  async function fetchAll(table: string, order: string): Promise<Row[]> {
    const out: Row[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await db.from(table).select('*').order(order, { ascending: true }).range(from, from + PAGE - 1);
      fail(error);
      out.push(...((data ?? []) as Row[]));
      if (!data || data.length < PAGE) break;
    }
    return out;
  }

  const upsert = async (table: string, rows: Row[], onConflict: string) => {
    for (const c of chunks(rows)) fail((await db.from(table).upsert(c, { onConflict })).error);
  };
  const removeIds = async (table: string, uid: string, col: string, ids: string[]) => {
    for (const c of chunks(ids, 200)) fail((await db.from(table).delete().eq('user_id', uid).in(col, c)).error);
  };

  return {
    async load() {
      const [w, c, t, b, r, n] = await Promise.all([
        fetchAll('wallets', 'created_at'), fetchAll('categories', 'id'), fetchAll('transactions', 'occurred_at'),
        fetchAll('budgets', 'created_at'), fetchAll('exchange_rates', 'code'), fetchAll('notification_reads', 'notification_key'),
      ]);
      return {
        wallets: w.map(walletFrom),
        categories: c.map(categoryFrom),
        transactions: t.map(txFrom).sort((a, b2) => b2.occurredAt.localeCompare(a.occurredAt)),
        budgets: b.map(budgetFrom),
        rates: r.map((x): ExchangeRate => ({ code: x.code as CurrencyCode, rate: Number(x.rate) })),
        readNotifications: n.map((x) => x.notification_key as string),
      };
    },

    async save(uid, prev, next) {
      const tx = diff(prev.transactions, next.transactions, (x) => x.id);
      const wal = diff(prev.wallets, next.wallets, (x) => x.id);
      const bud = diff(prev.budgets, next.budgets, (x) => x.id);
      const rate = diff(prev.rates, next.rates, (x) => x.code);
      const read = next.readNotifications.filter((x) => !prev.readNotifications.includes(x));

      // Order matters for foreign keys: parents first when adding, children first when removing.
      await removeIds('transactions', uid, 'id', tx.removed);
      await removeIds('budgets', uid, 'id', bud.removed);
      await removeIds('wallets', uid, 'id', wal.removed);
      await upsert('wallets', wal.upserts.map((x) => walletTo(x, uid)), 'user_id,id');
      await upsert('transactions', tx.upserts.map((x) => txTo(x, uid)), 'user_id,id');
      await upsert('budgets', bud.upserts.map((x) => budgetTo(x, uid)), 'user_id,id');
      await removeIds('exchange_rates', uid, 'code', rate.removed);
      await upsert('exchange_rates', rate.upserts.map((x) => ({ user_id: uid, code: x.code, rate: x.rate })), 'user_id,code');
      await upsert('notification_reads', read.map((k) => ({ user_id: uid, notification_key: k })), 'user_id,notification_key');
    },
  };
}
