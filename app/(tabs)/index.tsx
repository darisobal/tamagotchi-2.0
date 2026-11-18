import { ResponsiveText as Text, useDesignScale } from '../../src/design-system/ResponsiveText';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/authContext';
import { useAppState } from '../../src/context';
import { DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { planDayNumber } from '../../src/calendar';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button, CheckInActions, Feedback, ScreenHeader } from '../../src/design-system/Controls';
import { PetStage, PetStageState } from '../../src/design-system/PetStage';
import { DesignType, Palette } from '../../src/design-system/tokens';
import PixelPet from '../../src/PixelPet';
import RestartPaywall from '../../src/RestartPaywall';
import CheckInConfirmModal from '../../src/CheckInConfirmModal';
import { CheckInConfirmCopy, pickCheckInConfirmCopy } from '../../src/checkInConfirmCopy';

export default function HomeScreen() {
  const scale = useDesignScale();
  const { prefs, tracks, mood, refresh, doCheckIn, checkIns, updatePrefs, syncNotice } = useAppState();
  const { user, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [restartVisible, setRestartVisible] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState<CheckInConfirmCopy | null>(null);
  const [outcome, setOutcome] = useState<'success' | 'not-yet' | null>(null);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const bottomPadding = useFloatingTabBarExtraPadding();
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petName = prefs.petName.trim();
  const track = tracks.find(item => item.trackType === MAIN_TRACK);
  const stage: PetStageState = mood === 'dead' || mood === 'sad' ? 'missed'
    : mood === 'happy' && !celebrationDismissed ? (track && track.celebrationCount > 1 ? 'double-success' : 'success') : 'idle';
  const title = outcome === 'not-yet' ? 'One step at a time.' : mood === 'dead' ? 'Time to start again.'
    : stage === 'double-success' ? 'DOUBLE Success!\nKeep going!' : stage === 'success' ? 'You’re real gangsta!\nWooooooop!'
      : stage === 'missed' ? 'Nu ty i LOX! SHAME\non you!' : prefs.habitCadence === 'daily' ? 'Did you manage today?' : 'Did you manage your goal?';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresh(); } catch { setError('Could not refresh. Try again.'); }
    finally { setRefreshing(false); }
  }, [refresh]);
  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(null); setConfirmCopy(null);
    try { await doCheckIn(MAIN_TRACK, 'medium', null); setCelebrationDismissed(false); setOutcome('success'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save your check-in. Try again.'); }
    finally { submitting.current = false; setBusy(false); }
  }, [doCheckIn]);
  const beginCheckIn = () => {
    if (submitting.current) return;
    setError(null);
    if (mood === 'dead') setRestartVisible(true);
    else setConfirmCopy(pickCheckInConfirmCopy());
  };

  return <>
    <Page bottomPadding={bottomPadding + 24} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.black} />}>
      <ScreenHeader title={`Day ${planDayNumber(prefs.planStartedAt, checkIns)}`} />
      {prefs.petType === 'selfie' && prefs.customSprite ? <View style={styles.selfie}><PixelPet petType="selfie" mood={mood} customSprite={prefs.customSprite} color={prefs.petColor} pixelSize={7} /></View>
        : <PetStage state={stage} color={prefs.petColor} name={petName} />}
      <Pressable style={{ marginTop: (stage === 'idle' ? -14 : 12) * scale, marginBottom: (stage === 'idle' ? -12 : 20) * scale }} onPress={() => router.navigate('/(tabs)/settings?focusHabit=1')} accessibilityRole="button" accessibilityLabel={`Edit goal: ${habitName}`}>
        <Feedback surface={stage === 'idle' ? 'card' : 'plain'} title={title} goal={`Goal: ${habitName}`} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
      {syncNotice ? <Text accessibilityLiveRegion="polite" style={DesignType.calendar}>{syncNotice}</Text> : null}
      {outcome || stage === 'success' || stage === 'double-success' ? <Button label="Continue" onPress={() => { setOutcome(null); setCelebrationDismissed(true); }} />
        : mood === 'dead' ? <Button label="Start again" onPress={beginCheckIn} state={busy ? 'loading' : 'default'} />
          : <CheckInActions negative="Ja lox" positive="I did it" onNegative={() => setOutcome('not-yet')} onPositive={beginCheckIn} state={busy ? 'submitting' : 'ready'} />}
      {!user && isConfigured && checkIns.length > 0 && !prefs.accountPromptDismissed && <View style={styles.account}>
        <Text style={DesignType.supporting}>Save your progress across devices.</Text>
        <Button label="Save my progress" onPress={() => router.push('/auth')} />
        <Button label="Later" appearance="secondary" onPress={() => void updatePrefs({ accountPromptDismissed: true })} />
      </View>}
    </Page>
    <RestartPaywall visible={restartVisible} onClose={() => setRestartVisible(false)} onUnlocked={async () => { setRestartVisible(false); await submit(); }} />
    <CheckInConfirmModal visible={Boolean(confirmCopy)} copy={confirmCopy} onConfirm={() => void submit()} onCancel={() => setConfirmCopy(null)} />
  </>;
}
const styles = StyleSheet.create({ selfie: { height: 438, alignItems: 'center', justifyContent: 'center' }, account: { gap: 16 } });
