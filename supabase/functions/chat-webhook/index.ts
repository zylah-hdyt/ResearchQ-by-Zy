// Supabase Edge Function: receives chat messages from the WhatsApp gateway, records them for the linked user, replies.
// Deploy WITHOUT JWT verification (the gateway cannot send one): supabase functions deploy chat-webhook --no-verify-jwt
// Secrets: CHAT_WEBHOOK_SECRET (long random string, also in the webhook URL as ?key=...), FONNTE_TOKEN.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleIncoming, type BalanceRow, type BudgetRow, type NewTx, type Store, type Totals, type UserCtx } from './core.ts';
import { constantTimeEqual, parseInbound, readBody, sendReply } from './provider.ts';
import type { CategoryRef, WalletRef } from './parser.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
type Row = Record<string, unknown>;
const must = <T>(r: { data: T | null; error: { message: string } | null }): T => { if (r.error) throw new Error(r.error.message); return r.data as T; };

async function pages(table: string, userId: string, cols: string, filter?: (q: any) => any): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    let q = db.from(table).select(cols).eq('user_id', userId).order('id').range(from, from + 999);
    if (filter) q = filter(q);
    const rows = must(await q) as unknown as Row[];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}
const walletOf = (r: Row): WalletRef => ({ id: r.id as string, name: r.name as string, currency: r.currency as string, archived: r.archived as boolean });

const store: Store = {
  async seen(eventId) {
    const { error } = await db.from('chat_events').insert({ event_id: eventId });
    if (error?.code === '23505') return true;
    if (error) throw new Error(error.message);
    if (Math.random() < 0.02) await db.from('chat_events').delete().lt('created_at', new Date(Date.now() - 7 * 864e5).toISOString());
    return false;
  },
  async userByPhone(phone) {
    return (must(await db.from('chat_links').select('user_id').eq('phone', phone).maybeSingle()) as Row | null)?.user_id as string ?? null;
  },
  async linkWithCode(code, phone) {
    const row = must(await db.from('chat_link_codes').select('user_id, expires_at').eq('code', code).maybeSingle()) as Row | null;
    if (!row || new Date(row.expires_at as string).getTime() < Date.now()) return null;
    const userId = row.user_id as string;
    await db.from('chat_links').delete().eq('phone', phone); // the number moves to this account
    must(await db.from('chat_links').upsert({ user_id: userId, phone, last_tx_id: null, last_wallet_id: null }, { onConflict: 'user_id' }));
    await db.from('chat_link_codes').delete().eq('user_id', userId);
    return userId;
  },
  async context(userId): Promise<UserCtx> {
    const [p, w, c, l] = await Promise.all([
      db.from('profiles').select('language, preferred_currency').eq('user_id', userId).single(),
      db.from('wallets').select('id, name, currency, archived').eq('user_id', userId).order('created_at'),
      db.from('categories').select('id, key, name, type').eq('user_id', userId),
      db.from('chat_links').select('last_wallet_id, last_tx_id').eq('user_id', userId).maybeSingle(),
    ]);
    const prof = must(p) as Row;
    return {
      userId, language: prof.language === 'en' ? 'en' : 'id', currency: prof.preferred_currency as string,
      wallets: (must(w) as Row[]).map(walletOf), categories: (must(c) as Row[]).map((r): CategoryRef => ({ id: r.id as string, key: (r.key as string) ?? undefined, name: (r.name as string) ?? undefined, type: r.type as 'income' | 'expense' })),
      lastWalletId: (l.data as Row | null)?.last_wallet_id as string | null, lastTxId: (l.data as Row | null)?.last_tx_id as string | null,
    };
  },
  async addTransaction(userId, t: NewTx) {
    const id = 'tx_' + crypto.randomUUID().replaceAll('-', '').slice(0, 16);
    must(await db.from('transactions').insert({
      user_id: userId, id, type: t.type, wallet_id: t.walletId, to_wallet_id: t.toWalletId ?? null, category_id: t.categoryId ?? null,
      amount: t.amount, to_amount: t.toAmount ?? null, occurred_at: t.occurredAt, description: t.description, notes: 'via chat',
    }));
    return id;
  },
  async deleteTransaction(userId, id) {
    const tx = must(await db.from('transactions').select('type, amount, description, wallet_id').eq('user_id', userId).eq('id', id).maybeSingle()) as Row | null;
    if (!tx) return null;
    const w = must(await db.from('wallets').select('currency').eq('user_id', userId).eq('id', tx.wallet_id as string).single()) as Row;
    must(await db.from('transactions').delete().eq('user_id', userId).eq('id', id));
    return { description: tx.description as string, amount: Number(tx.amount), currency: w.currency as string, type: tx.type as string };
  },
  async setLast(userId, patch) {
    const upd: Row = {};
    if ('txId' in patch) upd.last_tx_id = patch.txId ?? null;
    if (patch.walletId) upd.last_wallet_id = patch.walletId;
    must(await db.from('chat_links').update(upd).eq('user_id', userId));
  },
  async balances(userId): Promise<BalanceRow[]> {
    const [wallets, txs] = await Promise.all([pages('wallets', userId, 'id, name, currency, archived, initial_balance'), pages('transactions', userId, 'id, type, wallet_id, to_wallet_id, amount, to_amount')]);
    const bal = new Map(wallets.map((w) => [w.id as string, Number(w.initial_balance)]));
    for (const t of txs) {
      const a = Number(t.amount), w = t.wallet_id as string;
      if (t.type === 'income') bal.set(w, (bal.get(w) ?? 0) + a);
      else if (t.type === 'expense') bal.set(w, (bal.get(w) ?? 0) - a);
      else { bal.set(w, (bal.get(w) ?? 0) - a); const to = t.to_wallet_id as string; bal.set(to, (bal.get(to) ?? 0) + Number(t.to_amount ?? a)); }
    }
    return wallets.map((w) => ({ wallet: walletOf(w), balance: bal.get(w.id as string) ?? 0 }));
  },
  async totals(userId, from, to): Promise<Totals> {
    const [wallets, txs] = await Promise.all([pages('wallets', userId, 'id, currency'), pages('transactions', userId, 'id, type, wallet_id, amount', (q) => q.neq('type', 'transfer').gte('occurred_at', from + 'T00:00').lte('occurred_at', to + 'T23:59'))]);
    const cur = new Map(wallets.map((w) => [w.id as string, w.currency as string]));
    const out: Totals = {};
    for (const t of txs) { const c = cur.get(t.wallet_id as string); if (!c) continue; (out[c] ??= { income: 0, expense: 0 })[t.type as 'income' | 'expense'] += Number(t.amount); }
    return out;
  },
  async budgets(userId, from, to): Promise<BudgetRow[]> {
    const [budgets, cats, wallets, txs] = await Promise.all([
      pages('budgets', userId, 'id, category_id, amount, currency, period').then((r) => r.filter((b) => (b.period ?? 'monthly') === 'monthly')),
      pages('categories', userId, 'id, key, name'), pages('wallets', userId, 'id, currency'),
      pages('transactions', userId, 'id, wallet_id, category_id, amount', (q) => q.eq('type', 'expense').gte('occurred_at', from + 'T00:00').lte('occurred_at', to + 'T23:59')),
    ]);
    const cur = new Map(wallets.map((w) => [w.id as string, w.currency as string]));
    return budgets.map((b) => {
      const cat = cats.find((c) => c.id === b.category_id);
      // only spending in the budget's own currency is counted, so currencies are never mixed
      const spent = txs.filter((t) => t.category_id === b.category_id && cur.get(t.wallet_id as string) === b.currency).reduce((s, t) => s + Number(t.amount), 0);
      return { label: (cat?.name as string) ?? (cat?.key as string) ?? '—', spent, limit: Number(b.amount), currency: b.currency as string };
    });
  },
};

