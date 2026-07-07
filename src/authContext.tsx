import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';

type AuthMode = 'login' | 'signup';

const LOCAL_USER_KEY = 'tamagotchi_local_user';

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  isLocalOnly: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

function formatAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Something went wrong. Try again.';
}

function makeLocalUser(email: string): User {
  const id = `local-${email.trim().toLowerCase()}`;
  return {
    id,
    email: email.trim().toLowerCase(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
}

function makeLocalSession(user: User): Session {
  return {
    access_token: 'local',
    refresh_token: 'local',
    expires_in: 60 * 60 * 24 * 365,
    token_type: 'bearer',
    user,
  } as Session;
}

async function readLocalUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(LOCAL_USER_KEY);
  if (!raw) return null;
  try {
    const { email } = JSON.parse(raw) as { email: string };
    return makeLocalUser(email);
  } catch {
    return null;
  }
}

async function writeLocalUser(email: string): Promise<User> {
  await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ email: email.trim().toLowerCase() }));
  return makeLocalUser(email);
}

async function clearLocalUser(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      readLocalUser().then((user) => {
        if (user) setSession(makeLocalSession(user));
        setLoading(false);
      });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const localSignIn = useCallback(async (email: string, password: string, mode: AuthMode) => {
    if (!email.trim()) return 'Enter your email.';
    if (mode === 'signup' && password.length < 6) return 'Use at least 6 characters.';
    const existing = await readLocalUser();
    const normalized = email.trim().toLowerCase();
    if (mode === 'login' && existing && existing.email !== normalized) {
      return 'No account on this device for that email. Try sign up.';
    }
    const user = await writeLocalUser(normalized);
    setSession(makeLocalSession(user));
    return null;
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabase();
      if (!supabase) return localSignIn(email, password, 'login');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? formatAuthError(error) : null;
    },
    [localSignIn]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabase();
      if (!supabase) return localSignIn(email, password, 'signup');
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? formatAuthError(error) : null;
    },
    [localSignIn]
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return 'Magic links need Supabase. Use email + password for now, or add EXPO_PUBLIC_SUPABASE_* keys.';
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return error ? formatAuthError(error) : null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      await clearLocalUser();
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      isConfigured: isSupabaseConfigured,
      isLocalOnly: !isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      signInWithMagicLink,
      signOut,
    }),
    [loading, session, signInWithPassword, signUpWithPassword, signInWithMagicLink, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthMode };
