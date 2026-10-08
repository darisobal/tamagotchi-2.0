import { getStorage, getStorageForUser, setActiveStorageUser } from './database';
import { CheckIn, TrackState, TrackType, UserPrefs } from './types';
import { UserSnapshot } from './sync';

export { setActiveStorageUser };

export async function insertCheckIn(checkIn: CheckIn): Promise<void> {
  return getStorage().insertCheckIn(checkIn);
}

export async function markCouponCollected(id: string): Promise<void> {
  return getStorage().markCouponCollected(id);
}

export async function deleteCheckIn(id: string): Promise<CheckIn | null> {
  return getStorage().deleteCheckIn(id);
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  return getStorage().getAllCheckIns();
}

export async function getCheckInsForTrack(trackType: TrackType): Promise<CheckIn[]> {
  return getStorage().getCheckInsForTrack(trackType);
}

export async function getTrackState(trackType: TrackType): Promise<TrackState> {
  return getStorage().getTrackState(trackType);
}

export async function getAllTrackStates(): Promise<TrackState[]> {
  return getStorage().getAllTrackStates();
}

export async function updateTrackState(state: TrackState): Promise<void> {
  return getStorage().updateTrackState(state);
}

export async function getUserPrefs(): Promise<UserPrefs> {
  return getStorage().getUserPrefs();
}

export async function updateUserPrefs(prefs: Partial<UserPrefs>): Promise<void> {
  return getStorage().updateUserPrefs(prefs);
}

export async function resetAllData(): Promise<void> {
  return getStorage().resetAll();
}

export async function exportSnapshot(): Promise<UserSnapshot> {
  const storage = getStorage() as {
    exportSnapshot?: () => Promise<UserSnapshot>;
  };
  if (storage.exportSnapshot) {
    return storage.exportSnapshot();
  }
  const [prefs, tracks, checkIns] = await Promise.all([
    getUserPrefs(),
    getAllTrackStates(),
    getAllCheckIns(),
  ]);
  return { prefs, tracks, checkIns };
}

export async function importSnapshot(snapshot: UserSnapshot): Promise<void> {
  const storage = getStorage() as {
    importSnapshot?: (snapshot: UserSnapshot) => Promise<void>;
  };
  if (storage.importSnapshot) {
    await storage.importSnapshot(snapshot);
    return;
  }
  await resetAllData();
  await updateUserPrefs(snapshot.prefs);
  for (const track of snapshot.tracks) {
    await updateTrackState(track);
  }
  for (const checkIn of snapshot.checkIns) {
    await insertCheckIn(checkIn);
  }
}

/** Bind operations to one identity so an in-flight sign-out cannot redirect writes. */
export function repositoryForUser(userId: string | null) {
  const storage = getStorageForUser(userId);
  return {
    getUserPrefs: () => storage.getUserPrefs(),
    getAllTrackStates: () => storage.getAllTrackStates(),
    getAllCheckIns: () => storage.getAllCheckIns(),
    getCheckInsForTrack: (track: TrackType) => storage.getCheckInsForTrack(track),
    getTrackState: (track: TrackType) => storage.getTrackState(track),
    updateUserPrefs: (prefs: Partial<UserPrefs>) => storage.updateUserPrefs(prefs),
    updateTrackState: (state: TrackState) => storage.updateTrackState(state),
    insertCheckIn: (row: CheckIn) => storage.insertCheckIn(row),
    markCouponCollected: (id: string) => storage.markCouponCollected(id),
    deleteCheckIn: (id: string) => storage.deleteCheckIn(id),
    resetAllData: () => storage.resetAll(),
    exportSnapshot: async (): Promise<UserSnapshot> => ({
      prefs: await storage.getUserPrefs(),
      tracks: await storage.getAllTrackStates(),
      checkIns: await storage.getAllCheckIns(),
    }),
    importSnapshot: (snapshot: UserSnapshot) => storage.importSnapshot(snapshot),
  };
}
