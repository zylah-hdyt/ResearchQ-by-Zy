// Supabase Edge Function: the thin relay between the WhatsApp gateway and the database.
//   gateway POST -> check the secret -> INSERT the raw message into chat_inbox -> the database processes it (trigger) ->
//   send the reply the database wrote.  No message parsing or business logic lives here.
// Deploy WITHOUT JWT verification (the gateway cannot send one): supabase functions deploy chat-webhook --no-verify-jwt
// Secrets: CHAT_WEBHOOK_SECRET (long random string, also in the webhook URL as ?key=...), FONNTE_TOKEN.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { constantTimeEqual, parseInbound, readBody, sendReply } from './provider.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const APOLOGY = 'Maaf, terjadi kesalahan. Coba lagi sebentar lagi. / Sorry, something went wrong. Please try again.';

async function reply(phone: string, text: string) {
  const token = Deno.env.get('FONNTE_TOKEN');
  if (!token) return console.error('FONNTE_TOKEN is not set: cannot reply');
  const r = await sendReply(token, phone, text);
  if (!r.ok) console.error('reply failed', r.status, r.body);
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('CHAT_WEBHOOK_SECRET');
  if (!secret) return new Response('not configured', { status: 503 });
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!constantTimeEqual(key, secret)) return new Response('forbidden', { status: 403 });
  if (req.method === 'GET') return new Response('ok'); // connectivity check from the gateway's dashboard
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  let body: Record<string, unknown> = {};
  try { body = await readBody(req); } catch (e) { console.error('unreadable body', String(e)); return Response.json({ ok: true }); }
  const inbound = parseInbound(body);
  if (!inbound) { console.log('ignored message; keys:', Object.keys(body).join(',')); return Response.json({ ok: true, ignored: true }); }

  // 1) store the raw message: the database processes it in a BEFORE INSERT trigger and fills in status + reply
  const { data, error } = await db.from('chat_inbox')
    .insert({ phone: inbound.phone, text: inbound.text.slice(0, 2000), event_id: inbound.eventId ?? null })
    .select('id, status, reply').single();
  if (error || !data) { console.error('inbox insert failed', error?.message); await reply(inbound.phone, APOLOGY); return Response.json({ ok: true }); }

  // 2) keep the payload exactly as received (service role only; useful when the gateway's format changes)
  const raw = await db.from('chat_inbox_raw').insert({ inbox_id: data.id, raw: body });
  if (raw.error) console.error('raw insert failed', raw.error.message);

  // 3) answer with what the database decided (nothing for a duplicate delivery)
  if (data.status !== 'duplicate' && data.reply) await reply(inbound.phone, data.reply as string);

  if (Math.random() < 0.02) await db.rpc('chat_cleanup');
  return Response.json({ ok: true });
});
