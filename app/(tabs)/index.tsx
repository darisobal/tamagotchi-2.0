import { advanceClock, localDay, formatHabitTimer } from '../../src/habitClock';
import { ResponsiveText as Text, useDesignScale } from '../../src/design-system/ResponsiveText';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/authContext';
import { useAppState } from '../../src/context';
import { DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { successStageForDay } from '../../src/homeFeedback';
import { planDayNumber } from '../../src/calendar';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import { Page } from '../../src/design-system/Page';
import { Button, CheckInActions, Feedback, ScreenHeader } from '../../src/design-system/Controls';
import { PetStage, PetStageState } from '../../src/design-system/PetStage';
import { DesignType, Palette } from '../../src/design-system/tokens';
import PixelPet from '../../src/PixelPet';
import RestartPaywall from '../../src/RestartPaywall';

export default function HomeScreen() {
  const scale = useDesignScale();
  const { prefs, mood, refresh, doCheckIn, doFail, tracks, now, checkIns, updatePrefs, syncNotice } = useAppState();
  const { user, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const pageRef = useRef<ScrollView>(null);
  const [restartVisible, setRestartVisible] = useState(false);
  const clock = tracks[0]?.habitClock ? advanceClock(tracks[0].habitClock, now) : null;
  const today = localDay(now);
  const celebrating = clock?.rewardedDay === today && mood !== 'dead';
  const notYet = !celebrating && clock?.lastFailureDay === today;
  const failures = clock?.failures ?? 0;
  const timer = formatHabitTimer(mood === 'dead' ? 0 : Math.max(0, (clock?.deadlineAt ?? now) - now));
  const bottomPadding = useFloatingTabBarExtraPadding();
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petName = prefs.petName.trim();
  const stage: PetStageState = !celebrating && failures > 0 ? 'missed'
    : celebrating ? successStageForDay(checkIns) : 'idle';
  const title = mood === 'dead' ? 'Time to start again.'
    : notYet ? 'Nu ty i LOX!\nSHAME\non you!'
    : celebrating ? (stage === 'double-success' ? 'DOUBLE\nSuccess!\nKeep going!' : 'You’re real\ngangsta!\nWooooooop!')
    : 'Did you manage today?';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresh(); } catch { setError('Could not refresh. Try again.'); }
    finally { setRefreshing(false); }
  }, [refresh]);
  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(null);
    try { await doCheckIn(MAIN_TRACK, 'medium', null); pageRef.current?.scrollTo({ y: 0, animated: false }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save your check-in. Try again.'); }
    finally { submitting.current = false; setBusy(false); }
  }, [doCheckIn]);
  const fail = async () => {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError(null);
    try { await doFail(); pageRef.current?.scrollTo({ y: 0, animated: false }); }
    catch { setError('Could not save this result. Try again.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  const beginCheckIn = () => {
    if (submitting.current) return;
    setError(null);
    if (mood === 'dead') setRestartVisible(true);
    else void submit();
  };

  return <>
    <Page ref={pageRef} bottomPadding={bottomPadding + 24} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.black} />}>
      <ScreenHeader title={`Day ${planDayNumber(prefs.planStartedAt, checkIns)}`} />
      {failures === 0 && !celebrating && prefs.petType === 'selfie' && prefs.customSprite ? <View style={styles.selfie}><PixelPet petType="selfie" mood={mood} customSprite={prefs.customSprite} color={prefs.petColor} pixelSize={7} /></View>
        : <PetStage failures={failures} timer={timer} hair={prefs.petHair} clothes={prefs.petClothes} state={stage} color={prefs.petColor} name={petName} />}
      {stage !== 'idle' && mood !== 'dead' ? <Text style={[DesignType.calendar, { textAlign: 'center', fontSize: 16, lineHeight: 22 }]}>{timer}</Text> : null}
      <Pressable style={{ marginTop: (stage === 'idle' ? -70 : 12) * scale, marginBottom: ((notYet || celebrating) ? 20 : -12) * scale }} onPress={() => router.navigate('/(tabs)/settings?focusHabit=1')} accessibilityRole="button" accessibilityLabel={`Edit goal: ${habitName}`}>
        <Feedback surface={notYet || celebrating ? 'plain' : 'card'} title={title} goal={`Goal: ${habitName}`} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
      {syncNotice ? <Text accessibilityLiveRegion="polite" style={DesignType.calendar}>{syncNotice}</Text> : null}
      {celebrating ? null
        : mood === 'dead' ? <Button label="Start again" onPress={beginCheckIn} state={busy ? 'loading' : 'default'} />
        : <CheckInActions negative="Ja lox" positive="I did it" onNegative={() => void fail()} onPositive={beginCheckIn} state={busy ? 'submitting' : 'ready'} />}
      {!user && isConfigured && checkIns.length > 0 && !prefs.accountPromptDismissed && <View style={styles.account}>
        <Text style={DesignType.supporting}>Save your progress across devices.</Text>
        <Button label="Save my progress" onPress={() => router.push('/auth')} />
        <Button label="Later" appearance="secondary" onPress={() => void updatePrefs({ accountPromptDismissed: true })} />
      </View>}
    </Page>
    <RestartPaywall visible={restartVisible} onClose={() => setRestartVisible(false)} onUnlocked={async () => { setRestartVisible(false); await submit(); }} />
  </>;
}
const styles = StyleSheet.create({ selfie: { height: 438, alignItems: 'center', justifyContent: 'center' }, account: { gap: 16 } });
