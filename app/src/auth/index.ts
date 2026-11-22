import { isCloud, supabase } from '../lib/supabase';
import type { AuthBackend } from './backend';
import { createLocalAuth } from './localBackend';
import { createSupabaseAuth } from './supabaseBackend';

export const authBackend: AuthBackend = isCloud && supabase ? createSupabaseAuth(supabase) : createLocalAuth();
