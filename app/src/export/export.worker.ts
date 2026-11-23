/// <reference lib="webworker" />
import type { ExportDataset } from './dataset';
import { buildFile } from './build';

/** Generates the workbook off the main thread so the page stays responsive on large exports. */
self.onmessage = async (e: MessageEvent<ExportDataset>) => {
  try {
    const f = await buildFile(e.data);
    (self as unknown as Worker).postMessage({ ok: true, ...f }, [f.bytes]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, message: err instanceof Error ? err.message : String(err) });
  }
};
