import React, { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/authContext';
import { useAppState } from '../../src/context';
import { DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { formatLifeTimer } from '../../src/logic';
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
import CouponRewardOverlay from '../../src/CouponRewardOverlay';
import { findCouponForReveal } from '../../src/coupons';

export default function HomeScreen() {
  const { prefs, computedHabits, tracks, mood, lives, refresh, doCheckIn, checkIns, collectCoupon, couponRevealCheckInId, updatePrefs, syncNotice } = useAppState();
  const { user, isConfigured } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [restartVisible, setRestartVisible] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState<CheckInConfirmCopy | null>(null);
  const [outcome, setOutcome] = useState<'success' | 'not-yet' | null>(null);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const [showLives, setShowLives] = useState(false);
  const bottomPadding = useFloatingTabBarExtraPadding();
  const habit = computedHabits[0];
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petName = prefs.petName.trim();
  const track = tracks.find(item => item.trackType === MAIN_TRACK);
  const pendingCoupon = findCouponForReveal(checkIns, couponRevealCheckInId);
  const stage: PetStageState = mood === 'dead' || mood === 'sad' ? 'missed'
    : mood === 'happy' && !celebrationDismissed ? (track && track.celebrationCount > 1 ? 'double-success' : 'success') : 'idle';
  const title = outcome === 'not-yet' ? 'one step at a time.' : mood === 'dead' ? 'time to start again.'
    : stage === 'double-success' ? 'double success!\nkeep going.' : stage === 'success' ? 'you did it!\nkeep going.'
      : stage === 'missed' ? 'missed an interval.\ntry again.' : prefs.habitCadence === 'daily' ? 'did you manage today?' : 'did you manage your goal?';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refresh(); } catch { setError('could not refresh. try again.'); }
    finally { setRefreshing(false); }
  }, [refresh]);
  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(null); setConfirmCopy(null);
    try { await doCheckIn(MAIN_TRACK, 'medium', null); setCelebrationDismissed(false); setOutcome('success'); }
    catch (e) { setError(e instanceof Error ? e.message.toLowerCase() : 'could not save your check-in. try again.'); }
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
      <ScreenHeader title={`day ${planDayNumber(prefs.planStartedAt, checkIns)}`} />
      {prefs.petType === 'selfie' && prefs.customSprite ? <View style={styles.selfie}><PixelPet petType="selfie" mood={mood} customSprite={prefs.customSprite} color={prefs.petColor} pixelSize={7} /></View>
        : <PetStage state={stage} color={prefs.petColor} name={petName} />}
      <Pressable onPress={() => router.navigate('/(tabs)/settings?focusHabit=1')} accessibilityRole="button" accessibilityLabel={`edit goal: ${habitName}`}>
        <Feedback title={title} goal={`goal: ${habitName}`} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={DesignType.supporting}>{error}</Text> : null}
      {syncNotice ? <Text accessibilityLiveRegion="polite" style={DesignType.calendar}>{syncNotice}</Text> : null}
      {outcome || stage === 'success' || stage === 'double-success' ? <Button label="continue" onPress={() => { setOutcome(null); setCelebrationDismissed(true); }} />
        : mood === 'dead' ? <Button label="start again" onPress={beginCheckIn} state={busy ? 'loading' : 'default'} />
          : <CheckInActions onNegative={() => setOutcome('not-yet')} onPositive={beginCheckIn} state={busy ? 'submitting' : 'ready'} />}
      <View style={styles.lifeInfo}>
        <Pressable accessibilityRole="button" accessibilityLabel={showLives ? 'hide lives info' : 'show lives info'} accessibilityState={{ expanded: showLives }} style={styles.details} onPress={() => setShowLives(value => !value)}>
          <Text style={DesignType.calendar}>{lives} {lives === 1 ? 'heart' : 'hearts'} · {showLives ? 'hide details' : 'details'}</Text>
        </Pressable>
        {showLives && <Text style={DesignType.supporting}>{mood === 'dead' ? 'all three hearts are gone. restart to check in again.' : habit?.nextDeadlineAt ? `${formatLifeTimer(habit.timeRemainingMs)} until the next heart is lost. each check-in refills three hearts.` : 'three hearts. your first check-in starts the next interval.'}</Text>}
      </View>
      {!user && isConfigured && checkIns.length > 0 && !prefs.accountPromptDismissed && !pendingCoupon && <View style={styles.account}>
        <Text style={DesignType.supporting}>save your progress across devices.</Text>
        <Button label="save my progress" onPress={() => router.push('/auth')} />
        <Button label="later" appearance="secondary" onPress={() => void updatePrefs({ accountPromptDismissed: true })} />
      </View>}
    </Page>
    <RestartPaywall visible={restartVisible} onClose={() => setRestartVisible(false)} onUnlocked={async () => { setRestartVisible(false); await submit(); }} />
    <CheckInConfirmModal visible={Boolean(confirmCopy)} copy={confirmCopy} onConfirm={() => void submit()} onCancel={() => setConfirmCopy(null)} />
    <CouponRewardOverlay visible={Boolean(pendingCoupon)} pendingCheckIn={pendingCoupon} checkIns={checkIns} onCollected={collectCoupon} />
  </>;
}
const styles = StyleSheet.create({ selfie: { height: 438, alignItems: 'center', justifyContent: 'center' }, lifeInfo: { gap: 8 }, details: { minHeight: 44, justifyContent: 'center' }, account: { gap: 16 } });
