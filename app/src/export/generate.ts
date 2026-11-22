import type { ExportDataset } from './dataset';
import { exportFileName } from './dataset';
import { XLSX_MIME } from './share';

/** Generates the export file in the browser. ExcelJS is loaded lazily on first use. */
export async function generateFile(d: ExportDataset): Promise<{ blob: Blob; filename: string }> {
  if (d.options.format === 'csv') {
    const { buildCsv } = await import('./workbook');
    return { blob: new Blob([buildCsv(d)], { type: 'text/csv;charset=utf-8' }), filename: exportFileName(d, 'csv') };
  }
  const [{ default: ExcelJS }, { buildWorkbook }] = await Promise.all([import('exceljs'), import('./workbook')]);
  const wb = await buildWorkbook(ExcelJS, d);
  const buf = await wb.xlsx.writeBuffer();
  return { blob: new Blob([buf], { type: XLSX_MIME }), filename: exportFileName(d, 'xlsx') };
}
