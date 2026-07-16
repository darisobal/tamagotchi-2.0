import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  TrackState,
  UserPrefs,
  CheckIn,
  TrackType,
  Intensity,
  Mood,
  ComputedHabit,
  PetMoodInfo,
  DEFAULT_HABIT_NAME,
  DEFAULT_PET_NAME,
  DEFAULT_PET_COLOR,
  DEFAULT_HABIT_CADENCE,
  habitCadenceToPeriodMs,
} from './types';
import * as repo from './repository';
import { pullUserSnapshot, pushUserSnapshot, canSyncToCloud } from './sync';
import { useAuth } from './authContext';
import { processCheckIn, computeAllHabits, computePetMood, recomputeStreakFromCheckIns } from './logic';
import { syncPetStatusWidget } from './widgetSync';
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
  deleteCheckInById: (id: string) => Promise<void>;
  updatePrefs: (prefs: Partial<UserPrefs>) => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}

const TICK_INTERVAL_MS = 10_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<UserPrefs>({
    petType: 'dino',
    onboardingDone: true,
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
  const userIdRef = useRef<string | null>(null);
  const tracksRef = useRef<TrackState[]>([]);
  const habitNameRef = useRef<string>(DEFAULT_HABIT_NAME);
  const habitCadenceRef = useRef(habitCadenceToPeriodMs(DEFAULT_HABIT_CADENCE));

  const recompute = useCallback((currentTracks: TrackState[]) => {
    const nowMs = Date.now();
    const habits = computeAllHabits(currentTracks, nowMs, habitCadenceRef.current);
    const moodInfo = computePetMood(habits, habitNameRef.current);
    setComputedHabits(habits);
    setMood(moodInfo.mood);
    setLives(moodInfo.lives);
    setPetMoodInfo(moodInfo);

    const lastCheckInAt = habits[0]?.lastCheckInAt ?? null;
    void syncPetStatusWidget(moodInfo.mood, lastCheckInAt, habitCadenceRef.current);
  }, []);

  const syncToCloud = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId || !canSyncToCloud()) return;
    const snapshot = await repo.exportSnapshot();
    await pushUserSnapshot(userId, snapshot);
  }, []);

  const refresh = useCallback(async () => {
    const [p, rawTracks, ci] = await Promise.all([
      repo.getUserPrefs(),
      repo.getAllTrackStates(),
      repo.getAllCheckIns(),
    ]);

    tracksRef.current = rawTracks;
    habitNameRef.current = p.habitName || DEFAULT_HABIT_NAME;
    habitCadenceRef.current = habitCadenceToPeriodMs(p.habitCadence);
    setPrefs(p);
    setTracks(rawTracks);
    setCheckIns(ci);
    recompute(rawTracks);
  }, [recompute]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      repo.setActiveStorageUser(user.id);
      userIdRef.current = user.id;

      if (canSyncToCloud()) {
        const remote = await pullUserSnapshot(user.id);
        if (remote && !cancelled) {
          await repo.importSnapshot(remote);
        }
      }

      if (!cancelled) {
        await refresh();
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      recompute(tracksRef.current);
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [recompute]);

  const doCheckIn = useCallback(
    async (trackType: TrackType, intensity: Intensity, note: string | null) => {
      const now = new Date();
      const state = tracksRef.current.find((t) => t.trackType === trackType);
      if (!state) return;

      const newCheckIn: CheckIn = {
        id: Crypto.randomUUID(),
        trackType,
        intensity,
        note,
        timestamp: now.toISOString(),
      };

      const updatedState = processCheckIn(state, intensity, now);

      await repo.insertCheckIn(newCheckIn);
      await repo.updateTrackState(updatedState);
      await refresh();
      await syncToCloud();
    },
    [refresh, syncToCloud]
  );

  const deleteCheckInById = useCallback(
    async (id: string) => {
      const deleted = await repo.deleteCheckIn(id);
      if (!deleted) return;

      const trackType = deleted.trackType;
      const remaining = await repo.getCheckInsForTrack(trackType);
      const { streak, lastCompletedDay } = recomputeStreakFromCheckIns(remaining);

      const current = await repo.getTrackState(trackType);
      const lastCheckIn = remaining.length > 0 ? remaining[remaining.length - 1].timestamp : null;

      await repo.updateTrackState({
        ...current,
        level: current.level,
        streak,
        lastCompletedDay,
        lastCheckInAt: lastCheckIn,
      });

      await refresh();
      await syncToCloud();
    },
    [refresh, syncToCloud]
  );

  const updatePrefs = useCallback(
    async (partial: Partial<UserPrefs>) => {
      await repo.updateUserPrefs(partial);
      setPrefs((prev) => {
        const next = { ...prev, ...partial };
        if (partial.habitName !== undefined) {
          habitNameRef.current = next.habitName || DEFAULT_HABIT_NAME;
        }
        if (partial.habitCadence !== undefined) {
          habitCadenceRef.current = habitCadenceToPeriodMs(next.habitCadence);
        }
        if (partial.habitName !== undefined || partial.habitCadence !== undefined) {
          recompute(tracksRef.current);
        }
        return next;
      });
      await syncToCloud();
    },
    [recompute, syncToCloud]
  );

  const resetAll = useCallback(async () => {
    await repo.resetAllData();
    await refresh();
    await syncToCloud();
  }, [refresh, syncToCloud]);

  return (
    <AppContext.Provider
      value={{
        loading,
        prefs,
        tracks,
        checkIns,
        mood,
        lives,
        petMoodInfo,
        computedHabits,
        refresh,
        doCheckIn,
        deleteCheckInById,
        updatePrefs,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
