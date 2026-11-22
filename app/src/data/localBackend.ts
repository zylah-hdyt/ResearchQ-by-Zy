import type { DataBackend } from './backend';
import { storage } from './storage';

export const localBackend: DataBackend = {
  // Budgets saved before weekly budgets existed have no period: they are monthly.
  load: async (userId) => { const d = storage.getData(userId); return { ...d, budgets: d.budgets.map((b) => ({ ...b, period: b.period ?? 'monthly' })) }; },
  save: async (userId, _prev, next) => storage.saveData(userId, next),
};
