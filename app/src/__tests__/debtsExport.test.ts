import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { fixture, profile } from './fixtures';
import { buildDataset, type ExportOptions } from '../export/dataset';
import { buildWorkbook } from '../export/workbook';
import { deriveNotifications } from '../lib/notifications';
import { DEFAULT_CATEGORIES } from '../data/seed';
import type { Transaction, UserData } from '../data/types';

const opts: ExportOptions = { range: { from: '2026-11-01', to: '2026-11-30' }, type: 'all', categoryId: 'all', walletId: 'all', currency: 'original', format: 'xlsx' };

function withBizAndDebts(): UserData {
  const d = fixture();
  const uid = profile.userId;
  const w = d.wallets.find((x) => x.userId === uid && x.currency === 'IDR')!;
  const have = new Set(d.categories.map((c) => c.id));
  d.categories = [...d.categories, ...DEFAULT_CATEGORIES.filter((c) => !have.has(c.id)).map((c) => ({ ...c, userId: uid }))];
  const tx = (id: string, categoryId: string, type: 'income' | 'expense', amount: number, description: string, occurredAt: string, notes = ''): Transaction =>
    ({ id, userId: uid, type, walletId: w.id, categoryId, amount, description, notes, occurredAt, createdAt: '' });
  d.transactions = [...d.transactions,
    tx('b1', 'cat_sales', 'income', 2_000_000_00, 'Jual', '2026-11-05T10:00'),
    tx('b2', 'cat_stock', 'expense', 1_200_000_00, 'Stok', '2026-11-06T10:00'),
    tx('d1', 'cat_loan_in', 'income', 1_000_000_00, 'Budi', '2026-10-01T10:00', 'Jatuh tempo: 2026-11-20'),
    tx('d2', 'cat_debt_paid', 'expense', 400_000_00, 'Budi', '2026-11-02T10:00'),
    tx('d3', 'cat_loan_out', 'expense', 300_000_00, 'Rina', '2026-11-03T10:00', 'Jatuh tempo: 2026-11-26'),
    tx('d4', 'cat_loan_out', 'expense', 100_000_00, 'Sari', '2026-11-03T10:00', 'Jatuh tempo: 2026-11-10'),
    tx('d5', 'cat_debt_collected', 'income', 100_000_00, 'Sari', '2026-11-08T10:00'),
  ];
  return d;
}

describe('debts & business in the export', () => {
  it('dataset carries debts as of the range end and business per month', () => {
    const d = buildDataset(withBizAndDebts(), profile, opts);
    const budi = d.debts.find((x) => x.name === 'Budi')!;
    expect([budi.side, budi.principal, budi.paid, budi.remaining, budi.due]).toEqual(['owe', 1_000_000_00, 400_000_00, 600_000_00, '2026-11-20']);
    expect(d.debts.find((x) => x.name === 'Sari')!.remaining).toBe(0);
    expect(d.business).toEqual([{ month: '2026-11', sales: 2_000_000_00, cost: 1_200_000_00, profit: 800_000_00 }]);
  });

  it('workbook gets the two extra sheets with live formulas', async () => {
    const wb = await buildWorkbook(ExcelJS, buildDataset(withBizAndDebts(), profile, opts));
    const names = wb.worksheets.map((s) => s.name);
    expect(names).toContain('Debts & Receivables');
    expect(names).toContain('Business');
    const debts = wb.getWorksheet('Debts & Receivables')!;
    const rows: unknown[][] = [];
    debts.eachRow((r) => rows.push(r.values as unknown[]));
    const budiRow = rows.find((r) => r.includes('Budi'))!;
    expect(budiRow).toContain(1_000_000);
    expect((budiRow.find((v) => typeof v === 'object' && v && 'formula' in (v as object)) as { result: number }).result).toBe(600_000);
  });

  it('plain data adds no extra sheets', async () => {
    const wb = await buildWorkbook(ExcelJS, buildDataset(fixture(), profile, opts));
    expect(wb.worksheets.map((s) => s.name)).not.toContain('Debts & Receivables');
  });

  it('notifies about due-soon and overdue balances only while open', () => {
    const p = { ...profile, budgetAlerts: false };
    const n = deriveNotifications(withBizAndDebts(), p, new Date(2026, 10, 24, 9));
    const debt = n.filter((x) => x.kind === 'debtDue' || x.kind === 'debtOverdue').map((x) => [x.kind, x.debt!.name]);
    expect(debt).toEqual([['debtOverdue', 'Budi'], ['debtDue', 'Rina']]);
  });
});