Deno.serve(async (req) => {
  const secret = Deno.env.get('CHAT_WEBHOOK_SECRET');
  if (!secret) return new Response('not configured', { status: 503 });
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!constantTimeEqual(key, secret)) return new Response('forbidden', { status: 403 });
  if (req.method === 'GET') return new Response('ok'); // connectivity check from the gateway's dashboard
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  let body: Record<string, unknown> = {};
  try { body = await readBody(req); } catch (e) { console.error('unreadable body', String(e)); return Response.json({ ok: true }); }
  const inbound = parseInbound(body);
  if (!inbound) { console.log('ignored message; keys:', Object.keys(body).join(',')); return Response.json({ ok: true, ignored: true }); }

  let text: string | null;
  try { text = await handleIncoming({ phone: inbound.phone, text: inbound.text, eventId: inbound.eventId }, store); }
  catch (e) { console.error('handler failed', String(e)); text = 'Maaf, terjadi kesalahan. Coba lagi sebentar lagi. / Sorry, something went wrong. Please try again.'; }
  if (text) {
    const token = Deno.env.get('FONNTE_TOKEN');
    if (!token) console.error('FONNTE_TOKEN is not set: cannot reply');
    else { const r = await sendReply(token, inbound.phone, text); if (!r.ok) console.error('reply failed', r.status, r.body); }
  }
  return Response.json({ ok: true });
});
