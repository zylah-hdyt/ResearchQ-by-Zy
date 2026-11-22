import type { Category } from './types';

/** Built-in categories; labels come from i18n `category.<key>`. */
export const DEFAULT_CATEGORIES: Omit<Category, 'userId'>[] = [
  { id: 'cat_salary', key: 'salary', type: 'income', color: '#15803d' },
  { id: 'cat_bonus', key: 'bonus', type: 'income', color: '#16a34a' },
  { id: 'cat_business', key: 'business', type: 'income', color: '#0d9488' },
  { id: 'cat_investment', key: 'investment', type: 'income', color: '#0891b2' },
  { id: 'cat_gift_in', key: 'giftIn', type: 'income', color: '#65a30d' },
  { id: 'cat_other_in', key: 'otherIncome', type: 'income', color: '#4d7c0f' },
  { id: 'cat_food', key: 'food', type: 'expense', color: '#ea580c' },
  { id: 'cat_groceries', key: 'groceries', type: 'expense', color: '#d97706' },
  { id: 'cat_transport', key: 'transport', type: 'expense', color: '#2563eb' },
  { id: 'cat_housing', key: 'housing', type: 'expense', color: '#7c3aed' },
  { id: 'cat_utilities', key: 'utilities', type: 'expense', color: '#0284c7' },
  { id: 'cat_shopping', key: 'shopping', type: 'expense', color: '#db2777' },
  { id: 'cat_health', key: 'health', type: 'expense', color: '#dc2626' },
  { id: 'cat_education', key: 'education', type: 'expense', color: '#4f46e5' },
  { id: 'cat_entertainment', key: 'entertainment', type: 'expense', color: '#c026d3' },
  { id: 'cat_bills', key: 'bills', type: 'expense', color: '#475569' },
  { id: 'cat_other_out', key: 'otherExpense', type: 'expense', color: '#78716c' },
];
