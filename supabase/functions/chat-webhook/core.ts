/**
 * Conversation logic for the chat channel (WhatsApp via a gateway). Everything that touches the outside world goes
 * through `Store`, so the same code is tested with an in-memory store and runs in the Edge Function with Supabase.
 */
import { normalizePhone, parseMessage, type CategoryRef, type Intent, type WalletRef } from './parser.ts';

export type Lang = 'id' | 'en';
export interface UserCtx { userId: string; language: Lang; currency: string; wallets: WalletRef[]; categories: CategoryRef[]; lastWalletId?: string | null; lastTxId?: string | null }
export interface NewTx { type: 'income' | 'expense' | 'transfer'; walletId: string; toWalletId?: string; categoryId?: string; amount: number; toAmount?: number; occurredAt: string; description: string }
export interface BalanceRow { wallet: WalletRef; balance: number }
export interface BudgetRow { label: string; spent: number; limit: number; currency: string }
export type Totals = Record<string, { income: number; expense: number }>;

export interface Store {
  /** True when this event id was already handled (and records it otherwise). */
  seen(eventId: string): Promise<boolean>;
  userByPhone(phone: string): Promise<string | null>;
  linkWithCode(code: string, phone: string): Promise<string | null>;
  context(userId: string): Promise<UserCtx>;
  addTransaction(userId: string, t: NewTx): Promise<string>;
  deleteTransaction(userId: string, id: string): Promise<{ description: string; amount: number; currency: string; type: string } | null>;
  setLast(userId: string, patch: { txId?: string | null; walletId?: string }): Promise<void>;
  balances(userId: string): Promise<BalanceRow[]>;
  totals(userId: string, from: string, to: string): Promise<Totals>;
  budgets(userId: string, from: string, to: string): Promise<BudgetRow[]>;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Indonesia is the default: dates and "today" follow WIB (UTC+7). */
export function wib(now: Date) {
  const t = new Date(now.getTime() + 7 * 3600e3);
  return { date: `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`, time: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`, y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 };
}

export function fmt(minor: number, currency: string, lang: Lang): string {
  const v = minor / 100;
  if (currency === 'IDR') return `${v < 0 ? '-' : ''}Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.abs(Math.round(v)))}`;
  return `${currency} ${new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
}

const CAT: Record<string, [string, string]> = {
  salary: ['Gaji', 'Salary'], bonus: ['Bonus', 'Bonus'], business: ['Usaha', 'Business'], investment: ['Investasi', 'Investment'], giftIn: ['Hadiah diterima', 'Gifts received'], otherIncome: ['Pemasukan lain', 'Other income'],
  food: ['Makan & minum', 'Food & drink'], groceries: ['Belanja harian', 'Groceries'], transport: ['Transportasi', 'Transport'], housing: ['Tempat tinggal', 'Housing'], utilities: ['Listrik, air & internet', 'Utilities'],
  shopping: ['Belanja', 'Shopping'], health: ['Kesehatan', 'Health'], education: ['Pendidikan', 'Education'], entertainment: ['Hiburan', 'Entertainment'], bills: ['Tagihan & langganan', 'Bills & subscriptions'], otherExpense: ['Pengeluaran lain', 'Other expenses'],
};
export const catLabel = (c: CategoryRef | undefined, lang: Lang) => (c?.name ? c.name : c?.key && CAT[c.key] ? CAT[c.key][lang === 'id' ? 0 : 1] : '—');

const T = {
  id: {
    notLinked: 'Nomor ini belum terhubung ke akun MyFi.\nBuka *MyFi → Pengaturan → Catat lewat WhatsApp*, lalu kirim kode 6 angkanya ke sini.',
    linked: '✅ Terhubung! Sekarang cukup ketik, misalnya:\n• makan siang 25rb\n• gaji 5jt\n• transfer 500rb bca ke gopay\n• saldo\nKetik *bantuan* untuk daftar lengkap.',
    badCode: 'Kode salah atau sudah kedaluwarsa. Buat kode baru di MyFi → Pengaturan.',
    help: '*Cara pakai MyFi lewat chat*\n\n*Catat*\n• makan siang 25rb\n• bensin 50rb pakai bca\n• gaji 5jt\n• kopi 18rb kemarin\n• transfer 500rb bca ke gopay\n\n*Lihat*\n• saldo\n• hari ini\n• bulan ini\n• anggaran\n\n*Koreksi*\n• batal (membatalkan catatan terakhir)\n\nNominal: 25rb, 25k, 1,5jt, 25.000.',
    noWallet: 'Belum ada dompet. Buat dulu di aplikasi MyFi, lalu coba lagi.',
    noAmount: 'Saya belum menemukan nominalnya. Contoh: _makan siang 25rb_',
    ambiguous: 'Ada lebih dari satu nominal, jadi saya tidak mencatat apa pun. Kirim satu per satu ya, misalnya: _makan 25rb_ lalu _parkir 5rb_.',
    transferWallets: 'Untuk transfer sebutkan dua dompet. Contoh: _transfer 500rb bca ke gopay_',
    unknownWallet: 'Dompet itu tidak ketemu. Dompet Anda: {list}.',
    crossCurrency: 'Transfer beda mata uang perlu nominal diterima. Lakukan di aplikasi MyFi.',
    tooBig: 'Nominalnya terlalu besar untuk dicatat lewat chat. Catat di aplikasi MyFi.',
    noCategory: 'Kategori belum tersedia di akun Anda. Buka aplikasi MyFi sekali dulu.',
    nothingToUndo: 'Tidak ada catatan terakhir dari chat yang bisa dibatalkan.',
    undone: '↩️ Dibatalkan: {what}',
    expense: 'Pengeluaran', income: 'Pemasukan', transfer: 'Transfer', balanceOf: 'Saldo {w}', recorded: 'Tercatat',
    undoHint: 'Ketik *batal* jika salah.',
    totalIn: 'Pemasukan', totalOut: 'Pengeluaran', net: 'Bersih', today: 'Hari ini', month: 'Bulan ini', balances: 'Saldo', total: 'Total', noBudget: 'Belum ada anggaran bulanan.', budgetTitle: 'Anggaran bulan ini', noData: 'Belum ada transaksi.',
  },
  en: {
    notLinked: 'This number is not linked to a MyFi account.\nOpen *MyFi → Settings → Record by WhatsApp* and send the 6-digit code here.',
    linked: '✅ Linked! Now just type, for example:\n• lunch 25k\n• salary 5m\n• transfer 500k bca to gopay\n• balance\nType *help* for the full list.',
    badCode: 'Wrong or expired code. Create a new one in MyFi → Settings.',
    help: '*Using MyFi by chat*\n\n*Record*\n• lunch 25k\n• gas 50k with bca\n• salary 5m\n• coffee 18k yesterday\n• transfer 500k bca to gopay\n\n*View*\n• balance\n• today\n• this month\n• budget\n\n*Fix*\n• undo (cancels the last chat entry)\n\nAmounts: 25k, 1.5m, 25,000.',
    noWallet: 'No wallet yet. Create one in the MyFi app first, then try again.',
    noAmount: 'I could not find an amount. Example: _lunch 25k_',
    ambiguous: 'There is more than one amount, so I recorded nothing. Send them one at a time, e.g. _lunch 25k_ then _parking 5k_.',
    transferWallets: 'Name two wallets for a transfer. Example: _transfer 500k bca to gopay_',
    unknownWallet: 'I could not find that wallet. Your wallets: {list}.',
    crossCurrency: 'Transfers between currencies need the received amount. Do it in the MyFi app.',
    tooBig: 'That amount is too large to record by chat. Use the MyFi app.',
    noCategory: 'Categories are not set up on your account yet. Open the MyFi app once first.',
    nothingToUndo: 'There is no recent chat entry to undo.',
    undone: '↩️ Undone: {what}',
    expense: 'Expense', income: 'Income', transfer: 'Transfer', balanceOf: '{w} balance', recorded: 'Recorded',
    undoHint: 'Type *undo* if it is wrong.',
    totalIn: 'Income', totalOut: 'Expenses', net: 'Net', today: 'Today', month: 'This month', balances: 'Balances', total: 'Total', noBudget: 'No monthly budgets yet.', budgetTitle: 'Budgets this month', noData: 'No transactions yet.',
  },
} as const;
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

export interface Incoming { phone: string; text: string; eventId?: string; now?: Date }

/** Returns the reply to send, or null when nothing should be sent (duplicate delivery). */
export async function handleIncoming(msg: Incoming, store: Store): Promise<string | null> {
  const now = msg.now ?? new Date();
  if (msg.eventId && (await store.seen(msg.eventId))) return null;
  const phone = normalizePhone(msg.phone);
  if (!phone) return null;
  const today = wib(now);

  let userId = await store.userByPhone(phone);
  if (!userId) {
    const probe = parseMessage(msg.text, { wallets: [], categories: [], today: today.date });
    if (probe.kind === 'link') {
      const id = await store.linkWithCode(probe.code, phone);
      return id ? T.id.linked + '\n\n' + T.en.linked : `${T.id.badCode}\n${T.en.badCode}`;
    }
    return `${T.id.notLinked}\n\n${T.en.notLinked}`;
  }

  const ctx = await store.context(userId);
  const L = T[ctx.language];
  const intent = parseMessage(msg.text, { wallets: ctx.wallets, categories: ctx.categories, today: today.date });
  return reply(intent, ctx, L, store, today, userId);
}

async function reply(intent: Intent, ctx: UserCtx, L: (typeof T)['id'] | (typeof T)['en'], store: Store, today: ReturnType<typeof wib>, userId: string): Promise<string> {
  const lang = ctx.language;
  const active = ctx.wallets.filter((w) => !w.archived);
  const when = (date: string) => `${date}T${date === today.date ? today.time : '12:00'}`;
  const MAX = 10_000_000_000; // Rp 10 miliar per message

  switch (intent.kind) {
    case 'help': return L.help;
    case 'link': return L.linked;
    case 'unknown':
      switch (intent.reason) {
        case 'no-amount': return L.noAmount;
        case 'ambiguous-amount': return L.ambiguous;
        case 'transfer-wallets': return L.transferWallets;
        case 'unknown-wallet': return fill(L.unknownWallet, { list: active.map((w) => w.name).join(', ') });
        default: return L.help;
      }
    case 'undo': {
      if (!ctx.lastTxId) return L.nothingToUndo;
      const gone = await store.deleteTransaction(userId, ctx.lastTxId);
      await store.setLast(userId, { txId: null });
      return gone ? fill(L.undone, { what: `${gone.description || gone.type} ${fmt(gone.amount, gone.currency, lang)}` }) : L.nothingToUndo;
    }
    case 'balance': {
      const rows = (await store.balances(userId)).filter((r) => !r.wallet.archived);
      if (!rows.length) return L.noWallet;
      const lines = rows.map((r) => `• ${r.wallet.name}: ${fmt(r.balance, r.wallet.currency, lang)}`);
      const same = rows.filter((r) => r.wallet.currency === ctx.currency);
      const sum = same.reduce((s, r) => s + r.balance, 0);
      return `*${L.balances}*\n${lines.join('\n')}\n\n*${L.total}${same.length < rows.length ? ` (${ctx.currency})` : ''}:* ${fmt(sum, ctx.currency, lang)}`;
    }
    case 'today':
    case 'month': {
      const from = intent.kind === 'today' ? today.date : `${today.y}-${pad(today.m)}-01`;
      const to = intent.kind === 'today' ? today.date : `${today.y}-${pad(today.m)}-${pad(new Date(today.y, today.m, 0).getDate())}`;
      const totals = await store.totals(userId, from, to);
      const cur = Object.keys(totals);
      if (!cur.length) return `*${intent.kind === 'today' ? L.today : L.month}*\n${L.noData}`;
      return `*${intent.kind === 'today' ? L.today : L.month}*\n` + cur.map((c) => `${L.totalIn}: ${fmt(totals[c].income, c, lang)}\n${L.totalOut}: ${fmt(totals[c].expense, c, lang)}\n${L.net}: ${fmt(totals[c].income - totals[c].expense, c, lang)}`).join('\n\n');
    }
    case 'budget': {
      const from = `${today.y}-${pad(today.m)}-01`, to = `${today.y}-${pad(today.m)}-${pad(new Date(today.y, today.m, 0).getDate())}`;
      const rows = await store.budgets(userId, from, to);
      if (!rows.length) return L.noBudget;
      return `*${L.budgetTitle}*\n` + rows.map((r) => `${r.spent > r.limit ? '🔴' : r.spent >= r.limit * 0.8 ? '🟠' : '🟢'} ${r.label}: ${fmt(r.spent, r.currency, lang)} / ${fmt(r.limit, r.currency, lang)} (${Math.round((r.spent / r.limit) * 100)}%)`).join('\n');
    }
    case 'transfer': {
      const from = ctx.wallets.find((w) => w.id === intent.fromId)!, to = ctx.wallets.find((w) => w.id === intent.toId)!;
      if (from.currency !== to.currency) return L.crossCurrency;
      if (intent.amount > MAX) return L.tooBig;
      const id = await store.addTransaction(userId, { type: 'transfer', walletId: from.id, toWalletId: to.id, amount: intent.amount * 100, toAmount: intent.amount * 100, occurredAt: when(intent.date), description: intent.description });
      await store.setLast(userId, { txId: id, walletId: from.id });
      return `✅ ${L.transfer} ${fmt(intent.amount * 100, from.currency, lang)}\n${from.name} → ${to.name}\n\n${L.undoHint}`;
    }
    case 'transaction': {
      if (!active.length) return L.noWallet;
      if (intent.amount > MAX) return L.tooBig;
      const wallet = active.find((w) => w.id === intent.walletId) ?? active.find((w) => w.id === ctx.lastWalletId) ?? active[0];
      const cat = ctx.categories.find((c) => c.id === intent.categoryId) ?? ctx.categories.find((c) => c.type === intent.type);
      if (!cat) return L.noCategory;
      const desc = intent.description || catLabel(cat, lang);
      const id = await store.addTransaction(userId, { type: intent.type, walletId: wallet.id, categoryId: cat.id, amount: intent.amount * 100, occurredAt: when(intent.date), description: desc.slice(0, 120) });
      await store.setLast(userId, { txId: id, walletId: wallet.id });
      const bal = (await store.balances(userId)).find((r) => r.wallet.id === wallet.id);
      const dateNote = intent.date === today.date ? '' : ` (${intent.date})`;
      return `✅ ${intent.type === 'income' ? L.income : L.expense} ${fmt(intent.amount * 100, wallet.currency, lang)}${dateNote}\n${catLabel(cat, lang)} · ${wallet.name}\n_${desc}_${bal ? `\n${fill(L.balanceOf, { w: wallet.name })}: ${fmt(bal.balance, wallet.currency, lang)}` : ''}\n\n${L.undoHint}`;
    }
  }
}
