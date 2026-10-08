import { computeAllHabits, computePetMood, formatLifeTimer } from '../logic';
import { HABIT_CADENCE_MS, HabitCadence, normalizeTrackState } from '../types';

const start = Date.parse('2026-10-08T12:00:00Z');
const minute = 60_000;

// Exercise the same computed values consumed by the pet, heart bar and flipped egg.
describe.each<[HabitCadence, string]>([['daily', '24:00'], ['every2days', '48:00'], ['weekly', '168:00']])('%s display', (cadence, fullTimer) => {
  const period = HABIT_CADENCE_MS[cadence];
  test.each([false, true])('heart and mood boundaries, checked in: %s', checkedIn => {
    const anchor = new Date(start).toISOString();
    const tracks = [normalizeTrackState({ trackType: 'main', lastCheckInAt: checkedIn ? anchor : null })];
    const at = (elapsed: number) => computeAllHabits(tracks, start + elapsed, period, anchor);
    expect(formatLifeTimer(at(0)[0].timeRemainingMs)).toBe(fullTimer);
    expect(computePetMood(at(0)).mood).toBe(checkedIn ? 'happy' : 'sleeping');
    expect(formatLifeTimer(at(period - 1)[0].timeRemainingMs)).toBe('00:01');
    for (const [misses, lives, mood] of [[1, 2, 'okay'], [2, 1, 'sad'], [3, 0, 'dead']] as const) {
      const habits = at(period * misses);
      expect(habits[0].lives).toBe(lives);
      expect(computePetMood(habits).mood).toBe(mood);
      expect(formatLifeTimer(habits[0].timeRemainingMs)).toBe(lives ? fullTimer : '00:00');
      expect(habits[0].nextDeadlineAt).toBe(lives ? new Date(start + period * (misses + 1)).toISOString() : null);
    }
    expect(at(period * 10)[0].lives).toBe(0);
  });
  test('minutes do not wrap at 24 hours or round down early', () => {
    expect(formatLifeTimer(period - 1)).toBe(fullTimer);
    const remainingMinutes = period / minute - 1;
    expect(formatLifeTimer(period - minute)).toBe(`${String(Math.floor(remainingMinutes / 60)).padStart(2, '0')}:59`);
  });
});

test('changing cadence keeps the last check-in anchor and updates all displayed state', () => {
  const tracks = [normalizeTrackState({ trackType: 'main', lastCheckInAt: new Date(start).toISOString() })];
  const now = start + 30 * 60 * minute;
  const expected = [['daily', 2, 'okay', '18:00'], ['every2days', 3, 'happy', '18:00'], ['weekly', 3, 'happy', '138:00']] as const;
  for (const [cadence, lives, mood, timer] of expected) {
    const habits = computeAllHabits(tracks, now, HABIT_CADENCE_MS[cadence]);
    expect(computePetMood(habits)).toMatchObject({ lives, mood });
    expect(formatLifeTimer(habits[0].timeRemainingMs)).toBe(timer);
  }
});
