export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** True when the device can hand a file to the native share sheet (most mobile browsers). */
export function canShareFile(blob: Blob, filename: string): boolean {
  try {
    const file = new File([blob], filename, { type: blob.type });
    return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/** Opens the native share sheet (Save to Files, Drive, WhatsApp, email…). Returns false if unavailable or cancelled. */
export async function shareFile(blob: Blob, filename: string, title: string): Promise<boolean> {
  if (!canShareFile(blob, filename)) return false;
  try {
    await navigator.share({ files: [new File([blob], filename, { type: blob.type })], title });
    return true;
  } catch {
    return false;
  }
}
