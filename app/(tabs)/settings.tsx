import { ResponsiveText as Text, useDesignScale } from '../../src/design-system/ResponsiveText';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppState } from '../../src/context';
import { useAuth } from '../../src/authContext';
import { CADENCE_RULES } from '../../src/onboarding';
import { CADENCE_OPTIONS, HABIT_NAME_MAX, PET_COLOR_OPTIONS, HabitCadence } from '../../src/types';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button, ScreenHeader, SelectionOption, SelectionTile, TextField } from '../../src/design-system/Controls';
import { ColorOption } from '../../src/design-system/ColorOption';
import { PetStage } from '../../src/design-system/PetStage';
import { DesignType } from '../../src/design-system/tokens';

export default function SettingsScreen() {
  const scale = useDesignScale();
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
    <View style={{ gap: 36 * scale, marginTop: 12 * scale }}>
    <TextField label="Name" value={name} onChangeText={setName} maxLength={30} editable={!busy} error={error === 'Enter a name' ? error : undefined} />
    <View style={{ gap: 16 * scale }}>
      <Text style={DesignType.label}>Colour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: -24 }} contentContainerStyle={{ gap: 12 * scale, paddingRight: 24 }}><View accessibilityRole="radiogroup" accessibilityLabel="Pet colour" style={{ flexDirection: 'row', gap: 12 * scale }}>{colors.map(option => <ColorOption key={option.id} {...option} selected={color === option.color} disabled={busy} onPress={() => setColor(option.color)} />)}</View></ScrollView>
    </View>
    <View style={{ gap: 16 * scale, alignItems: 'flex-start' }}><Text style={DesignType.label}>Hair</Text><SelectionTile label="None" selected /></View>
    <View style={{ gap: 16 * scale, alignItems: 'flex-start' }}><Text style={DesignType.label}>Clothes</Text><SelectionTile label="None" selected /></View>
    <TextField ref={habitInput} label="Habit" value={habit} onChangeText={setHabit} maxLength={HABIT_NAME_MAX} editable={!busy} error={error === 'Enter a habit' ? error : undefined} />
    <View style={{ gap: 16 * scale }}>
      <Text style={DesignType.label}>Check in every</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Check in every" style={{ flexDirection: 'row', gap: 12 * scale }}>
        {CADENCE_OPTIONS.map(option => <SelectionOption key={option.id} label={{ daily: '24h', every2days: '48h', weekly: 'Weekly' }[option.id]} style={{ flex: 1, paddingHorizontal: 4 * scale }} selected={cadence === option.id} accessibilityHint={CADENCE_RULES[option.id]} accessibilityState={{ checked: cadence === option.id }} disabled={busy} onPress={() => setCadence(option.id)} />)}
      </View>
    </View>
    {error && !error.startsWith('Enter ') ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
    <Button label="Save" state={busy ? 'loading' : 'default'} onPress={() => void save()} />
    </View>
    <View style={{ gap: 16 * scale }}>
      <Text style={DesignType.label}>Account</Text>
      {user?.email ? <Text style={DesignType.calendar}>{user.email}</Text> : <Text style={DesignType.calendar}>Guest progress stays on this device.</Text>}
      <Button label={user ? 'Log out' : 'Save progress across devices'} appearance="secondary" onPress={async () => {
        try { if (user) { await signOut(); router.replace('/'); } else router.push('/auth'); }
        catch { setError('Could not log out. Try again.'); }
      }} />
    </View>
  </Page>;
}
