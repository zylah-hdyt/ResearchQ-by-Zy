import type { Profile, UserData } from '../data/types';
import { dedupe } from './finance';
import { budgetRows, spanFor, type BudgetRow } from './budget';
import { toLocalDate } from './format';

export interface AppNotification {
  id: string;
  kind: 'budgetWarning' | 'budgetExceeded' | 'welcome';
  line?: BudgetRow;
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
  return out;
}
