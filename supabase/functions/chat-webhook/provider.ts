/**
 * The only file that knows what the WhatsApp gateway's messages look like. The database never sees the gateway's format.
 * Written for Fonnte (https://fonnte.com). The field names below follow Fonnte's documented webhook
 * (sender, message, device, member) but could not be checked against the live docs when this was written, so the
 * parser is deliberately tolerant and the Edge Function logs the raw keys of any message it cannot read.
 */

/** "0812-3456-7890" -> "6281234567890" (the database normalises again; this keeps the event id stable). */
export function normalizePhone(raw: string): string {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return d;
}

export interface Inbound { phone: string; text: string; eventId?: string }

const first = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) { const v = o[k]; if (v !== undefined && v !== null && String(v).trim() !== '') return String(v); } return undefined; };

/** Returns null for anything that must not be answered: groups, our own device, empty or non-text messages. */
export function parseInbound(body: Record<string, unknown>): Inbound | null {
  const sender = first(body, ['sender', 'from', 'phone', 'number']);
  const text = first(body, ['message', 'text', 'body']);
  if (!sender || !text) return null;
  const device = first(body, ['device']);
  if (first(body, ['member', 'group', 'isgroup']) && !/^(0|false)$/i.test(first(body, ['member', 'group', 'isgroup'])!)) return null; // group chat
  if (/@g\.us/.test(sender)) return null;
  const phone = normalizePhone(sender);
  if (!phone || (device && normalizePhone(device) === phone)) return null; // our own number
  const id = first(body, ['id', 'messageid', 'inboxid', 'message_id']);
  return { phone, text, eventId: id ? `${phone}:${id}` : undefined };
}

/** Fonnte sends form-encoded or JSON depending on the setting; accept both. */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await req.json()) as Record<string, unknown>;
  if (type.includes('form')) { const f = await req.formData(); return Object.fromEntries([...f.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : ''])); }
  const raw = await req.text();
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}

export function constantTimeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** POST https://api.fonnte.com/send with the device token in the Authorization header. */
export async function sendReply(token: string, phone: string, message: string): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: phone, message }),
  });
  return { ok: res.ok, status: res.status, body: (await res.text()).slice(0, 300) };
}
