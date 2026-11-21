import type { Profile, UserAccount, UserData } from './types';
import { DEFAULT_CATEGORIES } from './seed';

/**
 * Local persistence adapter (browser localStorage).
 * Every record is namespaced by the authenticated user id, so a user can only
 * ever read their own data. A server adapter (Postgres + row level security)
 * implements the same functions — see docs/DATABASE_SCHEMA.md.
 */
const NS = 'fa.v1';
const k = (...parts: string[]) => [NS, ...parts].join(':');

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  listAccounts: () => read<UserAccount[]>(k('accounts'), []),
  saveAccounts: (a: UserAccount[]) => write(k('accounts'), a),

  getSession: () => read<{ userId: string } | null>(k('session'), null),
  setSession: (s: { userId: string } | null) => (s ? write(k('session'), s) : localStorage.removeItem(k('session'))),

  getProfile: (userId: string) => read<Profile | null>(k('u', userId, 'profile'), null),
  saveProfile: (p: Profile) => write(k('u', p.userId, 'profile'), p),

  getData: (userId: string): UserData => {
    const d = read<UserData | null>(k('u', userId, 'data'), null);
    if (d) return d;
    return {
      wallets: [],
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
      transactions: [],
      budgets: [],
      rates: [],
      readNotifications: [],
    };
  },
  saveData: (userId: string, d: UserData) => write(k('u', userId, 'data'), d),

  deleteUser: (userId: string) => {
    localStorage.removeItem(k('u', userId, 'profile'));
    localStorage.removeItem(k('u', userId, 'data'));
  },
};
