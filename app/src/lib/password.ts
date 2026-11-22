const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

export function newSalt(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return toHex(b.buffer);
}

/** PBKDF2-SHA256, 150k iterations. */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 150_000 },
    key,
    256,
  );
  return toHex(bits);
}
