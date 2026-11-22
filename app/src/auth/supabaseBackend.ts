import type { SupabaseClient } from '@supabase/supabase-js';
import type { CurrencyCode, Language, Profile, ThemePref } from '../data/types';
import { defaultCurrency, EMAIL_RE, type AuthBackend, type AuthError } from './backend';

type Row = Record<string, unknown>;

const profileFrom = (r: Row): Profile => ({
  userId: r.user_id as string, email: r.email as string, fullName: r.full_name as string, displayName: r.display_name as string,
  avatarDataUrl: (r.avatar_data_url as string) ?? null, phone: r.phone as string, country: r.country as string,
  dateOfBirth: r.date_of_birth as string, preferredCurrency: r.preferred_currency as CurrencyCode,
  language: r.language as Language, theme: r.theme as ThemePref, weekStartsOn: r.week_starts_on as 0 | 1,
  budgetAlerts: r.budget_alerts as boolean, updatedAt: r.updated_at as string, createdAt: r.created_at as string,
});

export function createSupabaseAuth(db: SupabaseClient): AuthBackend {
  let emit: (p: Profile | null) => void = () => {};

  async function loadProfile(userId: string | undefined): Promise<Profile | null> {
    if (!userId) return null;
    const { data, error } = await db.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) console.error('profile load failed', error.message);
    return data ? profileFrom(data as Row) : null;
  }

  return {
    init(onProfile) {
      emit = onProfile;
      // INITIAL_SESSION fires once on subscribe, so no separate getSession() call is needed.
      const { data } = db.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') return;
        // Do not call Supabase synchronously inside this callback (it can deadlock the auth lock).
        setTimeout(async () => emit(await loadProfile(session?.user.id)), 0);
      });
      return () => data.subscription.unsubscribe();
    },

    async signIn(email, password) {
      const { data, error } = await db.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) return /invalid|credentials|confirmed/i.test(error.message) ? 'invalid' : 'generic';
      emit(await loadProfile(data.user.id));
      return null;
    },

    async signUp(fullName, email, password, lang, theme) {
      const e = email.trim().toLowerCase();
      if (!fullName.trim()) return 'name';
      if (!EMAIL_RE.test(e)) return 'email';
      if (password.length < 8) return 'password';
      const { data, error } = await db.auth.signUp({
        email: e,
        password,
        options: { data: { full_name: fullName.trim(), language: lang, preferred_currency: defaultCurrency(), theme } },
      });
      if (error) {
        if (/already|registered/i.test(error.message)) return 'exists';
        if (/password/i.test(error.message)) return 'password';
        return 'generic' as AuthError;
      }
      // With email-enumeration protection an existing email returns a user without identities.
      if (data.user && data.user.identities?.length === 0) return 'exists';
      if (!data.session) return 'confirm';
      emit(await loadProfile(data.user?.id));
      return null;
    },

    async changePassword(newPassword) {
      if (newPassword.length < 8) return 'password';
      const { error } = await db.auth.updateUser({ password: newPassword });
      if (!error) return null;
      return /password/i.test(error.message) ? 'password' : 'generic';
    },

    async signOut() {
      await db.auth.signOut();
      emit(null);
    },

    async saveProfile(p) {
      const { error } = await db.from('profiles').update({
        full_name: p.fullName, display_name: p.displayName, avatar_data_url: p.avatarDataUrl, phone: p.phone,
        country: p.country, date_of_birth: p.dateOfBirth, preferred_currency: p.preferredCurrency, language: p.language,
        theme: p.theme, week_starts_on: p.weekStartsOn, budget_alerts: p.budgetAlerts, updated_at: new Date().toISOString(),
      }).eq('user_id', p.userId);
      if (error) throw new Error(error.message);
    },
  };
}
