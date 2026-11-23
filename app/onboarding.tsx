import { ResponsiveText as Text } from '../src/design-system/ResponsiveText';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AccessibilityInfo, Pressable, ScrollView, StyleSheet, TextInput, View, BackHandler } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { CADENCE_OPTIONS, HabitCadence, HABIT_NAME_MAX } from '../src/types';
import { Colors, Spacing } from '../src/theme';
import { Page } from '../src/design-system/Page';
import { Button, ScreenHeader, TextField, SelectionOption } from '../src/design-system/Controls';
import { DesignType } from '../src/design-system/tokens';

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
  const [step, setStep] = useState(Math.min(saved?.step ?? 0, 1));
  const [habit, setHabit] = useState(saved?.habitName ?? '');
  const [cadence, setCadence] = useState<HabitCadence>(saved?.habitCadence ?? 'daily');
  const pet = saved?.petName?.trim() || prefs.petName.trim() || 'noodle';
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
    const message = step === 0 && !habit.trim() ? 'Give your habit a name before continuing.' : '';
    if (message) { setError(message); AccessibilityInfo.announceForAccessibility(message); input.current?.focus(); return; }
    setError('');
    if (step < 1) { setStep(step + 1); return; }
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
      <Text style={DesignType.calendar}>{step + 1} of 2</Text>
      {step > 0 && <Pressable accessibilityRole="button" disabled={busy} style={styles.link} onPress={() => { setError(''); setStep(step - 1); }}><Text style={DesignType.calendar}>Back</Text></Pressable>}
    </View>
    <ScreenHeader title={['Name your habit', 'How often?'][step]} />
    <Text style={DesignType.supporting}>{['Pick one small thing. Your pet will show your progress.', 'Each check-in adds this much time.'][step]}</Text>
    {step === 0 && <>
      <TextField ref={input} label="Habit" autoFocus accessibilityHint="Choose a concrete, achievable action" value={habit} onChangeText={setHabit} maxLength={HABIT_NAME_MAX} placeholder="E.g. read 10 pages" returnKeyType="next" onSubmitEditing={() => void next()} />
      <View style={styles.habitSuggestions}>{['meditate', 'run', 'read 10 pages'].map(value => <Pressable key={value} accessibilityRole="button" accessibilityHint="Fills your habit field so you can edit it" style={styles.tagTarget} onPress={() => { setHabit(value); setError(''); input.current?.focus(); }}><Text style={[DesignType.calendar, { textDecorationLine: 'underline' }]}>{value}</Text></Pressable>)}</View>
    </>}
    {step === 1 && <View accessibilityRole="radiogroup" accessibilityLabel="Check-in interval" style={{ gap: 12 }}>
      {CADENCE_OPTIONS.map(option => <SelectionOption key={option.id} label={{ daily: 'Every 24 hours', every2days: 'Every 48 hours', weekly: 'Every 7 days' }[option.id]} selected={cadence === option.id} accessibilityRole="radio" accessibilityState={{ checked: cadence === option.id }} onPress={() => setCadence(option.id)} />)}
    </View>}
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={DesignType.supporting}>{error}</Text> : null}
    <Button label={step === 1 ? 'Let’s start' : 'Next'} state={busy ? 'loading' : 'default'} onPress={() => void next()} />
  </Page>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  habitSuggestions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.sm, marginTop: -Spacing.sm },
  tagTarget: { minHeight: 44, justifyContent: 'center', maxWidth: '100%' },
  link: { paddingVertical: Spacing.sm, minHeight: 44, justifyContent: 'center' },
});
