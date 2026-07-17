import {
  CheckIn,
  TrackState,
  UserPrefs,
  TrackType,
  ALL_TRACKS,
  DEFAULT_HABIT_NAME,
  DEFAULT_PET_NAME,
  DEFAULT_PET_COLOR,
  DEFAULT_HABIT_CADENCE,
  resolveHabitName,
  resolvePetName,
  normalizeUserPrefs,
} from './types';

export interface Storage {
  getAllCheckIns(): Promise<CheckIn[]>;
  getCheckInsForTrack(trackType: TrackType): Promise<CheckIn[]>;
  insertCheckIn(checkIn: CheckIn): Promise<void>;
  deleteCheckIn(id: string): Promise<CheckIn | null>;
  getTrackState(trackType: TrackType): Promise<TrackState>;
  getAllTrackStates(): Promise<TrackState[]>;
  updateTrackState(state: TrackState): Promise<void>;
  getUserPrefs(): Promise<UserPrefs>;
  updateUserPrefs(prefs: Partial<UserPrefs>): Promise<void>;
  resetAll(): Promise<void>;
}

function defaultTrackState(trackType: TrackType): TrackState {
  return { trackType, level: 50, lastCheckInAt: null, streak: 0, lastCompletedDay: null };
}

const DEFAULT_PREFS: UserPrefs = {
  petType: 'dino',
  onboardingDone: true,
  customSprite: null,
  habitName: DEFAULT_HABIT_NAME,
  petName: DEFAULT_PET_NAME,
  petColor: DEFAULT_PET_COLOR,
  petHat: 'none',
  habitCadence: DEFAULT_HABIT_CADENCE,
};

let storage: Storage | null = null;
let activeUserId: string | null = null;

export function setActiveStorageUser(userId: string | null) {
  activeUserId = userId;
  storage = null;
}

function storageKey() {
  return activeUserId ? `tamagotchi_data_${activeUserId}` : 'tamagotchi_data';
}

class WebStorage implements Storage {
  private checkIns: CheckIn[] = [];
  private tracks: Map<TrackType, TrackState> = new Map();
  private prefs: UserPrefs = { ...DEFAULT_PREFS };
  private loaded = false;

  private load() {
    if (this.loaded) return;
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) {
        const data = JSON.parse(raw);
        this.checkIns = (data.checkIns || []).map((c: CheckIn) => ({
          ...c,
          isPaidRestart: Boolean(c.isPaidRestart),
        }));
        if (data.tracks) {
          for (const t of data.tracks) this.tracks.set(t.trackType as TrackType, t);
        }
        if (data.prefs) {
          const normalized = normalizeUserPrefs(data.prefs);
          const migrated =
            data.prefs.habitName !== normalized.habitName ||
            data.prefs.petName !== normalized.petName;
          this.prefs = normalized;
          if (migrated) this.save();
        }
      }
    } catch { /* fresh start */ }
    for (const t of ALL_TRACKS) {
      if (!this.tracks.has(t)) this.tracks.set(t, defaultTrackState(t));
    }
    this.loaded = true;
  }

  private save() {
    const data = {
      checkIns: this.checkIns,
      tracks: Array.from(this.tracks.values()),
      prefs: this.prefs,
    };
    localStorage.setItem(storageKey(), JSON.stringify(data));
  }

  async getAllCheckIns() {
    this.load();
    return [...this.checkIns].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getCheckInsForTrack(trackType: TrackType) {
    this.load();
    return this.checkIns
      .filter((c) => c.trackType === trackType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async insertCheckIn(checkIn: CheckIn) {
    this.load();
    this.checkIns.push(checkIn);
    this.save();
  }

  async deleteCheckIn(id: string) {
    this.load();
    const idx = this.checkIns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const [deleted] = this.checkIns.splice(idx, 1);
    this.save();
    return deleted;
  }

  async getTrackState(trackType: TrackType) {
    this.load();
    return this.tracks.get(trackType) || defaultTrackState(trackType);
  }

  async getAllTrackStates() {
    this.load();
    return ALL_TRACKS.map((t) => this.tracks.get(t) || defaultTrackState(t));
  }

  async updateTrackState(state: TrackState) {
    this.load();
    this.tracks.set(state.trackType, state);
    this.save();
  }

  async getUserPrefs() {
    this.load();
    const normalized = normalizeUserPrefs(this.prefs);
    if (
      normalized.habitName !== this.prefs.habitName ||
      normalized.petName !== this.prefs.petName
    ) {
      this.prefs = normalized;
      this.save();
    }
    return { ...this.prefs };
  }

  async updateUserPrefs(partial: Partial<UserPrefs>) {
    this.load();
    this.prefs = { ...this.prefs, ...partial };
    this.save();
  }

  async resetAll() {
    this.checkIns = [];
    this.tracks = new Map();
    this.prefs = { ...DEFAULT_PREFS };
    for (const t of ALL_TRACKS) this.tracks.set(t, defaultTrackState(t));
    this.save();
  }

  async importSnapshot(snapshot: {
    prefs: UserPrefs;
    tracks: TrackState[];
    checkIns: CheckIn[];
  }) {
    this.load();
    this.prefs = normalizeUserPrefs({ ...snapshot.prefs, onboardingDone: true });
    this.checkIns = [...snapshot.checkIns];
    this.tracks = new Map();
    for (const t of ALL_TRACKS) {
      const found = snapshot.tracks.find((row) => row.trackType === t);
      this.tracks.set(t, found ?? defaultTrackState(t));
    }
    this.save();
  }

  async exportSnapshot() {
    this.load();
    return {
      prefs: { ...this.prefs },
      tracks: Array.from(this.tracks.values()),
      checkIns: [...this.checkIns],
    };
  }
}

export function getStorage(): Storage {
  if (storage) return storage;
  storage = new WebStorage();
  return storage;
}
