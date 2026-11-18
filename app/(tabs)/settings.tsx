import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppState } from '../../src/context';
import { useAuth } from '../../src/authContext';
import { CADENCE_RULES } from '../../src/onboarding';
import { CADENCE_OPTIONS, HABIT_NAME_MAX, PET_COLOR_OPTIONS, HabitCadence } from '../../src/types';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button, MonthChip, ScreenHeader, SelectionTile, TextField } from '../../src/design-system/Controls';
import { ColorOption } from '../../src/design-system/ColorOption';
import { PetStage } from '../../src/design-system/PetStage';
import { DesignType } from '../../src/design-system/tokens';

export default function SettingsScreen() {
  const { prefs, updatePrefs } = useAppState();
  const { user, signOut } = useAuth();
  const { focusHabit } = useLocalSearchParams<{ focusHabit?: string }>();
  const habitInput = useRef<TextInput>(null);
  const bottomPadding = useFloatingTabBarExtraPadding();
  const [habit, setHabit] = useState(prefs.habitName);
  const [name, setName] = useState(prefs.petName);
  const [color, setColor] = useState(prefs.petColor);
  const [cadence, setCadence] = useState<HabitCadence>(prefs.habitCadence);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  useEffect(() => { setHabit(prefs.habitName); setName(prefs.petName); setColor(prefs.petColor); setCadence(prefs.habitCadence); }, [prefs.habitName, prefs.petName, prefs.petColor, prefs.habitCadence]);
  useFocusEffect(useCallback(() => {
    if (focusHabit !== '1') return;
    const timer = setTimeout(() => { habitInput.current?.focus(); router.setParams({ focusHabit: undefined }); }, 150);
    return () => clearTimeout(timer);
  }, [focusHabit]));
  const save = async () => {
    if (saving.current) return;
    if (!name.trim() || !habit.trim()) { setError(!name.trim() ? 'Enter a name' : 'Enter a habit'); return; }
    saving.current = true; setBusy(true); setError('');
    try { await updatePrefs({ petName: name.trim(), habitName: habit.trim(), petColor: color, habitCadence: cadence }); router.navigate('/(tabs)'); }
    catch { setError('Could not save. Try again.'); }
    finally { saving.current = false; setBusy(false); }
  };
  const colors = PET_COLOR_OPTIONS.some(option => option.color.toLowerCase() === color.toLowerCase()) ? PET_COLOR_OPTIONS : [{ id: 'saved', color, label: 'Saved' }, ...PET_COLOR_OPTIONS];
  return <Page bottomPadding={bottomPadding + 24}>
    <ScreenHeader title="Set up" />
    <PetStage state="setup" name={name} showName color={color} />
    <View style={{ gap: 16 }}>
      <Text style={DesignType.label}>Colour</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Pet colour" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{colors.map(option => <ColorOption key={option.id} {...option} selected={color === option.color} disabled={busy} onPress={() => setColor(option.color)} />)}</View>
    </View>
    <View style={{ gap: 16, alignItems: 'flex-start' }}><Text style={DesignType.label}>Hair</Text><SelectionTile label="None" selected /></View>
    <View style={{ gap: 16, alignItems: 'flex-start' }}><Text style={DesignType.label}>Clothes</Text><SelectionTile label="None" selected /></View>
    <TextField label="Name" value={name} onChangeText={setName} maxLength={30} editable={!busy} error={error === 'Enter a name' ? error : undefined} />
    <TextField ref={habitInput} label="Habit" value={habit} onChangeText={setHabit} maxLength={HABIT_NAME_MAX} editable={!busy} error={error === 'Enter a habit' ? error : undefined} />
    <View style={{ gap: 8 }}>
      <Text style={DesignType.label}>Check In</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Check-in interval" style={{ gap: 8 }}>{CADENCE_OPTIONS.map(option => <MonthChip key={option.id} label={option.label} selected={cadence === option.id} accessibilityRole="radio" accessibilityState={{ checked: cadence === option.id }} disabled={busy} onPress={() => setCadence(option.id)} />)}</View>
      <Text style={DesignType.calendar}>{CADENCE_RULES[cadence]}</Text>
    </View>
    {error && !error.startsWith('Enter ') ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
    <Button label="Save" state={busy ? 'loading' : 'default'} onPress={() => void save()} />
    <View style={{ gap: 16 }}>
      <Text style={DesignType.label}>Account</Text>
      {user?.email ? <Text style={DesignType.calendar}>{user.email}</Text> : <Text style={DesignType.calendar}>Guest progress stays on this device.</Text>}
      <Button label={user ? 'Log out' : 'Save progress across devices'} appearance="secondary" onPress={async () => {
        try { if (user) { await signOut(); router.replace('/'); } else router.push('/auth'); }
        catch { setError('Could not log out. Try again.'); }
      }} />
    </View>
  </Page>;
}
