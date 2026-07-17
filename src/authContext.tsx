import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  createSessionFromUrl,
  getAuthRedirectUrl,
  isAuthCallbackUrl,
  isPasswordRecoveryUrl,
} from './authRedirect';

export type ContinueResult =
  | { outcome: 'session' }
  | { outcome: 'confirm_email' }
  | { outcome: 'error'; message: string };

export type SignUpResult = ContinueResult;

const LOCAL_USER_KEY = 'tamagotchi_local_user';

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isConfigured: boolean;
  isLocalOnly: boolean;
  passwordRecoveryPending: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>;
  continueWithPassword: (email: string, password: string) => Promise<ContinueResult>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  resendConfirmationEmail: (email: string) => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  beginPasswordRecovery: () => void;
  clearPasswordRecovery: () => void;
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
    return String((error as { message: string }).message).toLowerCase();
  }
  return 'something went wrong. try again.';
}

function isEmailNotConfirmedError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('email not confirmed') || lower.includes('not confirmed');
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
    email_confirmed_at: new Date().toISOString(),
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
  const [passwordRecoveryPending, setPasswordRecoveryPending] = useState(false);

  const beginPasswordRecovery = useCallback(() => {
    setPasswordRecoveryPending(true);
  }, []);

  const clearPasswordRecovery = useCallback(() => {
    setPasswordRecoveryPending(false);
  }, []);

  const handleAuthCallbackUrl = useCallback(async (url: string) => {
    if (!isAuthCallbackUrl(url)) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const ok = await createSessionFromUrl(supabase, url);
    if (ok && isPasswordRecoveryUrl(url)) {
      setPasswordRecoveryPending(true);
    }
  }, []);

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

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryPending(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    Linking.getInitialURL().then((url) => {
      if (url) void handleAuthCallbackUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthCallbackUrl(url);
    });

    return () => subscription.remove();
  }, [handleAuthCallbackUrl]);

  const localContinue = useCallback(async (email: string, password: string): Promise<ContinueResult> => {
    if (!email.trim()) return { outcome: 'error', message: 'enter your email.' };
    if (password.length < 6) return { outcome: 'error', message: 'use at least 6 characters.' };

    const existing = await readLocalUser();
    const normalized = email.trim().toLowerCase();
    if (existing && existing.email !== normalized) {
      return {
        outcome: 'error',
        message: 'this device has a different account. sign out from settings first.',
      };
    }

    const user = await writeLocalUser(normalized);
    setSession(makeLocalSession(user));
    return { outcome: 'session' };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabase();
      if (!supabase) {
        const result = await localContinue(email, password);
        return result.outcome === 'error' ? result.message : null;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? formatAuthError(error) : null;
    },
    [localContinue]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const supabase = getSupabase();
      if (!supabase) return localContinue(email, password);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });

      if (error) {
        return { outcome: 'error', message: formatAuthError(error) };
      }

      if (data.session) {
        return { outcome: 'session' };
      }

      return { outcome: 'confirm_email' };
    },
    [localContinue]
  );

  const continueWithPassword = useCallback(
    async (email: string, password: string): Promise<ContinueResult> => {
      if (!email.trim()) return { outcome: 'error', message: 'enter your email.' };
      if (password.length < 6) return { outcome: 'error', message: 'use at least 6 characters.' };

      const supabase = getSupabase();
      if (!supabase) return localContinue(email, password);

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        return { outcome: 'session' };
      }

      const signInMessage = formatAuthError(signInError);
      if (isEmailNotConfirmedError(signInMessage)) {
        return { outcome: 'confirm_email' };
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });

      if (signUpError) {
        const signUpMessage = formatAuthError(signUpError);
        const lower = signUpMessage.toLowerCase();
        if (lower.includes('already') || lower.includes('registered')) {
          return { outcome: 'error', message: 'incorrect password. try again.' };
        }
        return { outcome: 'error', message: signUpMessage };
      }

      if (data.session) {
        return { outcome: 'session' };
      }

      return { outcome: 'confirm_email' };
    },
    [localContinue]
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return 'magic links need supabase. use email + password for now, or add expo_public_supabase_* keys.';
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    return error ? formatAuthError(error) : null;
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return 'email confirmation needs supabase. add expo_public_supabase_* keys.';
    }
    if (!email.trim()) return 'enter your email.';
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    return error ? formatAuthError(error) : null;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return 'password reset needs supabase. add expo_public_supabase_* keys.';
    }
    if (!email.trim()) return 'enter your email.';
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthRedirectUrl(),
    });
    return error ? formatAuthError(error) : null;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (password.length < 6) return 'use at least 6 characters.';
    const supabase = getSupabase();
    if (!supabase) {
      return 'password reset needs supabase. add expo_public_supabase_* keys.';
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return formatAuthError(error);
    setPasswordRecoveryPending(false);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    setPasswordRecoveryPending(false);
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
      passwordRecoveryPending,
      signInWithPassword,
      signUpWithPassword,
      continueWithPassword,
      signInWithMagicLink,
      resendConfirmationEmail,
      requestPasswordReset,
      updatePassword,
      beginPasswordRecovery,
      clearPasswordRecovery,
      signOut,
    }),
    [
      loading,
      session,
      passwordRecoveryPending,
      signInWithPassword,
      signUpWithPassword,
      continueWithPassword,
      signInWithMagicLink,
      resendConfirmationEmail,
      requestPasswordReset,
      updatePassword,
      beginPasswordRecovery,
      clearPasswordRecovery,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { isEmailNotConfirmedError };
