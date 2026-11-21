import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Language, Profile } from '../data/types';
import { detectLanguage, I18nProvider, translator } from '../i18n';
import { useToast } from '../components/Toast';
import type { AuthError, SignUpResult } from './backend';
import { authBackend } from './index';

interface AuthValue {
  profile: Profile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (fullName: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  guestLanguage: Language;
  setGuestLanguage: (l: Language) => void;
}

const Ctx = createContext<AuthValue | null>(null);
const LANG_KEY = 'fa.v1:guestLang';

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const profileRef = useRef<Profile | null>(null);
  const [guestLanguage, setGuestLanguageState] = useState<Language>(() => {
    try { return (localStorage.getItem(LANG_KEY) as Language) || detectLanguage(); } catch { return detectLanguage(); }
  });

  useEffect(() => {
    const off = authBackend.init((p) => {
      // Ignore no-op refreshes so open forms keep their state.
      if (JSON.stringify(p) !== JSON.stringify(profileRef.current)) {
        profileRef.current = p;
        setProfile(p);
      }
      setReady(true);
    });
    return off;
  }, []);

  const setGuestLanguage = (l: Language) => {
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
    setGuestLanguageState(l);
  };

  const signIn = useCallback((email: string, password: string) => authBackend.signIn(email, password), []);
  const signUp = useCallback(
    (fullName: string, email: string, password: string) => authBackend.signUp(fullName, email, password, guestLanguage),
    [guestLanguage],
  );
  const signOut = useCallback(() => { void authBackend.signOut(); }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    const prev = profileRef.current;
    if (!prev) return;
    const next = { ...prev, ...patch, userId: prev.userId, email: prev.email, updatedAt: new Date().toISOString() };
    profileRef.current = next;
    setProfile(next);
    authBackend.saveProfile(next).catch((e) => {
      console.error(e);
      profileRef.current = prev;
      setProfile(prev);
      toast(translator(prev.language)('sync.error'));
    });
  }, [toast]);

  // Apply theme preference and document language.
  useEffect(() => {
    const theme = profile?.theme ?? 'system';
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.lang = profile?.language ?? guestLanguage;
  }, [profile?.theme, profile?.language, guestLanguage]);

  const value = useMemo(
    () => ({ profile, ready, signIn, signUp, signOut, updateProfile, guestLanguage, setGuestLanguage }),
    [profile, ready, signIn, signUp, signOut, updateProfile, guestLanguage],
  );

  return (
    <Ctx.Provider value={value}>
      <I18nProvider lang={profile?.language ?? guestLanguage}>{children}</I18nProvider>
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}

/** Name used in greetings: preferred display name, else first name, else email local part. */
export function greetingName(p: Profile): string {
  if (p.displayName.trim()) return p.displayName.trim();
  const first = p.fullName.trim().split(/\s+/)[0];
  return first || p.email.split('@')[0];
}
