import { computeAllHabits, computePetMood, processCheckIn } from '../logic';
import { firstDeadline, guestTransition, initialRoute, startPlan } from '../onboarding';
import { normalizeTrackState, normalizeUserPrefs, HABIT_CADENCE_MS, HabitCadence } from '../types';
import type { UserSnapshot } from '../sync';

const now = new Date('2026-10-08T10:00:00Z');
const empty = (): UserSnapshot => ({ prefs: normalizeUserPrefs({ onboardingDone: false }),
  tracks: [normalizeTrackState({ trackType: 'main' })], checkIns: [] });
const planned = (): UserSnapshot => ({ ...empty(), prefs: startPlan(empty().prefs, '  walk outside  ', 'daily', 'noodle', now) });

test('empty and whitespace habits cannot silently become the example', () => {
  for (const habit of ['', '  ', '\n\t']) expect(() => startPlan(empty().prefs, habit, 'daily', 'noodle', now)).toThrow();
});

test('committing a plan creates no achievement and routes to home', () => {
  const snapshot = planned();
  expect(snapshot.prefs.habitName).toBe('walk outside');
  expect(snapshot.checkIns).toEqual([]);
  expect(snapshot.tracks[0]).toMatchObject({ lastCheckInAt: null, streak: 0, celebrationCount: 0, lastCompletedDay: null });
  expect(initialRoute(snapshot.prefs, false)).toBe('/(tabs)');
  expect(initialRoute(empty().prefs, false)).toBe('/onboarding');
  expect(initialRoute(snapshot.prefs, true)).toBe('/reset-password');
  expect(initialRoute(normalizeUserPrefs({}), false)).toBe('/(tabs)'); // legacy snapshot
});

test.each(Object.keys(HABIT_CADENCE_MS) as HabitCadence[])('%s uses elapsed intervals from plan start, including before first completion', cadence => {
  const snapshot = planned();
  const period = HABIT_CADENCE_MS[cadence];
  const compute = (elapsed: number) => computeAllHabits(snapshot.tracks, now.getTime() + elapsed, period, snapshot.prefs.planStartedAt!);
  expect(compute(0)[0].nextDeadlineAt).toBe(firstDeadline(cadence, now.getTime()));
  expect(compute(period - 1)[0].lives).toBe(3);
  expect(compute(period)[0].lives).toBe(2);
  expect(compute(period * 2)[0].lives).toBe(1);
  expect(computePetMood(compute(period * 3)).mood).toBe('dead');
  expect(compute(period * 3)[0].nextDeadlineAt).toBeNull();
  const completion = processCheckIn(snapshot.tracks[0], 'medium', new Date(now.getTime() + period / 2));
  expect(completion.streak).toBe(1);
  expect(completion.celebrationCount).toBe(1);
  const after = computeAllHabits([completion], now.getTime() + period, period, snapshot.prefs.planStartedAt!)[0];
  expect(after.lives).toBe(3);
  expect(after.nextDeadlineAt).toBe(new Date(now.getTime() + period * 1.5).toISOString());
});

test('guest transfer never replaces an existing account plan', () => {
  expect(guestTransition(planned(), empty(), null)).toBe('guest');
  expect(guestTransition(planned(), empty(), planned())).toBe('choose');
  expect(guestTransition(planned(), planned(), null)).toBe('choose');
  expect(guestTransition(empty(), planned(), planned())).toBe('account');
  const oldHistory = empty();
  oldHistory.checkIns.push({ id: 'old', trackType: 'main', intensity: 'medium', note: null, timestamp: now.toISOString() });
  expect(guestTransition(planned(), oldHistory, null)).toBe('choose');
});
