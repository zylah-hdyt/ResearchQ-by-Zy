import type { ExportDataset } from './dataset';
import { buildFile, type BuiltFile } from './build';

type WorkerReply = ({ ok: true } & BuiltFile) | { ok: false; message: string };

function inWorker(d: ExportDataset): Promise<BuiltFile> {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('./export.worker.ts', import.meta.url), { type: 'module' });
    const done = () => w.terminate();
    w.onmessage = (e: MessageEvent<WorkerReply>) => { done(); if (e.data.ok) resolve(e.data); else reject(new Error(e.data.message)); };
    w.onerror = (e) => { done(); reject(new Error(e.message || 'worker failed')); };
    w.postMessage(d);
  });
}

/**
 * Generates the export file. Uses a Web Worker when available (keeps the UI responsive on large exports) and falls back
 * to the main thread if the worker cannot start. ExcelJS is loaded lazily either way.
 */
export async function generateFile(d: ExportDataset): Promise<{ blob: Blob; filename: string }> {
  let f: BuiltFile;
  if (typeof Worker !== 'undefined') {
    try { f = await inWorker(d); } catch (e) { console.warn('export worker unavailable, using main thread', e); f = await buildFile(d); }
  } else f = await buildFile(d);
  return { blob: new Blob([f.bytes], { type: f.type }), filename: f.filename };
}
