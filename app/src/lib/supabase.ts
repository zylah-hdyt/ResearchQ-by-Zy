import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Cloud mode is on when both variables are present; otherwise the app uses the local (browser) backend. */
export const isCloud = Boolean(url && key);
export const supabase: SupabaseClient | null = isCloud
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
