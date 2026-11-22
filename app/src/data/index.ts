import { isCloud, supabase } from '../lib/supabase';
import type { DataBackend } from './backend';
import { localBackend } from './localBackend';
import { createSupabaseBackend } from './supabaseBackend';

export const dataBackend: DataBackend = isCloud && supabase ? createSupabaseBackend(supabase) : localBackend;
