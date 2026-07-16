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
  PetHat,
  HabitCadence,
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

class NativeStorage implements Storage {
  private db: SQLite.SQLiteDatabase | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (this.db) return this.db;
    this.db = await SQLite.openDatabaseAsync('tamagotchi.db');
    await this.db.execAsync(`PRAGMA journal_mode = WAL;`);
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY NOT NULL,
        trackType TEXT NOT NULL,
        intensity TEXT NOT NULL,
        note TEXT,
        timestamp TEXT NOT NULL
      );
    `);
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS track_state (
        trackType TEXT PRIMARY KEY NOT NULL,
        level REAL NOT NULL DEFAULT 50,
        lastCheckInAt TEXT,
        streak INTEGER NOT NULL DEFAULT 0,
        lastCompletedDay TEXT
      );
    `);
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
    return db.getAllAsync<CheckIn>(`SELECT * FROM check_ins ORDER BY timestamp DESC`);
  }

  async getCheckInsForTrack(trackType: TrackType) {
    const db = await this.getDb();
    return db.getAllAsync<CheckIn>(
      `SELECT * FROM check_ins WHERE trackType = ? ORDER BY timestamp ASC`, trackType
    );
  }

  async insertCheckIn(checkIn: CheckIn) {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO check_ins (id, trackType, intensity, note, timestamp) VALUES (?, ?, ?, ?, ?)`,
      checkIn.id, checkIn.trackType, checkIn.intensity, checkIn.note, checkIn.timestamp
    );
  }

  async deleteCheckIn(id: string) {
    const db = await this.getDb();
    const row = await db.getFirstAsync<CheckIn>(`SELECT * FROM check_ins WHERE id = ?`, id);
    if (!row) return null;
    await db.runAsync(`DELETE FROM check_ins WHERE id = ?`, id);
    return row;
  }

  async getTrackState(trackType: TrackType) {
    const db = await this.getDb();
    return (await db.getFirstAsync<TrackState>(
      `SELECT * FROM track_state WHERE trackType = ?`, trackType
    ))!;
  }

  async getAllTrackStates() {
    const db = await this.getDb();
    const states: TrackState[] = [];
    for (const t of ALL_TRACKS) {
      const row = await db.getFirstAsync<TrackState>(
        `SELECT * FROM track_state WHERE trackType = ?`, t
      );
      if (row) states.push(row);
    }
    return states;
  }

  async updateTrackState(state: TrackState) {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE track_state SET level = ?, lastCheckInAt = ?, streak = ?, lastCompletedDay = ? WHERE trackType = ?`,
      state.level, state.lastCheckInAt, state.streak, state.lastCompletedDay, state.trackType
    );
  }

  async getUserPrefs() {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{
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
      petType: row!.petType as UserPrefs['petType'],
      onboardingDone: row!.onboardingDone === 1,
      customSprite: row!.customSprite ?? null,
      habitName: row!.habitName,
      petName: row!.petName,
      petColor: row!.petColor,
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
    if (prefs.petType !== undefined)
      await db.runAsync(`UPDATE user_prefs SET petType = ? WHERE id = 1`, prefs.petType);
    if (prefs.onboardingDone !== undefined)
      await db.runAsync(`UPDATE user_prefs SET onboardingDone = ? WHERE id = 1`, prefs.onboardingDone ? 1 : 0);
    if (prefs.customSprite !== undefined)
      await db.runAsync(`UPDATE user_prefs SET customSprite = ? WHERE id = 1`, prefs.customSprite);
    if (prefs.habitName !== undefined)
      await db.runAsync(`UPDATE user_prefs SET habitName = ? WHERE id = 1`, prefs.habitName);
    if (prefs.petName !== undefined)
      await db.runAsync(`UPDATE user_prefs SET petName = ? WHERE id = 1`, prefs.petName);
    if (prefs.petColor !== undefined)
      await db.runAsync(`UPDATE user_prefs SET petColor = ? WHERE id = 1`, prefs.petColor);
    if (prefs.petHat !== undefined)
      await db.runAsync(`UPDATE user_prefs SET petHat = ? WHERE id = 1`, prefs.petHat);
    if (prefs.habitCadence !== undefined)
      await db.runAsync(`UPDATE user_prefs SET habitCadence = ? WHERE id = 1`, prefs.habitCadence);
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

export function setActiveStorageUser(_userId: string | null) {
  // Native SQLite uses a single on-device profile for now.
}

export function getStorage(): Storage {
  if (storage) return storage;
  storage = new NativeStorage();
  return storage;
}
