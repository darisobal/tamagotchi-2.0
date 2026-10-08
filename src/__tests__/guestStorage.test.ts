import { startPlan } from '../onboarding';

const data = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => data.set(key, value),
}, configurable: true });
const reload = () => { jest.resetModules(); return require('../database.web') as typeof import('../database.web'); };
beforeEach(() => { data.clear(); jest.resetModules(); });

test('fresh guest, unfinished draft and finished plan survive reload without check-ins', async () => {
  let storage = reload().getStorageForUser(null);
  expect((await storage.getUserPrefs()).onboardingDone).toBe(false);
  const draft = { step: 1, habitName: 'draw a cat', habitCadence: 'weekly' as const, petName: 'bean' };
  await storage.updateUserPrefs({ onboardingDraft: draft });
  storage = reload().getStorageForUser(null);
  expect((await storage.getUserPrefs()).onboardingDraft).toEqual(draft);
  expect((await storage.getUserPrefs()).onboardingDone).toBe(false);
  const prefs = startPlan(await storage.getUserPrefs(), draft.habitName, draft.habitCadence, draft.petName, new Date('2026-10-08T10:00:00Z'));
  await storage.updateUserPrefs(prefs);
  storage = reload().getStorageForUser(null);
  expect(await storage.getUserPrefs()).toMatchObject({ onboardingDone: true, habitName: 'draw a cat', planStartedAt: '2026-10-08T10:00:00.000Z', onboardingDraft: null });
  expect(await storage.getAllCheckIns()).toEqual([]);
});

test('bound guest writes cannot affect an account after switching, and both survive relaunch', async () => {
  const db = reload();
  const guest = db.getStorageForUser(null);
  const account = db.getStorageForUser('account-a');
  await account.updateUserPrefs({ habitName: 'existing account', onboardingDone: true });
  await account.insertCheckIn({ id: 'old', trackType: 'main', intensity: 'medium', note: null, timestamp: '2026-01-01T10:00:00Z' });
  db.setActiveStorageUser('account-a');
  await guest.updateUserPrefs({ habitName: 'guest only', onboardingDone: true });
  const fresh = reload();
  expect((await fresh.getStorageForUser(null).getUserPrefs()).habitName).toBe('guest only');
  expect((await fresh.getStorageForUser('account-a').getUserPrefs()).habitName).toBe('existing account');
  expect(await fresh.getStorageForUser('account-a').getAllCheckIns()).toHaveLength(1);
  expect(await fresh.getStorageForUser(null).getAllCheckIns()).toHaveLength(0);
});

test('legacy profiles retain history and do not re-enter onboarding', async () => {
  data.set('tamagotchi_data_local-existing', JSON.stringify({ prefs: { habitName: 'old habit', petName: 'old pet' }, tracks: [], checkIns: [{ id: 'kept', timestamp: '2026-01-01T10:00:00Z' }] }));
  const profile = reload().getStorageForUser('local-existing');
  expect((await profile.getUserPrefs()).onboardingDone).toBe(true);
  expect((await profile.getAllCheckIns())[0].id).toBe('kept');
});
