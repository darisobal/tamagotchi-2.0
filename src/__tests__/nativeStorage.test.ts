/** Run the native adapter against real SQLite through a small Expo API bridge. */
const mockDatabases = new Map<string, any>();
const mockMetadata = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true, default: {
    getItem: async (key: string) => mockMetadata.get(key) ?? null,
    setItem: async (key: string, value: string) => { mockMetadata.set(key, value); },
  },
}));
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: async (name: string) => {
    const { DatabaseSync } = require('node:sqlite');
    if (!mockDatabases.has(name)) mockDatabases.set(name, new DatabaseSync(':memory:'));
    const db = mockDatabases.get(name);
    return {
      execAsync: async (sql: string) => db.exec(sql),
      runAsync: async (sql: string, ...args: any[]) => db.prepare(sql).run(...args),
      getFirstAsync: async (sql: string, ...args: any[]) => db.prepare(sql).get(...args) ?? null,
      getAllAsync: async (sql: string, ...args: any[]) => db.prepare(sql).all(...args),
      withTransactionAsync: async (fn: () => Promise<void>) => {
        db.exec('BEGIN');
        try { await fn(); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }
      },
    };
  },
}));
const reloadNative = () => { jest.resetModules(); return require('../database') as typeof import('../database'); };
beforeEach(() => { for (const db of mockDatabases.values()) db.close(); mockDatabases.clear(); mockMetadata.clear(); jest.resetModules(); });

test('native drafts and plan timers survive reopening; profiles remain separate', async () => {
  let db = reloadNative();
  let guest = db.getStorageForUser(null);
  expect((await guest.getUserPrefs()).onboardingDone).toBe(false);
  await guest.updateUserPrefs({ onboardingDraft: { step: 2, habitName: 'stretch', habitCadence: 'daily', petName: 'pip' } });
  db = reloadNative(); guest = db.getStorageForUser(null);
  expect((await guest.getUserPrefs()).onboardingDone).toBe(false);
  expect((await guest.getUserPrefs()).onboardingDraft?.step).toBe(2);
  await guest.updateUserPrefs({ onboardingDone: true, habitName: 'stretch', planStartedAt: '2026-10-08T12:00:00Z', onboardingDraft: null });
  const account = db.getStorageForUser('account-a');
  expect((await account.getUserPrefs()).onboardingDone).toBe(false);
  await account.updateUserPrefs({ habitName: 'account habit', onboardingDone: true });
  db = reloadNative();
  expect((await db.getStorageForUser(null).getUserPrefs()).planStartedAt).toBe('2026-10-08T12:00:00Z');
  expect(await db.getStorageForUser(null).getAllCheckIns()).toEqual([]);
  expect((await db.getStorageForUser('account-a').getUserPrefs()).habitName).toBe('account habit');
});

test('native legacy account retains its original database and history', async () => {
  const { DatabaseSync } = require('node:sqlite');
  const legacy = new DatabaseSync(':memory:');
  legacy.exec(`CREATE TABLE user_prefs (id INTEGER PRIMARY KEY, petType TEXT, difficulty TEXT, onboardingDone INTEGER, customSprite TEXT, habitName TEXT);
    INSERT INTO user_prefs VALUES (1, 'dino', 'gentle', 0, NULL, 'old habit');
    CREATE TABLE check_ins (id TEXT PRIMARY KEY, trackType TEXT, intensity TEXT, note TEXT, timestamp TEXT);
    INSERT INTO check_ins VALUES ('old', 'main', 'medium', NULL, '2026-01-01T12:00:00Z');`);
  mockDatabases.set('tamagotchi.db', legacy);
  const db = reloadNative();
  const existing = db.getStorageForUser('returning-user');
  expect((await existing.getUserPrefs()).onboardingDone).toBe(true);
  expect((await existing.getAllCheckIns())[0].id).toBe('old');
  expect((await db.getStorageForUser(null).getUserPrefs()).onboardingDone).toBe(false);
  expect(await db.getStorageForUser(null).getAllCheckIns()).toHaveLength(0);
});

test('a failed native import rolls back instead of erasing account history', async () => {
  const db = reloadNative().getStorageForUser('a');
  await db.updateUserPrefs({ habitName: 'keep me', onboardingDone: true });
  const row = { id: 'duplicate', trackType: 'main' as const, intensity: 'medium' as const, note: null, timestamp: '2026-10-08T12:00:00Z' };
  await db.insertCheckIn(row);
  await expect(db.importSnapshot({ prefs: await db.getUserPrefs(), tracks: await db.getAllTrackStates(), checkIns: [row, row] })).rejects.toThrow();
  expect((await db.getUserPrefs()).habitName).toBe('keep me');
  expect(await db.getAllCheckIns()).toHaveLength(1);
});
