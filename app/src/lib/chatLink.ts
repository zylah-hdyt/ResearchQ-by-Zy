import { isCloud, supabase } from './supabase';

/** The WhatsApp number people send messages to. The card in Settings only appears when this is configured. */
export const chatNumber: string | undefined = (import.meta.env.VITE_CHAT_NUMBER as string | undefined)?.replace(/\D/g, '') || undefined;
export const chatEnabled = isCloud && !!chatNumber;

export async function linkedPhone(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('chat_links').select('phone').maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.phone as string | undefined) ?? null;
}
export async function createLinkCode(): Promise<string> {
  if (!supabase) throw new Error('cloud only');
  const { data, error } = await supabase.rpc('create_chat_link_code');
  if (error || typeof data !== 'string') throw new Error(error?.message ?? 'no code');
  return data;
}
export async function unlinkChat(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('chat_links').delete().not('user_id', 'is', null);
  if (error) throw new Error(error.message);
}
/** "62812••••7890" */
export const maskPhone = (p: string) => (p.length > 7 ? `${p.slice(0, 4)}••••${p.slice(-4)}` : p);
export const chatDeepLink = (code: string) => `https://wa.me/${chatNumber}?text=${encodeURIComponent(`MYFI-${code}`)}`;

export interface ChatMessage { id: number; received_at: string; text: string; status: string; intent: string | null; reply: string | null }
/** The user's latest chat messages with what the database understood and answered (their own rows only, by RLS). */
export async function recentMessages(limit = 5): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('chat_inbox').select('id, received_at, text, status, intent, reply').neq('status', 'duplicate').order('id', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChatMessage[];
}
