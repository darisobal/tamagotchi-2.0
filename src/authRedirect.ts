import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Redirect target for Supabase confirmation / magic-link emails. */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth-callback`;
  }
  return Linking.createURL('auth-callback');
}

export async function createSessionFromUrl(
  supabase: SupabaseClient,
  url: string
): Promise<boolean> {
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.code;
  if (typeof code === 'string') {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }

  const hashStart = url.indexOf('#');
  if (hashStart >= 0) {
    const params = new URLSearchParams(url.slice(hashStart + 1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return !error;
    }
  }

  const accessToken = parsed.queryParams?.access_token;
  const refreshToken = parsed.queryParams?.refresh_token;
  if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }

  return false;
}

export function isAuthCallbackUrl(url: string): boolean {
  return url.includes('auth-callback');
}
