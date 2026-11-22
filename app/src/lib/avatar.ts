/** Up to two initials from a name; falls back to the email's first letter. */
export function initialsOf(name: string, fallback = '?'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback.charAt(0).toUpperCase() || '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = ['#0f766e', '#1d4ed8', '#7c3aed', '#be185d', '#b45309', '#15803d', '#0369a1', '#4338ca'];

/** Deterministic, calm background colour for an initials avatar. */
export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Resize an uploaded image to a square JPEG data URL (browser only). */
export async function resizeImage(file: File, size = 256): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not-image');
  if (file.size > 8 * 1024 * 1024) throw new Error('too-large');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('not-image'));
      i.src = url;
    });
    const s = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}
