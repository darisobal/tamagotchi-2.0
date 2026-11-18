import { ResponsiveText as Text } from '../src/design-system/ResponsiveText';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AccessibilityInfo, Pressable, ScrollView, StyleSheet, TextInput, View, BackHandler } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { CADENCE_OPTIONS, HabitCadence, HABIT_NAME_MAX } from '../src/types';
import { Colors, Spacing } from '../src/theme';
import { Page } from '../src/design-system/Page';
import { Button, ScreenHeader, TextField, MonthChip } from '../src/design-system/Controls';
import { PetArtwork } from '../src/design-system/Artwork';
import { DesignType } from '../src/design-system/tokens';
import PetLives from '../src/PetLives';
import { getRestartStoreAvailability, RESTART_PRICE_LABEL } from '../src/purchases';

export default function OnboardingScreen() {
  const { loading, prefs, updatePrefs, startHabitPlan } = useAppState();
  const { user, loading: authLoading, passwordRecoveryPending } = useAuth();
  if (authLoading) return <View style={styles.loading}><ActivityIndicator /></View>;
  if (passwordRecoveryPending) return <Redirect href="/reset-password" />;
  if (!user) return <Redirect href="/auth" />;
  if (loading) return <View style={styles.loading}><ActivityIndicator /></View>;
  if (prefs.onboardingDone) return <Redirect href="/(tabs)" />;
  return <Journey key="journey" prefs={prefs} updatePrefs={updatePrefs} startHabitPlan={startHabitPlan} />;
}

function Journey({ prefs, updatePrefs, startHabitPlan }: Pick<ReturnType<typeof useAppState>, 'prefs' | 'updatePrefs' | 'startHabitPlan'>) {
  const saved = prefs.onboardingDraft;
  const [step, setStep] = useState(saved?.step ?? 0);
  const [habit, setHabit] = useState(saved?.habitName ?? '');
  const [cadence, setCadence] = useState<HabitCadence>(saved?.habitCadence ?? 'daily');
  const [pet, setPet] = useState(saved?.petName ?? 'noodle');
  const [price, setPrice] = useState(RESTART_PRICE_LABEL);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<TextInput>(null);
  const scroll = useRef<ScrollView>(null);
  const saving = useRef(Promise.resolve());
  const finished = useRef(false);

  useEffect(() => {
    if (finished.current) return;
    // Serialize saves; navigation and final commit flush the latest draft.
    saving.current = saving.current.catch(() => {}).then(() => updatePrefs({
      onboardingDraft: { step, habitName: habit, habitCadence: cadence, petName: pet },
    })).catch(() => setError('Could not save your draft. Please try again.'));
  }, [step, habit, cadence, pet, updatePrefs]);

  useEffect(() => {
    let active = true;
    void getRestartStoreAvailability().then(value => { if (active) { setPrice(value.displayPrice); setMock(value.useMockCheckout); } });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (step !== 1) input.current?.focus();
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 0) return false;
      setStep(value => value - 1); return true;
    });
    return () => back.remove();
  }, [step]);

  const next = async () => {
    if (busy) return;
    const message = step === 0 && !habit.trim() ? 'Give your habit a name before continuing.'
      : step === 2 && !pet.trim() ? 'Give your pet a name before continuing.' : '';
    if (message) { setError(message); AccessibilityInfo.announceForAccessibility(message); input.current?.focus(); return; }
    setError('');
    if (step < 2) { setStep(step + 1); return; }
    setBusy(true);
    try {
      await saving.current;
      finished.current = true;
      await startHabitPlan(habit, cadence, pet);
      router.replace('/(tabs)');
    } catch { finished.current = false; setError('Could not start your plan. Please try again.'); }
    finally { setBusy(false); }
  };

  return <Page ref={scroll} bottomPadding={48}>
    <View style={styles.top}>
      <Text style={DesignType.calendar}>{step + 1} of 3</Text>
      {step > 0 && <Pressable accessibilityRole="button" disabled={busy} style={styles.link} onPress={() => { setError(''); setStep(step - 1); }}><Text style={DesignType.calendar}>Back</Text></Pressable>}
    </View>
    <ScreenHeader title={['Name your habit', 'How often?', pet.trim() ? `Meet ${pet.trim()}.` : 'Name your pet'][step]} />
    {step !== 2 && <Text style={DesignType.supporting}>{['Pick one small thing. Your pet will show your progress.', 'Each check-in restarts the interval.'][step]}</Text>}
    {step === 0 && <>
      <TextField ref={input} label="Habit" autoFocus accessibilityHint="Choose a concrete, achievable action" value={habit} onChangeText={setHabit} maxLength={HABIT_NAME_MAX} placeholder="E.g. read 10 pages" returnKeyType="next" onSubmitEditing={() => void next()} />
      <View style={styles.habitSuggestions}>{['meditate', 'run', 'read 10 pages'].map(value => <Pressable key={value} accessibilityRole="button" accessibilityHint="Fills your habit field so you can edit it" style={styles.tagTarget} onPress={() => { setHabit(value); setError(''); input.current?.focus(); }}><Text style={[DesignType.calendar, { textDecorationLine: 'underline' }]}>{value}</Text></Pressable>)}</View>
    </>}
    {step === 1 && <View accessibilityRole="radiogroup" accessibilityLabel="Check-in interval" style={{ gap: 12 }}>
      {CADENCE_OPTIONS.map(option => <MonthChip key={option.id} label={{ daily: 'Every 24 hours', every2days: 'Every 48 hours', weekly: 'Every 7 days' }[option.id]} selected={cadence === option.id} accessibilityRole="radio" accessibilityState={{ checked: cadence === option.id }} onPress={() => setCadence(option.id)} />)}
    </View>}
    {step === 2 && <>
      <View accessible accessibilityRole="image" accessibilityLabel={`${pet.trim() || 'Your pet'}, with three hearts`} style={styles.pet}><PetArtwork color={prefs.petColor} /><PetLives lives={3} color={prefs.petColor} size={24} /></View>
      <TextField ref={input} label="Name" value={pet} onChangeText={setPet} maxLength={40} returnKeyType="done" onSubmitEditing={() => void next()} />
      <Text style={DesignType.supporting}>Check-ins refill three hearts. Each missed interval costs one. Lose all three and your pet dies. Restarting costs {price}{mock ? ' (test checkout here)' : ''}. “Let’s start” starts the clock.</Text>
    </>}
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={DesignType.supporting}>{error}</Text> : null}
    <Button label={step === 2 ? 'Let’s start' : 'Next'} state={busy ? 'loading' : 'default'} onPress={() => void next()} />
  </Page>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitSuggestions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.sm, marginTop: -Spacing.sm },
  tagTarget: { minHeight: 44, justifyContent: 'center', maxWidth: '100%' },
  pet: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  link: { paddingVertical: Spacing.sm, minHeight: 44, justifyContent: 'center' },
});
