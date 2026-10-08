import { AppState as NativeAppState, Platform } from 'react-native';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TrackState,
  UserPrefs,
  CheckIn,
  TrackType,
  Intensity,
  Mood,
  ComputedHabit,
  PetMoodInfo,
  ALL_TRACKS,
  DEFAULT_HABIT_NAME,
  DEFAULT_PET_NAME,
  DEFAULT_PET_COLOR,
  DEFAULT_HABIT_CADENCE,
  habitCadenceToPeriodMs,
} from './types';
import { repositoryForUser } from './repository';
import { startPlan, hasProgress } from './onboarding';
import { HabitCadence } from './types';
import { UserSnapshot } from './sync';
import ProfileGate from './ProfileGate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pullUserSnapshot, pushUserSnapshot, canSyncToCloud, createUserSnapshot } from './sync';
import { useAuth } from './authContext';
import { processCheckIn, computeAllHabits, computePetMood, recomputeStreakFromCheckIns, recomputeCelebrationFromCheckIns } from './logic';
import { checkInEarnsCoupon } from './coupons';
import { syncPetStatusWidget } from './widgetSync';
import { consumePendingPaidRestart } from './purchases';
import * as Crypto from 'expo-crypto';

interface AppState {
  loading: boolean;
  prefs: UserPrefs;
  tracks: TrackState[];
  checkIns: CheckIn[];
  mood: Mood;
  lives: number;
  petMoodInfo: PetMoodInfo;
  computedHabits: ComputedHabit[];
  refresh: () => Promise<void>;
  doCheckIn: (trackType: TrackType, intensity: Intensity, note: string | null) => Promise<void>;
  collectCoupon: (checkInId: string) => Promise<void>;
  /** Set only right after a full-lives check-in — drives the coupon overlay once. */
  couponRevealCheckInId: string | null;
  deleteCheckInById: (id: string) => Promise<void>;
  updatePrefs: (prefs: Partial<UserPrefs>) => Promise<void>;
  resetAll: () => Promise<void>;
  startHabitPlan: (habit: string, cadence: HabitCadence, pet: string) => Promise<void>;
  syncNotice: string | null;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}

