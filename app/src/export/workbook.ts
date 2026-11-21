import type ExcelJSType from 'exceljs';
import type { Workbook, Worksheet, Cell } from 'exceljs';
import type { CurrencyCode, TxType } from '../data/types';
import { categoryLabel, translator, type TFn } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { parseLocal } from '../lib/format';
import type { ExportDataset, ExportRow } from './dataset';

const SYMBOL: Record<CurrencyCode, string> = { IDR: 'Rp', USD: '$', EUR: '€', SGD: 'S$', MYR: 'RM', JPY: '¥', GBP: '£', AUD: 'A$' };
const DIGITS = (c: CurrencyCode) => (c === 'IDR' || c === 'JPY' ? 0 : 2);

/** e.g. "Rp" #,##0;[Red]-"Rp" #,##0 — negatives in red. */
export function currencyFormat(c: CurrencyCode): string {
  const n = DIGITS(c) ? '#,##0.00' : '#,##0';
  const s = `"${SYMBOL[c]} "`;
  return `${s}${n};[Red]-${s}${n};${s}0`;
}

const COLORS = {
  brand: 'FF0F766E',
  header: 'FF0F3D3A',
  headerText: 'FFFFFFFF',
  band: 'FFF1F5F4',
  totalFill: 'FFE6F2F0',
  border: 'FFD5DEDC',
  muted: 'FF5B6B68',
  good: 'FFDCFCE7',
  goodText: 'FF166534',
  warn: 'FFFEF3C7',
  warnText: 'FF92400E',
  bad: 'FFFEE2E2',
  badText: 'FF991B1B',
};
const FONT = 'Calibri';

/** Excel stores dates as serials without timezone; build them in UTC so the day never shifts. */
function excelDate(iso: string): Date {
  const d = parseLocal(iso);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
function excelTime(iso: string): number {
  const d = parseLocal(iso);
  return (d.getHours() * 60 + d.getMinutes()) / 1440;
}
const major = (minor: number) => Math.round(minor) / 100;

interface Col {
  key: string;
  header: MessageKey;
  width: number;
  kind?: 'date' | 'time' | 'money' | 'percent' | 'text' | 'int';
}

function styleHeader(row: ExcelJSType.Row) {
  row.height = 22;
  row.eachCell((c) => {
    c.font = { name: FONT, bold: true, color: { argb: COLORS.headerText }, size: 11 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.header } };
    c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    c.border = { bottom: { style: 'thin', color: { argb: COLORS.brand } } };
  });
}

function borderCell(c: Cell) {
  c.border = { bottom: { style: 'hair', color: { argb: COLORS.border } } };
}

/**
 * Writes a table with a bold frozen header, auto filter, banding and per-row
 * currency formats. Returns the first and last data row numbers.
 */
function writeTable(
  ws: Worksheet,
  t: TFn,
  startRow: number,
  cols: Col[],
  rows: Record<string, unknown>[],
  moneyCurrency: (r: Record<string, unknown>) => CurrencyCode,
  dateFmt: string,
  opts: { freeze?: boolean; filter?: boolean } = {},
) {
  cols.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    col.width = Math.max(col.width ?? 0, c.width);
  });
  const header = ws.getRow(startRow);
  cols.forEach((c, i) => (header.getCell(i + 1).value = t(c.header)));
  styleHeader(header);
  cols.forEach((c, i) => {
    if (c.kind === 'money' || c.kind === 'percent' || c.kind === 'int') header.getCell(i + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
  });
  rows.forEach((r, ri) => {
    const row = ws.getRow(startRow + 1 + ri);
    cols.forEach((c, ci) => {
      const cell = row.getCell(ci + 1);
      cell.value = (r[c.key] ?? null) as ExcelJSType.CellValue;
      cell.font = { name: FONT, size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: c.kind === 'text' && c.width > 30 };
      if (c.kind === 'date') cell.numFmt = dateFmt;
      if (c.kind === 'time') cell.numFmt = 'hh:mm';
      if (c.kind === 'money') {
        cell.numFmt = currencyFormat(moneyCurrency(r));
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
      if (c.kind === 'percent') cell.numFmt = '0.0%';
      if (c.kind === 'int') cell.numFmt = '#,##0';
      if (ri % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.band } };
      borderCell(cell);
    });
  });
  const last = startRow + Math.max(rows.length, 1);
  if (opts.filter) ws.autoFilter = { from: { row: startRow, column: 1 }, to: { row: startRow + Math.max(rows.length, 0), column: cols.length } };
  if (opts.freeze) ws.views = [{ state: 'frozen', ySplit: startRow, xSplit: 0, topLeftCell: `A${startRow + 1}`, activeCell: `A${startRow + 1}` }];
  return { first: startRow + 1, last: startRow + rows.length, end: last };
}

