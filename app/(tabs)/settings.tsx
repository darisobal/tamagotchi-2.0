import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../../src/context';
import { useAuth } from '../../src/authContext';
import {
  DEFAULT_HABIT_NAME,
  DEFAULT_PET_NAME,
  PET_COLOR_OPTIONS,
  PET_HAT_OPTIONS,
  PetHat,
  CADENCE_OPTIONS,
  HabitCadence,
  DEFAULT_HABIT_CADENCE,
} from '../../src/types';
import { Colors, Spacing, FontSize, Slab, Radius, Border, Type } from '../../src/theme';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { useMoodBackground } from '../../src/useMoodBackground';
import LineArtPet from '../../src/LineArtPet';
import { HatOnlyPreview } from '../../src/PetHat';
import PetEggShell, {
  PET_SETUP_DEAD_LEFT_INSET,
  PET_SETUP_DISPLAY_HEIGHT,
  PET_SETUP_EGG_HEIGHT,
  PET_SETUP_EGG_WIDTH,
} from '../../src/PetEggShell';

const HABIT_NAME_MAX = 40;
const PET_NAME_MAX = 30;

export default function SettingsScreen() {
  const { prefs, updatePrefs, mood } = useAppState();
  const { user, signOut } = useAuth();
  const screenBg = useMoodBackground();
  const tabBarExtraPad = useFloatingTabBarExtraPadding();
  const [habitDraft, setHabitDraft] = useState(prefs.habitName ?? DEFAULT_HABIT_NAME);
  const [petDraft, setPetDraft] = useState(prefs.petName ?? DEFAULT_PET_NAME);

  // Keep the draft in sync if prefs.habitName changes from elsewhere (e.g. reset).
  useEffect(() => {
    setHabitDraft(prefs.habitName ?? DEFAULT_HABIT_NAME);
  }, [prefs.habitName]);

  useEffect(() => {
    setPetDraft(prefs.petName ?? DEFAULT_PET_NAME);
  }, [prefs.petName]);

  const persistHabitName = useCallback(async () => {
    const trimmed = habitDraft.trim();
    if (trimmed.length === 0) {
      // Don't persist empty; revert to current saved value.
      setHabitDraft(prefs.habitName ?? DEFAULT_HABIT_NAME);
      return;
    }
    if (trimmed === prefs.habitName) return;
    await updatePrefs({ habitName: trimmed });
  }, [habitDraft, prefs.habitName, updatePrefs]);

  const persistPetName = useCallback(async () => {
    const trimmed = petDraft.trim();
    if (trimmed.length === 0) {
      setPetDraft(prefs.petName ?? DEFAULT_PET_NAME);
      return;
    }
    if (trimmed === prefs.petName) return;
    await updatePrefs({ petName: trimmed });
  }, [petDraft, prefs.petName, updatePrefs]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: screenBg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Spacing.xxl + tabBarExtraPad }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>your setup</Text>

          <Text style={styles.sectionLabel}>name your habit</Text>
          <TextInput
            value={habitDraft}
            onChangeText={setHabitDraft}
            onBlur={persistHabitName}
            onEndEditing={persistHabitName}
            placeholder="e.g. walk 20 minutes"
            placeholderTextColor={Colors.textMuted}
            style={styles.habitInput}
            maxLength={HABIT_NAME_MAX}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />

          <Text style={styles.sectionLabel}>cadence</Text>
          <View style={styles.rowThree}>
            {CADENCE_OPTIONS.map((opt) => (
              <SettingsOption
                key={opt.id}
                selected={(prefs.habitCadence ?? DEFAULT_HABIT_CADENCE) === opt.id}
                onPress={() => updatePrefs({ habitCadence: opt.id as HabitCadence })}
                label={opt.label}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>name your pet</Text>
          <TextInput
            value={petDraft}
            onChangeText={setPetDraft}
            onBlur={persistPetName}
            onEndEditing={persistPetName}
            placeholder="e.g. beans"
            placeholderTextColor={Colors.textMuted}
            style={styles.habitInput}
            maxLength={PET_NAME_MAX}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
          />

          <View style={styles.avatarSection}>
            <View style={styles.avatarCompose}>
              <PetEggShell width={PET_SETUP_EGG_WIDTH} />
              <View
                style={[
                  styles.avatarPet,
                  mood === 'dead' && styles.avatarPetDead,
                ]}
              >
                <LineArtPet
                  mood={mood}
                  strokeColor={prefs.petColor || Colors.pet}
                  displayHeight={PET_SETUP_DISPLAY_HEIGHT}
                  hat={prefs.petHat ?? 'none'}
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>pet colour</Text>
          <View style={styles.swatchRow}>
            {PET_COLOR_OPTIONS.map((opt) => {
              const selected = opt.color === prefs.petColor;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.swatch,
                    { backgroundColor: opt.color },
                    selected && styles.swatchSelected,
                  ]}
                  onPress={() => updatePrefs({ petColor: opt.color })}
                  activeOpacity={0.8}
                  accessibilityLabel={`${opt.label} pet colour`}
                >
                  {selected ? <Text style={styles.swatchCheck}>x</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>pet hat</Text>
          <View style={styles.hatRow}>
            {PET_HAT_OPTIONS.map((opt) => {
              const selected = opt.id === (prefs.petHat ?? 'none');
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.hatTile, selected && styles.hatTileSelected]}
                  onPress={() => updatePrefs({ petHat: opt.id as PetHat })}
                  activeOpacity={0.8}
                >
                  <View style={styles.hatPreview} pointerEvents="none">
                    {opt.id === 'none' ? (
                      <Text style={styles.noHatGlyph}>—</Text>
                    ) : (
                      <HatOnlyPreview
                        hat={opt.id}
                        size={64}
                        strokeColor={prefs.petColor || Colors.pet}
                      />
                    )}
                  </View>
                  <Text style={styles.hatLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>account</Text>
          {user?.email ? <Text style={styles.helper}>{user.email}</Text> : null}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={async () => {
              await signOut();
              router.replace('/auth');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutText}>log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SettingsOption({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>
      {selected && <Text style={styles.checkmark}>*</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: Spacing.lg,
  },
  screenTitle: {
    ...Type.screenTitle,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.lg,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  helper: {
    fontSize: FontSize.sm,
    fontFamily: Slab.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  habitInput: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    fontFamily: Slab.extraBold,
    color: Colors.ink,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'visible',
  },
  avatarCompose: {
    width: PET_SETUP_EGG_WIDTH,
    height: PET_SETUP_EGG_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarPet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  /** Dead pose: keep head/hat on the left of the egg; let feet overflow right. */
  avatarPetDead: {
    alignItems: 'flex-start',
    paddingLeft: PET_SETUP_DEAD_LEFT_INSET,
  },
  rowThree: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  optionSelected: {
    backgroundColor: Colors.ink,
  },
  optionLabel: {
    fontSize: FontSize.md,
    fontFamily: Slab.bold,
    color: Colors.ink,
    flex: 1,
  },
  optionLabelSelected: { color: '#FFFFFF' },
  checkmark: {
    fontSize: 18,
    fontFamily: Slab.black,
    color: '#FFFFFF',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: { borderWidth: Border.thick },
  swatchCheck: {
    fontFamily: Slab.black,
    color: '#FFFFFF',
    fontSize: FontSize.md,
  },
  hatRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  hatTile: {
    flexBasis: '23%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
    minHeight: 100,
  },
  hatTileSelected: {
    borderWidth: Border.thick,
    backgroundColor: '#FFF1B8',
  },
  hatPreview: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hatLabel: {
    fontFamily: Slab.extraBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  noHatGlyph: {
    fontFamily: Slab.black,
    fontSize: 32,
    color: Colors.textMuted,
    lineHeight: 36,
  },
  signOutBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: Border.thick,
    borderColor: Colors.ink,
    borderRadius: Radius.md,
  },
  signOutText: {
    fontFamily: Slab.black,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
});
