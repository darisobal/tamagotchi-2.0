import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/authContext';
import { createSessionFromUrl } from '../src/authRedirect';
import { getSupabase } from '../src/supabase';
import { Colors } from '../src/theme';

/** Landing route for Supabase email confirmation and magic-link redirects. */
export default function AuthCallbackScreen() {
  const { user, loading } = useAuth();
  const [handlingCallback, setHandlingCallback] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setHandlingCallback(false);
      return;
    }

    const url =
      Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : null;

    if (!url) {
      setHandlingCallback(false);
      return;
    }

    void createSessionFromUrl(supabase, url).finally(() => {
      setHandlingCallback(false);
    });
  }, []);

  if (loading || handlingCallback) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.ink} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.stateTodoBg,
  },
});
