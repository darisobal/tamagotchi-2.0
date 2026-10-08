import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
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
  normalizeTrackState,
  PetHat,
  HabitCadence,
} from './types';

export interface Storage {
  getAllCheckIns(): Promise<CheckIn[]>;
  getCheckInsForTrack(trackType: TrackType): Promise<CheckIn[]>;
  insertCheckIn(checkIn: CheckIn): Promise<void>;
  markCouponCollected(id: string): Promise<void>;
  deleteCheckIn(id: string): Promise<CheckIn | null>;
  getTrackState(trackType: TrackType): Promise<TrackState>;
  getAllTrackStates(): Promise<TrackState[]>;
  updateTrackState(state: TrackState): Promise<void>;
  getUserPrefs(): Promise<UserPrefs>;
  updateUserPrefs(prefs: Partial<UserPrefs>): Promise<void>;
  resetAll(): Promise<void>;
  importSnapshot(snapshot: { prefs: UserPrefs; tracks: TrackState[]; checkIns: CheckIn[] }): Promise<void>;
}

function defaultTrackState(trackType: TrackType): TrackState {
  return {
    trackType,
    level: 50,
    lastCheckInAt: null,
    streak: 0,
    lastCompletedDay: null,
    celebrationCount: 0,
    celebrationPaidStart: false,
  };
}

type CheckInRow = Omit<CheckIn, 'isPaidRestart' | 'couponCollected' | 'couponEarned'> & {
  isPaidRestart?: number | boolean | null;
  couponCollected?: number | boolean | null;
  couponEarned?: number | boolean | null;
};

function mapCheckInRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    trackType: row.trackType,
    intensity: row.intensity,
    note: row.note,
    timestamp: row.timestamp,
    isPaidRestart: Boolean(row.isPaidRestart),
    couponEarned:
      row.couponEarned === undefined || row.couponEarned === null
        ? undefined
        : Boolean(row.couponEarned),
    couponCollected:
      row.couponCollected === undefined || row.couponCollected === null
        ? undefined
        : Boolean(row.couponCollected),
  };
}

