import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { useAppState } from '../src/context';
import { useAuth } from '../src/authContext';
import { CADENCE_OPTIONS, HabitCadence, HABIT_NAME_MAX } from '../src/types';
import { CADENCE_RULES, firstDeadline, formatDeadline } from '../src/onboarding';
import { Colors, Spacing, Radius, Border, Slab, FontSize, Type } from '../src/theme';
import LineArtPet from '../src/LineArtPet';
import PetLives from '../src/PetLives';
import { getRestartStoreAvailability, RESTART_PRICE_LABEL } from '../src/purchases';

export default function OnboardingScreen() {
  const { loading, prefs, updatePrefs, startHabitPlan } = useAppState();
  const { passwordRecoveryPending } = useAuth();
  if (passwordRecoveryPending) return <Redirect href="/reset-password" />;
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
  const [now, setNow] = useState(Date.now());
  const input = useRef<TextInput>(null);
  const scroll = useRef<ScrollView>(null);
  const saving = useRef(Promise.resolve());
  const finished = useRef(false);

  useEffect(() => {
    if (finished.current) return;
    // Serialize saves; navigation and final commit flush the latest draft.
    saving.current = saving.current.catch(() => {}).then(() => updatePrefs({
      onboardingDraft: { step, habitName: habit, habitCadence: cadence, petName: pet },
    })).catch(() => setError('could not save your draft. please try again.'));
  }, [step, habit, cadence, pet, updatePrefs]);

  useEffect(() => {
    let active = true;
    void getRestartStoreAvailability().then(value => { if (active) { setPrice(value.displayPrice); setMock(value.useMockCheckout); } });
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => { active = false; clearInterval(timer); };
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
    const message = step === 0 && !habit.trim() ? 'give your habit a name before continuing.'
      : step === 2 && !pet.trim() ? 'give your pet a name before continuing.' : '';
    if (message) { setError(message); AccessibilityInfo.announceForAccessibility(message); input.current?.focus(); return; }
    setError('');
    if (step < 2) { setStep(step + 1); return; }
    setBusy(true);
    try {
      await saving.current;
      finished.current = true;
      await startHabitPlan(habit, cadence, pet);
      router.replace('/(tabs)');
    } catch { finished.current = false; setError('could not start your plan. please try again.'); }
    finally { setBusy(false); }
  };

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.hint}>{step + 1} of 3</Text>
          {step > 0 && <Pressable accessibilityRole="button" disabled={busy} style={styles.link} onPress={() => { setError(''); setStep(step - 1); }}><Text style={styles.linkText}>back</Text></Pressable>}
        </View>
        <Text accessibilityRole="header" style={Type.screenTitle}>{['what do you want to keep doing?', 'how often?', 'meet noodle.'][step]}</Text>
        <Text style={Type.screenDescription}>{['pick one small thing. your pet will keep you company.', 'a little consistency. a very opinionated pet.', 'three hearts. one tiny commitment.'][step]}</Text>
        {step === 0 && <>
          <Text style={styles.label}>your habit</Text>
          <TextInput ref={input} accessibilityLabel="your habit" accessibilityHint="choose a concrete, achievable action" style={styles.input} value={habit} onChangeText={setHabit} maxLength={HABIT_NAME_MAX} placeholder="e.g. read 10 pages" placeholderTextColor={Colors.textMuted} returnKeyType="next" onSubmitEditing={() => void next()} />
          <Text style={styles.hint}>choose something concrete and achievable, like a few pages or a short walk.</Text>
          <View style={styles.suggestions}>{['read 10 pages', 'walk for 10 minutes', 'practice for 5 minutes'].map(value => <Pressable key={value} accessibilityRole="button" style={styles.option} onPress={() => { setHabit(value); setError(''); input.current?.focus(); }}><Text style={styles.optionText}>{value}</Text></Pressable>)}</View>
        </>}
        {step === 1 && <>
          <View style={styles.suggestions}>{CADENCE_OPTIONS.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: cadence === option.id }} style={[styles.option, cadence === option.id && styles.selected]} onPress={() => setCadence(option.id)}><Text style={[styles.optionText, cadence === option.id && styles.selectedText]}>{option.label}</Text></Pressable>)}</View>
          <Text style={styles.label}>{CADENCE_RULES[cadence]}</Text>
          <Text style={styles.body}>the clock starts when you tap “let’s start”. each real check-in resets it. it does not reset at midnight.</Text>
          <Text style={styles.hint}>if you start now, your first check-in is due {formatDeadline(firstDeadline(cadence, now))}.</Text>
        </>}
        {step === 2 && <>
          <View accessible accessibilityLabel="noodle, your pet, with three hearts" style={styles.pet}><LineArtPet mood="okay" strokeColor={prefs.petColor} displayHeight={200} hat={prefs.petHat} /><PetLives lives={3} color={prefs.petColor} size={32} /></View>
          <Text style={styles.label}>pet name</Text>
          <TextInput ref={input} accessibilityLabel="pet name" style={styles.input} value={pet} onChangeText={setPet} maxLength={40} returnKeyType="done" onSubmitEditing={() => void next()} />
          <View style={styles.rules}>
            <Text style={styles.body}>check in when you do your habit. each check-in restores all three hearts and resets the clock.</Text>
            <Text style={styles.body}>each missed interval costs one heart. three missed intervals in a row means your pet dies.</Text>
            <Text style={styles.label}>a restart costs {price.toLowerCase()}.</Text>
            {mock && <Text style={styles.hint}>this preview uses a test checkout. the paid restart on mobile uses the store price.</Text>}
            <Text style={styles.hint}>{CADENCE_RULES[cadence]} first check-in due {formatDeadline(firstDeadline(cadence, now))} if you start now.</Text>
          </View>
          <Text style={styles.hint}>starting your plan isn’t a check-in. tap “i did it” after your first real achievement.</Text>
        </>}
        {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} style={styles.primary} onPress={() => void next()}><Text style={styles.primaryText}>{busy ? 'saving...' : step === 2 ? 'let’s start' : 'next'}</Text></Pressable>
        {step === 0 && <Pressable accessibilityRole="button" style={styles.link} onPress={() => router.push('/auth')}><Text style={styles.linkText}>already have an account? sign in</Text></Pressable>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.stateTodoBg }, flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md, width: '100%', maxWidth: 680, alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontFamily: Slab.regular, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  body: { fontFamily: Slab.regular, fontSize: FontSize.md, color: Colors.ink, lineHeight: 26 },
  label: { fontFamily: Slab.bold, fontSize: FontSize.lg, color: Colors.ink },
  input: { backgroundColor: Colors.card, borderColor: Colors.ink, borderWidth: Border.thick, borderRadius: Radius.md, padding: Spacing.md, minHeight: 56, fontFamily: Slab.regular, fontSize: FontSize.md, color: Colors.ink },
  suggestions: { gap: Spacing.sm, marginVertical: Spacing.sm },
  option: { padding: Spacing.md, minHeight: 48, borderWidth: Border.base, borderColor: Colors.ink, borderRadius: Radius.md, backgroundColor: Colors.card },
  optionText: { fontFamily: Slab.bold, fontSize: FontSize.md, color: Colors.ink },
  selected: { backgroundColor: Colors.ink }, selectedText: { color: Colors.white },
  pet: { alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rules: { padding: Spacing.md, gap: Spacing.md, backgroundColor: Colors.card, borderWidth: Border.thick, borderRadius: Radius.lg, borderColor: Colors.ink },
  error: { fontFamily: Slab.bold, fontSize: FontSize.md, color: '#B00020' },
  primary: { marginTop: Spacing.sm, backgroundColor: Colors.ink, borderRadius: Radius.md, minHeight: 56, padding: Spacing.md, alignItems: 'center' },
  primaryText: { fontFamily: Slab.black, fontSize: FontSize.xl, color: Colors.white, textAlign: 'center' },
  link: { paddingVertical: Spacing.sm, minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Slab.bold, fontSize: FontSize.sm, color: Colors.ink, textDecorationLine: 'underline' },
});
