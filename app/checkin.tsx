import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../src/context';
import { MAIN_TRACK, DEFAULT_HABIT_NAME } from '../src/types';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../src/theme';

export default function CheckInScreen() {
  const { doCheckIn, prefs } = useAppState();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();

  const handleSave = async () => {
    setSaving(true);
    await doCheckIn(MAIN_TRACK, 'medium', note.trim() || null);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeText}>x</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.trackTitle}>
            {habitName}
          </Text>

          <Text style={styles.prompt}>nice -- what did you do today?</Text>

          {/* Note */}
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

          {/* Save */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'saving...' : 'done!'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  closeBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.full,
  },
  closeText: {
    fontSize: 18,
    fontFamily: Slab.black,
    color: Colors.ink,
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
