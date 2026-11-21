import type { Profile, UserData } from '../data/types';
import { budgetLines, dedupe, monthRange } from './finance';
import type { BudgetLine } from './finance';

export interface AppNotification {
  id: string;
  kind: 'budgetWarning' | 'budgetExceeded' | 'welcome';
  line?: BudgetLine;
}

/** Notifications derived from the user's own data for the current month. */
export function deriveNotifications(data: UserData, profile: Profile, now = new Date()): AppNotification[] {
  const out: AppNotification[] = [];
  const month = monthRange(now);
  if (data.wallets.length === 0) out.push({ id: `welcome`, kind: 'welcome' });
  if (profile.budgetAlerts) {
    for (const l of budgetLines(data.budgets, data.categories, dedupe(data.transactions), data.wallets, month, profile.preferredCurrency, data.rates)) {
      if (l.status === 'exceeded') out.push({ id: `bx:${l.budget.id}:${month.from}`, kind: 'budgetExceeded', line: l });
      else if (l.status === 'warning') out.push({ id: `bw:${l.budget.id}:${month.from}`, kind: 'budgetWarning', line: l });
    }
  }
  return out;
}
