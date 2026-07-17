import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../src/context';
import { MAIN_TRACK, DEFAULT_HABIT_NAME } from '../src/types';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../src/theme';
import CloseButton from '../src/CloseButton';
import { hasPendingPaidRestart } from '../src/purchases';
import RestartPaywall from '../src/RestartPaywall';

export default function CheckInScreen() {
  const { doCheckIn, prefs, mood } = useAppState();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [unlocked, setUnlocked] = useState(mood !== 'dead');

  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();

  useEffect(() => {
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
  }, [mood, doCheckIn]);

  const handleSave = async () => {
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

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <CloseButton onPress={() => router.back()} accessibilityLabel="close" />
          </View>

          <Text style={styles.trackTitle}>{habitName}</Text>

          <Text style={styles.prompt}>
            {mood === 'dead'
              ? 'paid restart unlocked — what will you do first?'
              : 'nice -- what did you do today?'}
          </Text>

          <Text style={styles.label}>note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="what did you work on?"
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />

          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving || (mood === 'dead' && !unlocked)}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'saving...' : mood === 'dead' ? 'restart?' : 'done!'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <RestartPaywall
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          if (mood === 'dead' && !unlocked) router.back();
        }}
        onUnlocked={onRestartUnlocked}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.stateGoodBg },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  trackTitle: {
    ...Type.screenTitle,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  prompt: {
    fontSize: FontSize.lg,
    fontFamily: Slab.bold,
    color: Colors.ink,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  noteInput: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: Slab.regular,
    color: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  spacer: { flex: 1 },
  saveBtn: {
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    backgroundColor: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontFamily: Slab.black,
    letterSpacing: 0.5,
  },
});