const colLetter = (n: number) => {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

/** Adds a per-currency SUMIFS total under a table — currencies are never summed together. */
function writeTotals(
  ws: Worksheet,
  t: TFn,
  atRow: number,
  labelCol: number,
  amountCol: number,
  currencyCol: number | null,
  first: number,
  last: number,
  totals: Map<CurrencyCode, number>,
) {
  let r = atRow;
  const A = colLetter(amountCol);
  const C = currencyCol ? colLetter(currencyCol) : '';
  for (const [code, value] of [...totals.entries()].sort()) {
    const row = ws.getRow(r);
    const label = row.getCell(labelCol);
    label.value = `${t('xl.total')} (${code})`;
    const cell = row.getCell(amountCol);
    const formula = last >= first
      ? currencyCol
        ? `SUMIFS(${A}${first}:${A}${last},${C}${first}:${C}${last},"${code}")`
        : `SUM(${A}${first}:${A}${last})`
      : '0';
    cell.value = { formula, result: major(value) };
    cell.numFmt = currencyFormat(code);
    row.eachCell({ includeEmpty: false }, (c) => {
      c.font = { name: FONT, bold: true, size: 10 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalFill } };
      c.border = { top: { style: 'thin', color: { argb: COLORS.brand } } };
    });
    r++;
  }
  return r;
}

function note(ws: Worksheet, row: number, text: string) {
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { name: FONT, italic: true, size: 9, color: { argb: COLORS.muted } };
}

function sumBy(rows: ExportRow[], sign: (r: ExportRow) => number = () => 1) {
  const m = new Map<CurrencyCode, number>();
  for (const r of rows) m.set(r.currency, (m.get(r.currency) ?? 0) + r.amount * sign(r));
  return m;
}

