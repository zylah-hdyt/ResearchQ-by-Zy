import { describe, expect, it } from 'vitest';
import { composeNotes, debtLedger, dueOf, noteWithoutDue } from '../lib/debts';
import { DEFAULT_CATEGORIES } from '../data/seed';
import type { Transaction, Wallet } from '../data/types';

const cats = DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: 'u' }));
const w: Wallet = { id: 'w1', userId: 'u', name: 'Kas', type: 'cash', currency: 'IDR', initialBalance: 0, color: '#000', archived: false, createdAt: '' };
let n = 0;
const tx = (categoryId: string, amount: number, description: string, occurredAt: string, notes = ''): Transaction => ({
  id: 't' + n++, userId: 'u', type: ['cat_loan_in', 'cat_debt_collected'].includes(categoryId) ? 'income' : 'expense', walletId: 'w1', categoryId, amount, description, notes, occurredAt, createdAt: '',
});

describe('debts', () => {
  it('due date lives in a readable notes line in either language', () => {
    expect(composeNotes('2026-12-31', 'beli motor', 'id')).toBe('Jatuh tempo: 2026-12-31\nbeli motor');
    expect(dueOf('Due: 2027-01-05\nx')).toBe('2027-01-05');
    expect(noteWithoutDue('Jatuh tempo: 2026-12-31\nbeli motor')).toBe('beli motor');
    expect(dueOf('nothing here')).toBeNull();
  });

  it('groups by person (case and spacing ignored) and side, tracks paid and remaining', () => {
    const txs = [
      tx('cat_loan_in', 1_000_000_00, 'Budi', '2026-10-01T10:00', 'Jatuh tempo: 2026-12-01'),
      tx('cat_debt_paid', 300_000_00, ' budi ', '2026-10-15T10:00'),
      tx('cat_loan_out', 500_000_00, 'Rina', '2026-11-01T10:00'),
      tx('cat_debt_collected', 500_000_00, 'Rina', '2026-11-10T10:00'),
      tx('cat_food', 50_000_00, 'Budi', '2026-11-11T10:00'),
    ];
    const { entries } = debtLedger(txs, [w], cats, 'IDR', []);
    const budi = entries.find((e) => e.name === 'Budi')!;
    expect(budi.side).toBe('owe');
    expect([budi.principal, budi.paid, budi.remaining]).toEqual([1_000_000_00, 300_000_00, 700_000_00]);
    expect(budi.due).toBe('2026-12-01');
    expect(budi.items).toHaveLength(2);
    const rina = entries.find((e) => e.name === 'Rina')!;
    expect([rina.side, rina.remaining]).toEqual(['owed', 0]);
    expect(entries[0].name).toBe('Budi'); // open entries first
  });

  it('never reports a negative remaining when overpaid', () => {
    const { entries } = debtLedger([tx('cat_loan_out', 100, 'A', '2026-01-01T00:00'), tx('cat_debt_collected', 150, 'A', '2026-01-02T00:00')], [w], cats, 'IDR', []);
    expect(entries[0].remaining).toBe(0);
  });
});
