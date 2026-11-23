import type { Language, Profile, ThemePref } from '../data/types';
import { storage } from '../data/storage';
import { hashPassword, newSalt } from '../lib/password';
import { uid } from '../lib/id';
import { defaultCurrency, EMAIL_RE, type AuthBackend } from './backend';

/** Browser-only accounts (used when Supabase is not configured, and in local development). */
export function createLocalAuth(): AuthBackend {
  let emit: (p: Profile | null) => void = () => {};
  return {
    init(onProfile) {
      emit = onProfile;
      const s = storage.getSession();
      onProfile(s ? storage.getProfile(s.userId) : null);
      return () => {};
    },
    async signIn(email, password) {
      const acc = storage.listAccounts().find((a) => a.email === email.trim().toLowerCase());
      if (!acc) return 'invalid';
      if ((await hashPassword(password, acc.salt)) !== acc.passwordHash) return 'invalid';
      storage.setSession({ userId: acc.id });
      emit(storage.getProfile(acc.id));
      return null;
    },
    async signUp(fullName, email, password, lang: Language, theme: ThemePref, termsVersion: string) {
      const e = email.trim().toLowerCase();
      if (!fullName.trim()) return 'name';
      if (!EMAIL_RE.test(e)) return 'email';
      if (password.length < 8) return 'password';
      const accounts = storage.listAccounts();
      if (accounts.some((a) => a.email === e)) return 'exists';
      const salt = newSalt();
      const now = new Date().toISOString();
      const acc = { id: uid('u_'), email: e, salt, passwordHash: await hashPassword(password, salt), createdAt: now };
      storage.saveAccounts([...accounts, acc]);
      const p: Profile = {
        userId: acc.id, email: e, fullName: fullName.trim(), displayName: '', avatarDataUrl: null, phone: '',
        country: lang === 'id' ? 'Indonesia' : '', dateOfBirth: '', preferredCurrency: defaultCurrency(),
        language: lang, theme, weekStartsOn: 1, budgetAlerts: true, updatedAt: now, createdAt: now, termsVersion, termsAcceptedAt: now,
      };
      storage.saveProfile(p);
      storage.setSession({ userId: acc.id });
      emit(p);
      return null;
    },
    async deleteAccount() {
      const session = storage.getSession();
      if (!session) return 'generic';
      storage.deleteUser(session.userId);
      storage.saveAccounts(storage.listAccounts().filter((a) => a.id !== session.userId));
      storage.setSession(null);
      emit(null);
      return null;
    },
    async requestPasswordReset() {
      // Browser-only accounts have no email channel to prove ownership.
      return 'unavailable';
    },

    async changePassword(newPassword) {
      if (newPassword.length < 8) return 'password';
      const session = storage.getSession();
      const accounts = storage.listAccounts();
      const acc = accounts.find((a) => a.id === session?.userId);
      if (!acc) return 'generic';
      const salt = newSalt();
      storage.saveAccounts(accounts.map((a) => (a.id === acc.id ? { ...a, salt, passwordHash: '' } : a)));
      const passwordHash = await hashPassword(newPassword, salt);
      storage.saveAccounts(storage.listAccounts().map((a) => (a.id === acc.id ? { ...a, salt, passwordHash } : a)));
      return null;
    },
    async signOut() {
      storage.setSession(null);
      emit(null);
    },
    async saveProfile(p) {
      storage.saveProfile(p);
    },
  };
}