/** Build the full professional workbook. `ExcelJS` is injected so the browser can lazy-load it. */
export async function buildWorkbook(ExcelJS: typeof ExcelJSType, d: ExportDataset): Promise<Workbook> {
  const lang = d.profile.language;
  const t = translator(lang);
  const dateFmt = lang === 'id' ? 'dd/mm/yyyy' : 'yyyy-mm-dd';
  const typeLabel = (x: TxType) => t(`tx.type.${x}` as MessageKey);
  const owner = d.profile.displayName || d.profile.fullName || d.profile.email;

  const wb = new ExcelJS.Workbook();
  wb.creator = owner;
  wb.created = new Date();
  wb.title = t('xl.title');

  // ---------- Sheet 1: Financial Summary ----------
  const s = wb.addWorksheet(t('xl.sheet.summary'), { properties: { tabColor: { argb: COLORS.brand } } });
  s.getColumn(1).width = 30;
  for (let i = 2; i <= 7; i++) s.getColumn(i).width = 20;
  s.getCell('A1').value = t('xl.title');
  s.getCell('A1').font = { name: FONT, size: 18, bold: true, color: { argb: COLORS.header } };
  s.getRow(1).height = 28;
  const meta: [MessageKey, string | Date][] = [
    ['xl.preparedFor', `${d.profile.fullName || owner} <${d.profile.email}>`],
    ['xl.period', `${d.options.range.from}  →  ${d.options.range.to}`],
    ['xl.generated', new Date().toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')],
    ['xl.currencyMode', d.options.currency === 'original' ? t('export.currency.original') : t('export.currency.convert', { code: d.options.currency })],
    ['xl.filters', describeFilters(d, t)],
  ];
  meta.forEach(([k, v], i) => {
    const r = s.getRow(3 + i);
    r.getCell(1).value = t(k);
    r.getCell(1).font = { name: FONT, bold: true, size: 10, color: { argb: COLORS.muted } };
    r.getCell(2).value = v as string;
    r.getCell(2).font = { name: FONT, size: 10 };
    s.mergeCells(3 + i, 2, 3 + i, 6);
  });

  let row = 9;
  const head = s.getRow(row);
  head.getCell(1).value = t('xl.metric');
  d.blocks.forEach((b, i) => (head.getCell(2 + i).value = b.currency));
  styleHeader(head);
  const metrics: [MessageKey, (b: (typeof d.blocks)[number]) => number | null][] = [
    ['xl.totalIncome', (b) => b.income],
    ['xl.totalExpenses', (b) => b.expense],
    ['xl.netCashflow', (b) => b.net],
    ['xl.openingBalance', (b) => b.opening],
    ['xl.closingBalance', (b) => b.closing],
  ];
  for (const [k, get] of metrics) {
    row++;
    const r = s.getRow(row);
    r.getCell(1).value = t(k);
    r.getCell(1).font = { name: FONT, size: 11, bold: k === 'xl.netCashflow' || k === 'xl.closingBalance' };
    d.blocks.forEach((b, i) => {
      const c = r.getCell(2 + i);
      const v = get(b);
      c.value = v == null ? t('xl.na') : major(v);
      c.numFmt = currencyFormat(b.currency);
      c.alignment = { horizontal: 'right' };
      c.font = { name: FONT, size: 11, bold: k === 'xl.netCashflow' || k === 'xl.closingBalance' };
    });
    r.eachCell((c) => borderCell(c));
    if (k === 'xl.netCashflow') r.eachCell((c) => (c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalFill } }));
  }
  row += 2;
  note(s, row++, t('xl.transfersNote'));
  if (d.blocks.length > 1) note(s, row++, t('xl.multiCurrencyNote'));
  if (d.options.currency !== 'original') note(s, row++, t('xl.convertedNote', { code: d.options.currency }));
  if (!d.balancesApplicable) note(s, row++, t('xl.balanceNote'));
  if (d.missingRates.length) note(s, row++, t('export.missingRates', { codes: d.missingRates.join(', ') }));

  // Category summary
  row += 1;
  s.getCell(row, 1).value = t('xl.categorySummary');
  s.getCell(row, 1).font = { name: FONT, size: 13, bold: true, color: { argb: COLORS.header } };
  row += 1;
  const catTable = writeTable(
    s, t, row,
    [
      { key: 'category', header: 'xl.category', width: 30, kind: 'text' },
      { key: 'type', header: 'xl.type', width: 20, kind: 'text' },
      { key: 'currency', header: 'xl.currency', width: 20, kind: 'text' },
      { key: 'amount', header: 'xl.amount', width: 20, kind: 'money' },
      { key: 'count', header: 'xl.count', width: 20, kind: 'int' },
      { key: 'share', header: 'xl.share', width: 20, kind: 'percent' },
    ],
    d.categories.map((c) => ({
      category: categoryLabel(c.category, t), type: typeLabel(c.type), currency: c.currency,
      amount: major(c.amount), count: c.count, share: c.share,
    })),
    (r) => r.currency as CurrencyCode,
    dateFmt,
  );
  if (d.categories.length) {
    s.addConditionalFormatting({
      ref: `F${catTable.first}:F${catTable.last}`,
      rules: [{ type: 'dataBar', priority: 1, minLength: 0, maxLength: 100, color: { argb: 'FF5EAAA0' }, gradient: false, cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }] } as never],
    });
  }
  row = catTable.end + 2;

  // Account balances
  s.getCell(row, 1).value = t('xl.accountSummary');
  s.getCell(row, 1).font = { name: FONT, size: 13, bold: true, color: { argb: COLORS.header } };
  row += 1;
  writeTable(
    s, t, row,
    [
      { key: 'account', header: 'xl.account', width: 30, kind: 'text' },
      { key: 'currency', header: 'xl.currency', width: 20, kind: 'text' },
      { key: 'opening', header: 'xl.openingBalance', width: 20, kind: 'money' },
      { key: 'inflow', header: 'rep.inflow', width: 20, kind: 'money' },
      { key: 'outflow', header: 'rep.outflow', width: 20, kind: 'money' },
      { key: 'closing', header: 'xl.closingBalance', width: 20, kind: 'money' },
    ],
    d.walletPeriods.map((p) => ({
      account: p.wallet.name, currency: p.currency, opening: major(p.opening),
      inflow: major(p.inflow), outflow: -major(p.outflow), closing: major(p.closing),
    })),
    (r) => r.currency as CurrencyCode,
    dateFmt,
  );

  // ---------- Sheet 2: All Transactions ----------
  const all = wb.addWorksheet(t('xl.sheet.transactions'));
  const allCols: Col[] = [
    { key: 'id', header: 'xl.txId', width: 22, kind: 'text' },
    { key: 'date', header: 'xl.date', width: 13, kind: 'date' },
    { key: 'time', header: 'xl.time', width: 8, kind: 'time' },
    { key: 'description', header: 'xl.description', width: 34, kind: 'text' },
    { key: 'type', header: 'xl.type', width: 16, kind: 'text' },
    { key: 'category', header: 'xl.category', width: 22, kind: 'text' },
    { key: 'account', header: 'xl.account', width: 28, kind: 'text' },
    { key: 'amount', header: 'xl.amount', width: 18, kind: 'money' },
    { key: 'currency', header: 'xl.currency', width: 10, kind: 'text' },
    { key: 'notes', header: 'xl.notes', width: 34, kind: 'text' },
  ];
  const allT = writeTable(
    all, t, 1, allCols,
    d.rows.map((r) => ({
      id: r.tx.id,
      date: excelDate(r.tx.occurredAt),
      time: excelTime(r.tx.occurredAt),
      description: r.tx.description,
      type: typeLabel(r.tx.type),
      category: r.tx.type === 'transfer' ? '—' : categoryLabel(r.category, t),
      account: r.tx.type === 'transfer' ? `${r.wallet?.name ?? ''} → ${r.toWallet?.name ?? ''}` : r.wallet?.name ?? '',
      amount: r.tx.type === 'expense' ? -major(r.amount) : major(r.amount),
      currency: r.currency,
      notes: r.tx.notes,
    })),
    (r) => r.currency as CurrencyCode,
    dateFmt,
    { freeze: true, filter: true },
  );
  // Net of income − expense per currency (transfers excluded).
  const allTotals = sumBy(d.rows.filter((r) => r.tx.type !== 'transfer'), (r) => (r.tx.type === 'expense' ? -1 : 1));
  if (allTotals.size) {
    const r0 = allT.end + 2;
    const last = allT.last;
    let r = r0;
    for (const [code, value] of [...allTotals.entries()].sort()) {
      const rowX = all.getRow(r);
      rowX.getCell(7).value = `${t('xl.netCashflow')} (${code})`;
      const formula = `SUMIFS(H2:H${last},I2:I${last},"${code}",E2:E${last},"<>${typeLabel('transfer')}")`;
      rowX.getCell(8).value = { formula, result: major(value) };
      rowX.getCell(8).numFmt = currencyFormat(code);
      [7, 8].forEach((ci) => {
        const c = rowX.getCell(ci);
        c.font = { name: FONT, bold: true, size: 10 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalFill } };
      });
      r++;
    }
    note(all, r + 1, t('xl.transfersNote'));
  }

  // ---------- Sheets 3 & 4: Income / Expenses ----------
  const flowSheet = (name: MessageKey, catHeader: MessageKey, rows: ExportRow[]) => {
    const ws = wb.addWorksheet(t(name));
    const cols: Col[] = [
      { key: 'date', header: 'xl.date', width: 13, kind: 'date' },
      { key: 'description', header: 'xl.description', width: 34, kind: 'text' },
      { key: 'category', header: catHeader, width: 24, kind: 'text' },
      { key: 'account', header: 'xl.account', width: 22, kind: 'text' },
      { key: 'amount', header: 'xl.amount', width: 18, kind: 'money' },
      { key: 'currency', header: 'xl.currency', width: 10, kind: 'text' },
      { key: 'notes', header: 'xl.notes', width: 34, kind: 'text' },
    ];
    const tb = writeTable(
      ws, t, 1, cols,
      rows.map((r) => ({
        date: excelDate(r.tx.occurredAt), description: r.tx.description, category: categoryLabel(r.category, t),
        account: r.wallet?.name ?? '', amount: major(r.amount), currency: r.currency, notes: r.tx.notes,
      })),
      (r) => r.currency as CurrencyCode,
      dateFmt,
      { freeze: true, filter: true },
    );
    writeTotals(ws, t, tb.end + 2, 4, 5, 6, tb.first, tb.last, sumBy(rows));
  };
  flowSheet('xl.sheet.income', 'xl.incomeCategory', d.income);
  flowSheet('xl.sheet.expenses', 'xl.expenseCategory', d.expenses);

  // ---------- Sheet 5: Transfers ----------
  const tr = wb.addWorksheet(t('xl.sheet.transfers'));
  const trT = writeTable(
    tr, t, 1,
    [
      { key: 'date', header: 'xl.date', width: 13, kind: 'date' },
      { key: 'source', header: 'xl.source', width: 24, kind: 'text' },
      { key: 'destination', header: 'xl.destination', width: 24, kind: 'text' },
      { key: 'amount', header: 'xl.amount', width: 18, kind: 'money' },
      { key: 'currency', header: 'xl.currency', width: 10, kind: 'text' },
      { key: 'received', header: 'xl.received', width: 18, kind: 'text' },
      { key: 'receivedCurrency', header: 'xl.receivedCurrency', width: 12, kind: 'text' },
      { key: 'notes', header: 'xl.notes', width: 34, kind: 'text' },
    ],
    d.transfers.map((r) => ({
      date: excelDate(r.tx.occurredAt), source: r.wallet?.name ?? '', destination: r.toWallet?.name ?? '',
      amount: major(r.amount), currency: r.currency,
      received: r.toAmount != null ? major(r.toAmount) : null, receivedCurrency: r.toCurrency ?? '',
      notes: [r.tx.description, r.tx.notes].filter(Boolean).join(' — '),
    })),
    (r) => r.currency as CurrencyCode,
    dateFmt,
    { freeze: true, filter: true },
  );
  // Received amount uses its own currency format.
  d.transfers.forEach((r, i) => {
    const c = tr.getRow(trT.first + i).getCell(6);
    if (r.toCurrency) c.numFmt = currencyFormat(r.toCurrency);
    c.alignment = { horizontal: 'right' };
  });
  const trEnd = writeTotals(tr, t, trT.end + 2, 3, 4, 5, trT.first, trT.last, sumBy(d.transfers));
  note(tr, trEnd + 1, t('xl.transfersNote'));

  // ---------- Sheet 6: Budget Report ----------
  const bu = wb.addWorksheet(t('xl.sheet.budget'));
  const statusLabel = (st: string) => t(`bud.status.${st}` as MessageKey);
  const buT = writeTable(
    bu, t, 1,
    [
      { key: 'category', header: 'xl.category', width: 26, kind: 'text' },
      { key: 'budget', header: 'xl.budgetAmount', width: 18, kind: 'money' },
      { key: 'actual', header: 'xl.actual', width: 18, kind: 'money' },
      { key: 'remaining', header: 'xl.remaining', width: 18, kind: 'money' },
      { key: 'util', header: 'xl.utilization', width: 14, kind: 'percent' },
      { key: 'status', header: 'xl.status', width: 18, kind: 'text' },
      { key: 'currency', header: 'xl.currency', width: 10, kind: 'text' },
    ],
    d.budgets.map((l) => ({
      category: categoryLabel(l.category, t), budget: major(l.limit), actual: major(l.spent),
      remaining: major(l.remaining), util: l.utilization, status: statusLabel(l.status), currency: l.currency,
    })),
    (r) => r.currency as CurrencyCode,
    dateFmt,
    { freeze: true, filter: true },
  );
  // Live formulas so edits in Excel stay consistent.
  d.budgets.forEach((l, i) => {
    const r = buT.first + i;
    bu.getCell(`D${r}`).value = { formula: `B${r}-C${r}`, result: major(l.remaining) };
    bu.getCell(`E${r}`).value = { formula: `IF(B${r}=0,0,C${r}/B${r})`, result: l.utilization };
  });
  if (d.budgets.length) {
    const ref = `A${buT.first}:G${buT.last}`;
    const top = `$F${buT.first}`;
    bu.addConditionalFormatting({
      ref,
      rules: [
        { type: 'expression', priority: 1, formulae: [`${top}="${statusLabel('exceeded')}"`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: COLORS.bad } }, font: { color: { argb: COLORS.badText } } } },
        { type: 'expression', priority: 2, formulae: [`${top}="${statusLabel('warning')}"`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: COLORS.warn } }, font: { color: { argb: COLORS.warnText } } } },
      ],
    });
    bu.addConditionalFormatting({
      ref: `E${buT.first}:E${buT.last}`,
      rules: [{ type: 'dataBar', priority: 3, minLength: 0, maxLength: 100, color: { argb: 'FF5EAAA0' }, gradient: false, cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 1 }] } as never],
    });
  }
  const bTotals = new Map<CurrencyCode, { b: number; a: number }>();
  for (const l of d.budgets) {
    const e = bTotals.get(l.currency) ?? { b: 0, a: 0 };
    e.b += l.limit;
    e.a += l.spent;
    bTotals.set(l.currency, e);
  }
  let br = buT.end + 2;
  for (const [code, v] of [...bTotals.entries()].sort()) {
    const rr = bu.getRow(br);
    const range = (col: string) => `SUMIFS(${col}${buT.first}:${col}${buT.last},G${buT.first}:G${buT.last},"${code}")`;
    rr.getCell(1).value = `${t('xl.total')} (${code})`;
    rr.getCell(2).value = { formula: range('B'), result: major(v.b) };
    rr.getCell(3).value = { formula: range('C'), result: major(v.a) };
    rr.getCell(4).value = { formula: `B${br}-C${br}`, result: major(v.b - v.a) };
    rr.getCell(5).value = { formula: `IF(B${br}=0,0,C${br}/B${br})`, result: v.b ? v.a / v.b : 0 };
    [2, 3, 4].forEach((ci) => (rr.getCell(ci).numFmt = currencyFormat(code)));
    rr.getCell(5).numFmt = '0.0%';
    rr.eachCell((c) => {
      c.font = { name: FONT, bold: true, size: 10 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalFill } };
    });
    br++;
  }
  note(bu, br + 1, t('xl.budgetNote'));

  // Print setup for every sheet.
  wb.eachSheet((ws) => {
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  });
  return wb;
}

