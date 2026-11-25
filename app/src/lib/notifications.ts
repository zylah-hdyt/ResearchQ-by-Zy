import type { Profile, UserData } from '../data/types';
import { dedupe } from './finance';
import { budgetRows, spanFor, type BudgetRow } from './budget';
import { toLocalDate } from './format';
import { debtLedger, type DebtEntry } from './debts';
import { addDays } from './periods';

export interface AppNotification {
  id: string;
  kind: 'budgetWarning' | 'budgetExceeded' | 'welcome' | 'debtDue' | 'debtOverdue';
  line?: BudgetRow;
  debt?: Pick<DebtEntry, 'name' | 'side' | 'remaining' | 'due'>;
}

/** Notifications derived from the user's own data for the current month. */
export function deriveNotifications(data: UserData, profile: Profile, now = new Date()): AppNotification[] {
  const out: AppNotification[] = [];
  const today = toLocalDate(now);
  if (data.wallets.length === 0) out.push({ id: `welcome`, kind: 'welcome' });
  if (profile.budgetAlerts) {
    const txs = dedupe(data.transactions);
    for (const period of ['monthly', 'weekly'] as const) {
      const span = spanFor(period, today, profile.weekStartsOn);
      for (const l of budgetRows(data.budgets.filter((b) => b.period === period), data.categories, txs, data.wallets, span, profile.preferredCurrency, data.rates)) {
        if (l.status === 'exceeded') out.push({ id: `bx:${l.budget.id}:${span.from}`, kind: 'budgetExceeded', line: l });
        else if (l.status === 'warning') out.push({ id: `bw:${l.budget.id}:${span.from}`, kind: 'budgetWarning', line: l });
      }
    }
  }
  // Debts and receivables: due within 3 days, or overdue (open balance only).
  const ledger = debtLedger(dedupe(data.transactions), data.wallets, data.categories, profile.preferredCurrency, data.rates);
  const soon = addDays(today, 3);
  for (const e of ledger.entries) {
    if (e.remaining <= 0 || !e.due) continue;
    const debt = { name: e.name, side: e.side, remaining: e.remaining, due: e.due };
    if (e.due < today) out.push({ id: `do:${e.key}:${e.due}`, kind: 'debtOverdue', debt });
    else if (e.due <= soon) out.push({ id: `dd:${e.key}:${e.due}`, kind: 'debtDue', debt });
  }
  return out;
}
