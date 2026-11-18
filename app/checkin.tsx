import { Page } from '../src/design-system/Page';
import { Button, ScreenHeader, TextField } from '../src/design-system/Controls';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { router, Redirect } from 'expo-router';
import { useAuth } from '../src/authContext';
import { useAppState } from '../src/context';
import { MAIN_TRACK, DEFAULT_HABIT_NAME } from '../src/types';
import { Colors, Spacing, Type } from '../src/theme';
import CloseButton from '../src/CloseButton';
import { hasPendingPaidRestart } from '../src/purchases';
import RestartPaywall from '../src/RestartPaywall';

export default function CheckInScreen() {
  const { user, loading: authLoading, passwordRecoveryPending } = useAuth();
  const { doCheckIn, prefs, mood, loading } = useAppState();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [unlocked, setUnlocked] = useState(mood !== 'dead');

  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();

  useEffect(() => {
    if (authLoading || !user || passwordRecoveryPending || loading || !prefs.onboardingDone) return;
    if (mood !== 'dead') {
      setUnlocked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const pending = await hasPendingPaidRestart();
      if (cancelled) return;
      if (pending) {
        // Pending entitlement from paywall — revive immediately and return home.
        setUnlocked(true);
        try {
          await doCheckIn(MAIN_TRACK, 'medium', null);
          if (!cancelled) router.back();
        } catch {
          if (!cancelled) setPaywallVisible(true);
        }
      } else {
        setPaywallVisible(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mood, doCheckIn, loading, prefs.onboardingDone, authLoading, user, passwordRecoveryPending]);

  const handleSave = async () => {
    if (saving) return;
    if (mood === 'dead' && !unlocked) {
      setPaywallVisible(true);
      return;
    }
    setSaving(true);
    try {
      await doCheckIn(MAIN_TRACK, 'medium', note.trim() || null);
      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message.toLowerCase() : 'could not save check-in';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(message);
      } else {
        Alert.alert('oops', message);
      }
      if (message.includes('payment')) {
        setUnlocked(false);
        setPaywallVisible(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const onRestartUnlocked = async () => {
    setUnlocked(true);
    setPaywallVisible(false);
    try {
      await doCheckIn(MAIN_TRACK, 'medium', null);
      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message.toLowerCase() : 'could not restart';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(message);
      } else {
        Alert.alert('oops', message);
      }
    }
  };

  if (authLoading) return null;
  if (passwordRecoveryPending) return <Redirect href="/reset-password" />;
  if (!user) return <Redirect href="/auth" />;
  if (loading) return null;
  if (!prefs.onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <>
      <Page bottomPadding={48}>
          <View style={styles.header}>
            <CloseButton onPress={() => router.back()} accessibilityLabel="close" />
          </View>

          <ScreenHeader title={habitName} />

          {mood === 'dead' && (
            <Text style={styles.prompt}>
              paid restart unlocked — what will you do first?
            </Text>
          )}

          <TextField label="note (optional)" editable={!saving}
            placeholder="what did you work on?"
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />

          <View style={styles.spacer} />

          <Button label={mood === 'dead' ? 'restart?' : 'done!'} state={saving ? 'loading' : 'default'} disabled={mood === 'dead' && !unlocked} onPress={handleSave} />
      </Page>

      <RestartPaywall
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          if (mood === 'dead' && !unlocked) router.back();
        }}
        onUnlocked={onRestartUnlocked}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  prompt: {
    ...Type.screenDescription,
    marginBottom: Spacing.xl,
  },
  spacer: { flex: 1 },
});
