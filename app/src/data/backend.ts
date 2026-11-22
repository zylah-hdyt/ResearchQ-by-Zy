import type { UserData } from './types';

/** Persistence for a signed-in user's financial data. */
export interface DataBackend {
  load(userId: string): Promise<UserData>;
  /** Persist the change from `prev` to `next`. Rejects if the change could not be saved. */
  save(userId: string, prev: UserData, next: UserData): Promise<void>;
}