class NativeStorage implements Storage {
  constructor(private readonly userId: string | null) {}
  private opening: Promise<SQLite.SQLiteDatabase> | null = null;
  private db: SQLite.SQLiteDatabase | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (this.opening) return this.opening;
    if (!this.opening) this.opening = this.openDb();
    return this.opening;
  }

  private async openDb(): Promise<SQLite.SQLiteDatabase> {
    // Claim the pre-profile database once, for the first resolved identity.
    // Its contents remain in place; subsequent accounts get separate databases.
    const identity = this.userId ?? 'guest';
    let owner = await AsyncStorage.getItem('tamagotchi_legacy_db_owner');
    if (!owner) {
      owner = identity;
      await AsyncStorage.setItem('tamagotchi_legacy_db_owner', owner);
    }
    const filename = owner === identity ? 'tamagotchi.db' : `tamagotchi_${encodeURIComponent(identity)}.db`;
    this.db = await SQLite.openDatabaseAsync(filename);
    await this.db.execAsync(`PRAGMA journal_mode = WAL;`);
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY NOT NULL,
        trackType TEXT NOT NULL,
        intensity TEXT NOT NULL,
        note TEXT,
        timestamp TEXT NOT NULL,
        isPaidRestart INTEGER NOT NULL DEFAULT 0
      );
    `);
    try {
      await this.db.execAsync(
        `ALTER TABLE check_ins ADD COLUMN isPaidRestart INTEGER NOT NULL DEFAULT 0`,
      );
    } catch {}
    try {
      await this.db.execAsync(
        `ALTER TABLE check_ins ADD COLUMN couponCollected INTEGER NOT NULL DEFAULT 1`,
      );
    } catch {}
    try {
      await this.db.execAsync(
        `ALTER TABLE check_ins ADD COLUMN couponEarned INTEGER NOT NULL DEFAULT 0`,
      );
    } catch {}
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS track_state (
        trackType TEXT PRIMARY KEY NOT NULL,
        level REAL NOT NULL DEFAULT 50,
        lastCheckInAt TEXT,
        streak INTEGER NOT NULL DEFAULT 0,
        lastCompletedDay TEXT,
        celebrationCount INTEGER NOT NULL DEFAULT 0,
        celebrationPaidStart INTEGER NOT NULL DEFAULT 0
      );
    `);
    try {
      await this.db.execAsync(
        `ALTER TABLE track_state ADD COLUMN celebrationCount INTEGER NOT NULL DEFAULT 0`,
      );
    } catch {}
    try {
      await this.db.execAsync(
        `ALTER TABLE track_state ADD COLUMN celebrationPaidStart INTEGER NOT NULL DEFAULT 0`,
      );
    } catch {}
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_prefs (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        petType TEXT NOT NULL DEFAULT 'dino',
        difficulty TEXT NOT NULL DEFAULT 'gentle',
        onboardingDone INTEGER NOT NULL DEFAULT 0,
        customSprite TEXT
      );
    `);
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN customSprite TEXT`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN habitName TEXT`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN petColor TEXT`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN petHat TEXT`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN habitCadence TEXT`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN petName TEXT`);
    } catch {}
    let firstOnboardingMigration = false;
    try { await this.db.execAsync('ALTER TABLE user_prefs ADD COLUMN onboardingVersion INTEGER'); firstOnboardingMigration = true; } catch {}
    for (const column of ['planStartedAt', 'onboardingDraft', 'accountPromptDismissed']) {
      try { await this.db.execAsync(`ALTER TABLE user_prefs ADD COLUMN ${column} TEXT`); } catch {}
    }
    // Legacy installations skipped onboarding. Preserve their existing profile.
    if (firstOnboardingMigration) await this.db.runAsync(`UPDATE user_prefs SET onboardingDone = 1 WHERE onboardingDone = 0 AND (habitName IS NOT NULL OR EXISTS (SELECT 1 FROM check_ins))`);
    for (const t of ALL_TRACKS) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO track_state (trackType, level, streak) VALUES (?, 50, 0)`, t
      );
    }
    await this.db.runAsync(
      `INSERT OR IGNORE INTO user_prefs (id, petType, difficulty, onboardingDone) VALUES (1, 'dino', 'gentle', 0)`
    );
    return this.db;
  }

  async getAllCheckIns() {
    const db = await this.getDb();
    const rows = await db.getAllAsync<CheckInRow>(
      `SELECT * FROM check_ins ORDER BY timestamp DESC`,
    );
    return rows.map(mapCheckInRow);
  }

  async getCheckInsForTrack(trackType: TrackType) {
    const db = await this.getDb();
    const rows = await db.getAllAsync<CheckInRow>(
      `SELECT * FROM check_ins WHERE trackType = ? ORDER BY timestamp ASC`,
      trackType,
    );
    return rows.map(mapCheckInRow);
  }

  async insertCheckIn(checkIn: CheckIn) {
    const db = await this.getDb();
    const couponEarned = checkIn.couponEarned ? 1 : 0;
    const couponCollected =
      checkIn.couponCollected === undefined
        ? couponEarned
          ? 0
          : 1
        : checkIn.couponCollected
          ? 1
          : 0;
    await db.runAsync(
      `INSERT INTO check_ins (id, trackType, intensity, note, timestamp, isPaidRestart, couponCollected, couponEarned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      checkIn.id,
      checkIn.trackType,
      checkIn.intensity,
      checkIn.note,
      checkIn.timestamp,
      checkIn.isPaidRestart ? 1 : 0,
      couponCollected,
      couponEarned,
    );
  }

  async markCouponCollected(id: string) {
    const db = await this.getDb();
    await db.runAsync(`UPDATE check_ins SET couponCollected = 1 WHERE id = ?`, id);
  }

  async deleteCheckIn(id: string) {
    const db = await this.getDb();
    const row = await db.getFirstAsync<CheckInRow>(`SELECT * FROM check_ins WHERE id = ?`, id);
    if (!row) return null;
    await db.runAsync(`DELETE FROM check_ins WHERE id = ?`, id);
    return mapCheckInRow(row);
  }

  async getTrackState(trackType: TrackType) {
    const db = await this.getDb();
    const row = await db.getFirstAsync<TrackState & { celebrationPaidStart?: number | boolean }>(
      `SELECT * FROM track_state WHERE trackType = ?`, trackType
    );
    return normalizeTrackState({
      ...row!,
      celebrationPaidStart: Boolean(row?.celebrationPaidStart),
    });
  }

  async getAllTrackStates() {
    const db = await this.getDb();
    const states: TrackState[] = [];
    for (const t of ALL_TRACKS) {
      let row = await db.getFirstAsync<TrackState & { celebrationPaidStart?: number | boolean }>(
        `SELECT * FROM track_state WHERE trackType = ?`, t
      );
      if (!row) {
        await db.runAsync(
          `INSERT OR IGNORE INTO track_state (trackType, level, streak) VALUES (?, 50, 0)`,
          t,
        );
        row = defaultTrackState(t);
      }
      states.push(
        normalizeTrackState({
          ...row,
          celebrationPaidStart: Boolean(row.celebrationPaidStart),
        }),
      );
    }
    return states;
  }

  async updateTrackState(state: TrackState) {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE track_state SET level = ?, lastCheckInAt = ?, streak = ?, lastCompletedDay = ?, celebrationCount = ?, celebrationPaidStart = ? WHERE trackType = ?`,
      state.level,
      state.lastCheckInAt,
      state.streak,
      state.lastCompletedDay,
      state.celebrationCount,
      state.celebrationPaidStart ? 1 : 0,
      state.trackType,
    );
  }

  async getUserPrefs() {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{
      planStartedAt: string | null;
      onboardingDraft: string | null;
      accountPromptDismissed: string | null;
      petType: string;
      onboardingDone: number;
      customSprite: string | null;
      habitName: string | null;
      petName: string | null;
      petColor: string | null;
      petHat: string | null;
      habitCadence: string | null;
    }>(`SELECT * FROM user_prefs WHERE id = 1`);
    const prefs = normalizeUserPrefs({
      planStartedAt: row!.planStartedAt,
      onboardingDraft: row!.onboardingDraft ? JSON.parse(row!.onboardingDraft) : null,
      accountPromptDismissed: row!.accountPromptDismissed === 'true',
      petType: row!.petType as UserPrefs['petType'],
      onboardingDone: row!.onboardingDone === 1,
      customSprite: row!.customSprite ?? null,
      habitName: row!.habitName ?? '',
      petName: row!.petName ?? undefined,
      petColor: row!.petColor ?? undefined,
      petHat: row!.petHat as PetHat,
      habitCadence: row!.habitCadence as HabitCadence,
    });
    if (
      prefs.habitName !== (row!.habitName ?? '') ||
      prefs.petName !== (row!.petName ?? '')
    ) {
      await this.updateUserPrefs({
        habitName: prefs.habitName,
        petName: prefs.petName,
      });
    }
    return prefs;
  }

  async updateUserPrefs(prefs: Partial<UserPrefs>) {
    const db = await this.getDb();
    const columns = ['petType', 'onboardingDone', 'customSprite', 'habitName', 'petName',
      'petColor', 'petHat', 'habitCadence', 'planStartedAt', 'onboardingDraft', 'accountPromptDismissed'] as const;
    const updates = columns.filter(column => prefs[column] !== undefined);
    if (!updates.length) return;
    const values = updates.map(column => {
      const value = prefs[column];
      if (column === 'onboardingDone') return value ? 1 : 0;
      if (column === 'onboardingDraft') return value ? JSON.stringify(value) : null;
      if (column === 'accountPromptDismissed') return String(value);
      return value as string | null;
    });
    // One statement commits the name, timing and completion flag atomically.
    await db.runAsync(`UPDATE user_prefs SET ${updates.map(column => `${column} = ?`).join(', ')} WHERE id = 1`, ...values);
  }

  async importSnapshot(snapshot: { prefs: UserPrefs; tracks: TrackState[]; checkIns: CheckIn[] }) {
    const db = await this.getDb();
    await db.withTransactionAsync(async () => {
      await this.resetAll();
      await this.updateUserPrefs(normalizeUserPrefs(snapshot.prefs));
      for (const track of snapshot.tracks) await this.updateTrackState(normalizeTrackState(track));
      for (const row of snapshot.checkIns) await this.insertCheckIn(row);
    });
  }

  async resetAll() {
    const db = await this.getDb();
    await db.execAsync(`DELETE FROM check_ins`);
    await db.execAsync(`DELETE FROM track_state`);
    await db.execAsync(`DELETE FROM user_prefs`);
    for (const t of ALL_TRACKS) {
      await db.runAsync(`INSERT INTO track_state (trackType, level, streak) VALUES (?, 50, 0)`, t);
    }
    await db.runAsync(
      `INSERT INTO user_prefs (id, petType, difficulty, onboardingDone) VALUES (1, 'dino', 'gentle', 0)`
    );
  }
}

let storage: Storage | null = null;
let activeUserId: string | null = null;

export function setActiveStorageUser(userId: string | null) {
  activeUserId = userId;
  storage = null;
}

export function getStorage(): Storage {
  if (storage) return storage;
  storage = getStorageForUser(activeUserId);
  return storage;
}

const profiles = new Map<string, Storage>();
export function getStorageForUser(userId: string | null): Storage {
  const key = userId ?? 'guest';
  if (!profiles.has(key)) profiles.set(key, new NativeStorage(userId));
  return profiles.get(key)!;
}