const TICK_INTERVAL_MS = 10_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut, passwordRecoveryPending } = useAuth();
  const identity = user?.id ?? null;
  const repo = useMemo(() => repositoryForUser(identity), [identity]);
  const [loadedIdentity, setLoadedIdentity] = useState<string | null | undefined>(undefined);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [choice, setChoice] = useState<UserSnapshot | null>(null);
  const [retry, setRetry] = useState(0);
  const syncReady = useRef(false);
  const planStartedRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<UserPrefs>({
    petType: 'dino',
    onboardingDone: false,
    customSprite: null,
    habitName: DEFAULT_HABIT_NAME,
    petName: DEFAULT_PET_NAME,
    petColor: DEFAULT_PET_COLOR,
    petHat: 'none',
    habitCadence: DEFAULT_HABIT_CADENCE,
  });
  const [tracks, setTracks] = useState<TrackState[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [mood, setMood] = useState<Mood>('okay');
  const [lives, setLives] = useState<number>(3);
  const [petMoodInfo, setPetMoodInfo] = useState<PetMoodInfo>({ mood: 'okay', reason: '', lives: 3 });
  const [computedHabits, setComputedHabits] = useState<ComputedHabit[]>([]);
  const [couponRevealCheckInId, setCouponRevealCheckInId] = useState<string | null>(null);
  const [offlineChoice, setOfflineChoice] = useState<UserSnapshot | null>(null);
  const tracksRef = useRef<TrackState[]>([]);
  const moodRef = useRef<Mood>('okay');
  const habitNameRef = useRef<string>(DEFAULT_HABIT_NAME);
  const habitCadenceRef = useRef(habitCadenceToPeriodMs(DEFAULT_HABIT_CADENCE));

  const recompute = useCallback((currentTracks: TrackState[]) => {
    const nowMs = Date.now();
    // Always evaluate the main habit — empty tracks would otherwise blank the home card.
    const tracks =
      currentTracks.length > 0
        ? currentTracks
        : ALL_TRACKS.map((trackType) => ({
            trackType,
            level: 50,
            lastCheckInAt: null as string | null,
            streak: 0,
            lastCompletedDay: null as string | null,
            celebrationCount: 0,
            celebrationPaidStart: false,
          }));
    if (currentTracks.length === 0) {
      tracksRef.current = tracks;
    }
    const habits = computeAllHabits(tracks, nowMs, habitCadenceRef.current, planStartedRef.current);
    const moodInfo = computePetMood(habits, habitNameRef.current);
    setComputedHabits(habits);
    moodRef.current = moodInfo.mood;
    setMood(moodInfo.mood);
    setLives(moodInfo.lives);
    setPetMoodInfo(moodInfo);

    const lastCheckInAt = habits[0]?.lastCheckInAt ?? planStartedRef.current;
    void syncPetStatusWidget(moodInfo.mood, lastCheckInAt, habitCadenceRef.current);
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!identity || identity.startsWith('local-') || !canSyncToCloud() || !syncReady.current) return;
    try {
      const snapshot = await repo.exportSnapshot();
      await AsyncStorage.setItem(`tamagotchi_sync_pending_${identity}`, 'true');
      await pushUserSnapshot(identity, snapshot);
      await AsyncStorage.removeItem(`tamagotchi_sync_pending_${identity}`);
      setSyncNotice(null);
    } catch {
      setSyncNotice('progress is saved on this device. cloud sync could not finish.');
    }
  }, [identity, repo]);

  const refresh = useCallback(async () => {
    const [p, rawTracks, ci] = await Promise.all([
      repo.getUserPrefs(),
      repo.getAllTrackStates(),
      repo.getAllCheckIns(),
    ]);

    tracksRef.current = rawTracks;
    habitNameRef.current = p.habitName || DEFAULT_HABIT_NAME;
    habitCadenceRef.current = habitCadenceToPeriodMs(p.habitCadence);
    planStartedRef.current = p.planStartedAt ?? null;
    setPrefs(p);
    setTracks(rawTracks);
    setCheckIns(ci);
    recompute(rawTracks);
  }, [recompute, repo]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    setChoice(null);
    setOfflineChoice(null);
    setSyncNotice(null);
    setLoadError(null);
    setCouponRevealCheckInId(null);
    syncReady.current = false;
    (async () => {
      try {
        const account = await repo.exportSnapshot();
        if (cancelled) return;
        const cloud = identity && !identity.startsWith('local-') && canSyncToCloud();
        const remote = cloud ? await pullUserSnapshot(identity!) : null;
        if (cancelled) return;
        if (identity) {
          const pending = await AsyncStorage.getItem(`tamagotchi_sync_pending_${identity}`);
          if (cancelled) return;
          if (pending && remote) {
            setOfflineChoice(account);
            setChoice(remote);
            return;
          }
          if (remote && !(account.prefs.onboardingDraft && !hasProgress(remote))) {
            // Keep the pre-pull local copy recoverable if it includes offline edits.
            await AsyncStorage.setItem(`tamagotchi_account_backup_${identity}`, JSON.stringify(account));
            if (cancelled) return;
            await repo.importSnapshot(remote);
          } else if (cloud && !remote && hasProgress(account)) {
            if (!(await createUserSnapshot(identity!, account))) {
              if (!cancelled) setRetry(value => value + 1);
              return;
            }
            await AsyncStorage.removeItem(`tamagotchi_sync_pending_${identity}`);
          }
        }
        if (cancelled) return;
        await refresh();
        if (cancelled) return;
        syncReady.current = true;
        setLoadedIdentity(identity);
        setLoading(false);
      } catch {
        if (!cancelled) setLoadError('could not load your account. your local progress is safe. reconnect and try again.');
      }
    })();
    return () => { cancelled = true; syncReady.current = false; };
  }, [identity, authLoading, repo, refresh, retry, syncToCloud]);

  const useAccountProgress = async () => {
    if (!choice) return;
    try {
      await AsyncStorage.setItem(`tamagotchi_account_backup_${identity}`, JSON.stringify(await repo.exportSnapshot()));
      await repo.importSnapshot(choice);
      await AsyncStorage.removeItem(`tamagotchi_sync_pending_${identity}`);
      await refresh();
      setChoice(null);
      setOfflineChoice(null);
      syncReady.current = true;
      setLoadedIdentity(identity);
      setLoading(false);
      setSyncNotice('using your account progress. a backup of your device progress is kept on this device.');
    } catch { setLoadError('could not switch profiles. your saved progress has been kept. try again.'); }
  };

  useEffect(() => {
    const tick = () => recompute(tracksRef.current);
    const id = setInterval(tick, TICK_INTERVAL_MS);
    const subscription = NativeAppState.addEventListener('change', state => {
      if (state === 'active') tick();
    });
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
    };
  }, [recompute]);

  const markPending = useCallback(async () => {
    if (identity && !identity.startsWith('local-') && canSyncToCloud())
      await AsyncStorage.setItem(`tamagotchi_sync_pending_${identity}`, 'true');
  }, [identity]);

  const doCheckIn = useCallback(
    async (trackType: TrackType, intensity: Intensity, note: string | null) => {
      if (loading || loadedIdentity !== identity || !prefs.onboardingDone) throw new Error('your plan is still loading. try again.');
      const now = new Date();
      const state = tracksRef.current.find((t) => t.trackType === trackType);
      if (!state) return;

      const currentHabits = computeAllHabits(tracksRef.current, now.getTime(), habitCadenceRef.current, planStartedRef.current);
      const restartingFromDeath = computePetMood(currentHabits, habitNameRef.current).mood === 'dead';
      let isPaidRestart = false;
      if (restartingFromDeath) {
        const paid = await consumePendingPaidRestart();
        if (!paid) {
          throw new Error('payment required to start again');
        }
        isPaidRestart = true;
      }

      const habits = computeAllHabits(tracksRef.current, now.getTime(), habitCadenceRef.current, planStartedRef.current);
      const livesBeforeCheckIn = computePetMood(habits, habitNameRef.current).lives;
      const couponEarned = checkInEarnsCoupon(livesBeforeCheckIn, isPaidRestart);

      const newCheckIn: CheckIn = {
        id: Crypto.randomUUID(),
        trackType,
        intensity,
        note,
        timestamp: now.toISOString(),
        isPaidRestart,
        couponEarned,
        couponCollected: couponEarned ? false : true,
      };

      const updatedState = processCheckIn(state, intensity, now, isPaidRestart);

      await markPending();
      await repo.insertCheckIn(newCheckIn);
      await repo.updateTrackState(updatedState);
      await refresh();
      await syncToCloud();

      if (couponEarned) {
        setCouponRevealCheckInId(newCheckIn.id);
      }
    },
    [refresh, syncToCloud, repo, markPending, loading, loadedIdentity, identity, prefs.onboardingDone]
  );

  const collectCoupon = useCallback(
    async (checkInId: string) => {
      await markPending();
      await repo.markCouponCollected(checkInId);
      setCouponRevealCheckInId(null);
      await refresh();
      await syncToCloud();
    },
    [refresh, syncToCloud, repo, markPending],
  );

  const deleteCheckInById = useCallback(
    async (id: string) => {
      await markPending();
      const deleted = await repo.deleteCheckIn(id);
      if (!deleted) return;

      const trackType = deleted.trackType;
      const remaining = await repo.getCheckInsForTrack(trackType);
      const { streak, lastCompletedDay } = recomputeStreakFromCheckIns(remaining);
      const { celebrationCount, celebrationPaidStart } =
        recomputeCelebrationFromCheckIns(remaining);

      const current = await repo.getTrackState(trackType);
      const lastCheckIn = remaining.length > 0 ? remaining[remaining.length - 1].timestamp : null;

      await repo.updateTrackState({
        ...current,
        level: current.level,
        streak,
        lastCompletedDay,
        lastCheckInAt: lastCheckIn,
        celebrationCount,
        celebrationPaidStart,
      });

      await refresh();
      await syncToCloud();
    },
    [refresh, syncToCloud, repo, markPending]
  );

  const updatePrefs = useCallback(
    async (partial: Partial<UserPrefs>) => {
      const draftOnly = Object.keys(partial).every(key => key === 'onboardingDraft');
      if (!draftOnly) await markPending();
      await repo.updateUserPrefs(partial);
      setPrefs((prev) => {
        const next = { ...prev, ...partial };
        if (partial.planStartedAt !== undefined) planStartedRef.current = partial.planStartedAt;
        if (partial.habitName !== undefined) {
          habitNameRef.current = next.habitName || DEFAULT_HABIT_NAME;
        }
        if (partial.habitCadence !== undefined) {
          habitCadenceRef.current = habitCadenceToPeriodMs(next.habitCadence);
        }
        if (partial.habitName !== undefined || partial.habitCadence !== undefined || partial.planStartedAt !== undefined) {
          recompute(tracksRef.current);
        }
        return next;
      });
      if (!draftOnly) await syncToCloud();
    },
    [recompute, syncToCloud, repo, markPending]
  );

  const resetAll = useCallback(async () => {
    await markPending();
    await repo.resetAllData();
    setCouponRevealCheckInId(null);
    await refresh();
    await syncToCloud();
  }, [refresh, syncToCloud, repo, markPending]);

  const useOfflineProgress = async () => {
    if (!offlineChoice) return;
    await repo.importSnapshot(offlineChoice);
    await refresh();
    setChoice(null);
    setOfflineChoice(null);
    syncReady.current = true;
    setLoadedIdentity(identity);
    setLoading(false);
    await syncToCloud();
  };

  const startHabitPlan = async (habit: string, cadence: HabitCadence, pet: string) => {
    if (prefs.onboardingDone) return;
    await updatePrefs(startPlan(prefs, habit, cadence, pet, new Date()));
    await refresh();
  };

  if ((choice || loadError) && !passwordRecoveryPending) return <ProfileGate error={loadError} hasChoice={Boolean(choice)} offlineConflict={Boolean(offlineChoice)} onLocal={useOfflineProgress}
    onAccount={useAccountProgress} onRetry={() => { setLoadError(null); setRetry(v => v + 1); }}
    onGuest={signOut} />;

  return (
    <AppContext.Provider
      value={{
        loading: authLoading || loading || loadedIdentity !== identity,
        startHabitPlan,
        syncNotice,
        prefs,
        tracks,
        checkIns,
        mood,
        lives,
        petMoodInfo,
        computedHabits,
        refresh,
        doCheckIn,
        collectCoupon,
        couponRevealCheckInId,
        deleteCheckInById,
        updatePrefs,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
