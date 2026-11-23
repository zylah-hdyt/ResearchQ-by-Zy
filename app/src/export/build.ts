import type { ExportDataset } from './dataset';
import { exportFileName } from './dataset';
import { XLSX_MIME } from './share';

export interface BuiltFile { bytes: ArrayBuffer; type: string; filename: string }

/** Builds the file bytes. Runs inside the export worker, or on the main thread as a fallback. */
export async function buildFile(d: ExportDataset): Promise<BuiltFile> {
  if (d.options.format === 'csv') {
    const { buildCsv } = await import('./workbook');
    const bytes = new TextEncoder().encode(buildCsv(d)).buffer as ArrayBuffer;
    return { bytes, type: 'text/csv;charset=utf-8', filename: exportFileName(d, 'csv') };
  }
  const [{ default: ExcelJS }, { buildWorkbook }] = await Promise.all([import('exceljs'), import('./workbook')]);
  const wb = await buildWorkbook(ExcelJS, d);
  return { bytes: toArrayBuffer(await wb.xlsx.writeBuffer()), type: XLSX_MIME, filename: exportFileName(d, 'xlsx') };
}

/** ExcelJS returns a Uint8Array/Buffer in browsers; workers can only transfer a plain ArrayBuffer of exactly the file bytes. */
function toArrayBuffer(buf: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (buf instanceof ArrayBuffer) return buf;
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength).slice().buffer as ArrayBuffer;
}
