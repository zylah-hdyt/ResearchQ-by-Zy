import { describe, expect, it } from 'vitest';
import { constantTimeEqual, parseInbound, readBody } from '../../../supabase/functions/chat-webhook/provider.ts';

describe('gateway message parsing', () => {
  it('reads sender, text and normalises the number', () => expect(parseInbound({ sender: '6281234567890', message: 'makan 25rb', device: '628999', id: 'abc' })).toEqual({ phone: '6281234567890', text: 'makan 25rb', eventId: '6281234567890:abc' }));
  it('accepts alternative field names and a local-format number', () => expect(parseInbound({ from: '0812-3456-7890', text: 'saldo' })).toMatchObject({ phone: '6281234567890', text: 'saldo' }));
  it('ignores group chats', () => { expect(parseInbound({ sender: '6281234567890', message: 'hai', member: '6281111' })).toBeNull(); expect(parseInbound({ sender: '628123-111@g.us', message: 'hai' })).toBeNull(); });
  it('ignores messages from our own device', () => expect(parseInbound({ sender: '6281234567890', message: 'hai', device: '6281234567890' })).toBeNull());
  it('ignores empty or non-text payloads', () => { expect(parseInbound({ sender: '6281234567890' })).toBeNull(); expect(parseInbound({ message: 'hai' })).toBeNull(); expect(parseInbound({})).toBeNull(); });
  it('reads JSON, form and urlencoded bodies', async () => {
    const j = await readBody(new Request('http://x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sender: '1', message: 'a' }) }));
    const u = await readBody(new Request('http://x', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'sender=1&message=makan+25rb' }));
    const f = new FormData(); f.set('sender', '1'); f.set('message', 'b');
    const m = await readBody(new Request('http://x', { method: 'POST', body: f }));
    expect(j).toEqual({ sender: '1', message: 'a' }); expect(u).toEqual({ sender: '1', message: 'makan 25rb' }); expect(m).toEqual({ sender: '1', message: 'b' });
  });
  it('constant-time compare', () => { expect(constantTimeEqual('abc', 'abc')).toBe(true); expect(constantTimeEqual('abc', 'abd')).toBe(false); expect(constantTimeEqual('abc', 'abcd')).toBe(false); expect(constantTimeEqual('', '')).toBe(true); });
});
