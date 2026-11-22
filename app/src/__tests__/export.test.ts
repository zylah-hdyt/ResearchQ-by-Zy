import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { fixture, profile } from './fixtures';
import { buildDataset, type ExportOptions } from '../export/dataset';
import { buildWorkbook, buildCsv } from '../export/workbook';
import { writeFileSync, mkdirSync } from 'node:fs';

const opts: ExportOptions = { range: { from: '2026-11-01', to: '2026-11-30' }, type: 'all', categoryId: 'all', walletId: 'all', currency: 'original', format: 'xlsx' };

describe('export dataset', () => {
  it('respects range, dedupes and only exports own data', () => {
    const d = buildDataset(fixture(), profile, opts);
    const ids = d.rows.map((r) => r.tx.id);
    expect(ids).toEqual(['t1', 't2', 't3', 't4', 't5', 't6']);
    expect(ids).not.toContain('foreign');
    expect(ids).not.toContain('t7');
  });

  it('per-currency summary with balances', () => {
    const d = buildDataset(fixture(), profile, opts);
    const idr = d.blocks.find((b) => b.currency === 'IDR')!;
    expect(idr.income).toBe(10_000_000_00);
    expect(idr.expense).toBe(300_000_00);
    expect(idr.opening).toBe(1_500_000_00 + 100_000_00);
    expect(idr.closing).toBe(idr.opening! + idr.net - 1_600_000_00); // cross-currency transfer leaves IDR
    const usd = d.blocks.find((b) => b.currency === 'USD')!;
    expect(usd.opening).toBe(100_00);
    expect(usd.closing).toBe(100_00 + 100_00 - 20_00);
  });

  it('converts when a target currency is chosen', () => {
    const d = buildDataset(fixture(), profile, { ...opts, currency: 'IDR' });
    expect(d.blocks).toHaveLength(1);
    expect(d.blocks[0].expense).toBe(300_000_00 + 320_000_00);
    expect(d.missingRates).toEqual([]);
  });

  it('hides balances when filtered by type', () => {
    const d = buildDataset(fixture(), profile, { ...opts, type: 'expense' });
    expect(d.balancesApplicable).toBe(false);
    expect(d.rows.every((r) => r.tx.type === 'expense')).toBe(true);
  });

  it('wallet filter includes transfers in or out', () => {
    const d = buildDataset(fixture(), profile, { ...opts, walletId: 'cash' });
    expect(d.rows.map((r) => r.tx.id)).toEqual(['t3', 't4']);
  });
});

describe('workbook', () => {
  it('builds six formatted sheets', async () => {
    for (const lang of ['en', 'id'] as const) {
      const d = buildDataset(fixture(), { ...profile, language: lang }, opts);
      const wb = await buildWorkbook(ExcelJS, d);
      const buf = await wb.xlsx.writeBuffer();
      mkdirSync('test-output', { recursive: true });
      writeFileSync(`test-output/sample-${lang}.xlsx`, Buffer.from(buf));
      const back = new ExcelJS.Workbook();
      await back.xlsx.load(buf);
      expect(back.worksheets.map((w) => w.name)).toHaveLength(6);
      const all = back.worksheets[1];
      expect(all.getRow(1).getCell(1).font?.bold).toBe(true);
      expect(all.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
      expect(all.autoFilter).toBeTruthy();
      expect(all.getRow(3).getCell(8).value).toBe(-250000); // expense negative
      expect(String(all.getRow(3).getCell(8).numFmt)).toContain('[Red]');
    }
  });

  it('csv contains header and rows', () => {
    const csv = buildCsv(buildDataset(fixture(), profile, opts));
    expect(csv.split('\r\n')).toHaveLength(7);
  });
});
