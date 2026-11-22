/**
 * Domain model. All monetary amounts are stored as integers in minor units
 * (1/100 of the currency unit) to avoid floating point drift.
 */

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR' | 'JPY' | 'GBP' | 'AUD';
export const CURRENCIES: CurrencyCode[] = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'GBP', 'AUD'];

export type Language = 'id' | 'en';
export type ThemePref = 'system' | 'light' | 'dark';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  /** Data URL of a resized profile photo, or null to use the initials avatar. */
  avatarDataUrl: string | null;
  phone: string;
  country: string;
  dateOfBirth: string;
  preferredCurrency: CurrencyCode;
  language: Language;
  theme: ThemePref;
  weekStartsOn: 0 | 1;
  budgetAlerts: boolean;
  updatedAt: string;
  createdAt?: string;
  /** Version of the Terms / Privacy Policy the user accepted, and when. */
  termsVersion?: string;
  termsAcceptedAt?: string;
}

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'credit' | 'savings' | 'investment';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  currency: CurrencyCode;
  /** Balance at the moment the wallet was created (minor units). */
  initialBalance: number;
  color: string;
  archived: boolean;
  createdAt: string;
}

export type TxType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: string;
  userId: string;
  /** Built-in categories carry a translation key; custom ones carry a name. */
  key?: string;
  name?: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  /** For income/expense: the wallet. For transfers: the source wallet. */
  walletId: string;
  /** Transfers only: destination wallet. */
  toWalletId?: string;
  /** Income/expense only. */
  categoryId?: string;
  /** Amount in the currency of `walletId` (minor units, always positive). */
  amount: number;
  /** Transfers only: amount received in the destination wallet currency. */
  toAmount?: number;
  /** ISO local date-time, e.g. 2026-11-21T08:30 */
  occurredAt: string;
  description: string;
  notes: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  /** Monthly limit, minor units, in `currency`. */
  amount: number;
  currency: CurrencyCode;
  createdAt: string;
}

/** Rates expressed as: 1 unit of `code` = `rate` units of the profile's preferred currency. */
export interface ExchangeRate {
  code: CurrencyCode;
  rate: number;
}

export interface UserData {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  rates: ExchangeRate[];
  readNotifications: string[];
}