function describeFilters(d: ExportDataset, t: TFn): string {
  const o = d.options;
  const parts: string[] = [];
  parts.push(`${t('export.txType')}: ${o.type === 'all' ? t('common.all') : t(`tx.type.${o.type}` as MessageKey)}`);
  const cat = o.categoryId === 'all' ? t('common.all') : categoryLabel(d.categories.find((c) => c.category?.id === o.categoryId)?.category, t);
  parts.push(`${t('export.category')}: ${o.categoryId === 'all' ? t('common.all') : cat}`);
  const w = o.walletId === 'all' ? t('common.all') : d.walletPeriods.find((p) => p.wallet.id === o.walletId)?.wallet.name ?? '';
  parts.push(`${t('export.wallet')}: ${w}`);
  return parts.join(' · ');
}

/** CSV of all transactions (UTF-8 with BOM so Excel opens it with the right encoding). */
export function buildCsv(d: ExportDataset): string {
  const t = translator(d.profile.language);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ['xl.txId', 'xl.date', 'xl.time', 'xl.description', 'xl.type', 'xl.category', 'xl.account', 'xl.amount', 'xl.currency', 'xl.notes'] as MessageKey[];
  const lines = [header.map((h) => esc(t(h))).join(',')];
  for (const r of d.rows) {
    const [date, time] = r.tx.occurredAt.split('T');
    lines.push([
      r.tx.id, date, time ?? '', r.tx.description, t(`tx.type.${r.tx.type}` as MessageKey),
      r.tx.type === 'transfer' ? '' : categoryLabel(r.category, t),
      r.tx.type === 'transfer' ? `${r.wallet?.name} -> ${r.toWallet?.name}` : r.wallet?.name,
      (r.tx.type === 'expense' ? -r.amount : r.amount) / 100, r.currency, r.tx.notes,
    ].map(esc).join(','));
  }
  return '﻿' + lines.join('\r\n');
}
