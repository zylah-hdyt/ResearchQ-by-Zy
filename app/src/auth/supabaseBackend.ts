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
  termsVersion: (r.terms_version as string) ?? undefined, termsAcceptedAt: (r.terms_accepted_at as string) ?? undefined,
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
    init(onProfile, onRecovery) {
      emit = onProfile;
      // INITIAL_SESSION fires once on subscribe, so no separate getSession() call is needed.
      const { data } = db.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') return;
        if (event === 'PASSWORD_RECOVERY') onRecovery?.();
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

    async signUp(fullName, email, password, lang, theme, termsVersion) {
      const e = email.trim().toLowerCase();
      if (!fullName.trim()) return 'name';
      if (!EMAIL_RE.test(e)) return 'email';
      if (password.length < 8) return 'password';
      const { data, error } = await db.auth.signUp({
        email: e,
        password,
        options: { data: { full_name: fullName.trim(), language: lang, preferred_currency: defaultCurrency(), theme, terms_version: termsVersion } },
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

    async deleteAccount() {
      const { error } = await db.rpc('delete_my_account');
      if (error) return 'generic';
      await db.auth.signOut({ scope: 'local' });
      emit(null);
      return null;
    },

    async changePassword(newPassword) {
      if (newPassword.length < 8) return 'password';
      const { error } = await db.auth.updateUser({ password: newPassword });
      if (!error) return null;
      return /password/i.test(error.message) ? 'password' : 'generic';
    },

    async requestPasswordReset(email, redirectTo) {
      const e = email.trim().toLowerCase();
      if (!EMAIL_RE.test(e)) return 'email';
      const { error } = await db.auth.resetPasswordForEmail(e, { redirectTo });
      if (!error) return null;
      if (error.status === 429 || /rate|security purposes|seconds/i.test(error.message)) return 'rate';
      if (/not authori[sz]ed|smtp|sending|mail/i.test(error.message)) return 'mail';
      return 'generic';
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
        terms_version: p.termsVersion ?? null, terms_accepted_at: p.termsAcceptedAt ?? null,
      }).eq('user_id', p.userId);
      if (error) throw new Error(error.message);
    },
  };
}
