import type { Language, Profile, ThemePref } from '../data/types';

export type AuthError = 'invalid' | 'exists' | 'password' | 'email' | 'name' | 'generic';
/** `confirm` = account created, but the user must confirm their email before signing in. */
export type SignUpResult = AuthError | 'confirm' | null;

export interface AuthBackend {
  /** Restore any existing session and keep `onProfile` updated. Returns an unsubscribe function. */
  init(onProfile: (p: Profile | null) => void): () => void;
  signIn(email: string, password: string): Promise<AuthError | null>;
  signUp(fullName: string, email: string, password: string, lang: Language, theme: ThemePref): Promise<SignUpResult>;
  changePassword(newPassword: string): Promise<AuthError | null>;
  signOut(): Promise<void>;
  saveProfile(p: Profile): Promise<void>;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Rupiah first: every new account starts in IDR (changeable in settings). */
export const defaultCurrency = () => 'IDR' as const;
