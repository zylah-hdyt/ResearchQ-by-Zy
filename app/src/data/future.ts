/**
 * Domain types for modules that are prepared but not implemented. They follow the same rules as the core model:
 * integer minor units, ISO local dates, one `userId` owner (Row Level Security in Postgres).
 * Nothing imports this file yet; it fixes the shapes so the later work cannot drift from the schema in
 * docs/FEATURE_ARCHITECTURE.md.
 */
import type { CurrencyCode } from './types';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  currency: CurrencyCode;
  /** Target amount, minor units. */
  targetAmount: number;
  /** Optional deadline, YYYY-MM-DD. */
  targetDate?: string;
  /** Wallet whose balance counts as progress; when absent, contributions are tracked on their own. */
  walletId?: string;
  archived: boolean;
  createdAt: string;
}

/** A manual or transfer-linked contribution towards a goal. Progress = Σ contributions (or the linked wallet balance). */
export interface GoalContribution {
  id: string;
  userId: string;
  goalId: string;
  amount: number;
  occurredAt: string;
  /** Set when the contribution came from a transfer, so it is never counted twice. */
  transactionId?: string;
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  cycle: BillingCycle;
  /** Next charge date, YYYY-MM-DD. */
  nextDueAt: string;
  categoryId?: string;
  walletId?: string;
  active: boolean;
  createdAt: string;
}

export type CalendarEventKind = 'subscription' | 'goal' | 'budgetReset' | 'custom';

/** A dated entry on the financial calendar. Derived from other records where possible; only `custom` is stored. */
export interface CalendarEvent {
  date: string;
  kind: CalendarEventKind;
  title: string;
  amount?: number;
  currency?: CurrencyCode;
  sourceId?: string;
}

export interface ReceiptScan {
  id: string;
  userId: string;
  status: 'pending' | 'parsed' | 'confirmed' | 'discarded';
  /** What the parser proposed; the user always confirms before a transaction is created. */
  suggestion?: { amount?: number; currency?: CurrencyCode; occurredAt?: string; merchant?: string; categoryId?: string };
  transactionId?: string;
  createdAt: string;
}
