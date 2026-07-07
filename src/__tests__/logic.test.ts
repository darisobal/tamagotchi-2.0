import {
  computeHabitStatus,
  computeAllHabits,
  computePetMood,
  formatCountdown,
  processCheckIn,
} from '../logic';
import { TrackState, ComputedHabit, HABIT_PERIOD_MS, MAIN_TRACK } from '../types';

function makeTrackState(lastCheckInAt: string | null = null): TrackState {
  return {
    trackType: MAIN_TRACK,
    level: 50,
    lastCheckInAt,
    streak: 0,
    lastCompletedDay: null,
  };
}

describe('computeHabitStatus', () => {
  const HOUR = 60 * 60 * 1000;

  test('just checked in → progress ≈ 1, status GREEN', () => {
    const now = Date.now();
    const result = computeHabitStatus(MAIN_TRACK, new Date(now).toISOString(), now);
    expect(result.progress).toBeCloseTo(1, 2);
    expect(result.status).toBe('GREEN');
    expect(result.timeRemainingMs).toBeCloseTo(HABIT_PERIOD_MS.main, -3);
  });

  test('no check-in ever → progress 0, OVERDUE', () => {
    const result = computeHabitStatus(MAIN_TRACK, null, Date.now());
    expect(result.progress).toBe(0);
    expect(result.timeRemainingMs).toBe(0);
    expect(result.status).toBe('OVERDUE');
  });

  test('half period elapsed → progress ≈ 0.5, YELLOW boundary', () => {
    const now = Date.now();
    const halfAgo = now - HABIT_PERIOD_MS.main / 2;
    const result = computeHabitStatus(MAIN_TRACK, new Date(halfAgo).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.5, 1);
    expect(result.status).toBe('YELLOW');
  });

  test('80% elapsed → progress ≈ 0.2, boundary is RED (> 0.20 needed for YELLOW)', () => {
    const now = Date.now();
    const elapsed80 = now - HABIT_PERIOD_MS.main * 0.8;
    const result = computeHabitStatus(MAIN_TRACK, new Date(elapsed80).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.2, 1);
    expect(result.status).toBe('RED');
  });

  test('70% elapsed → progress ≈ 0.3, YELLOW zone', () => {
    const now = Date.now();
    const elapsed70 = now - HABIT_PERIOD_MS.main * 0.7;
    const result = computeHabitStatus(MAIN_TRACK, new Date(elapsed70).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.3, 1);
    expect(result.status).toBe('YELLOW');
  });

  test('90% elapsed → progress ≈ 0.1, RED zone', () => {
    const now = Date.now();
    const elapsed90 = now - HABIT_PERIOD_MS.main * 0.9;
    const result = computeHabitStatus(MAIN_TRACK, new Date(elapsed90).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.1, 1);
    expect(result.status).toBe('RED');
  });

  test('past deadline → progress 0, OVERDUE', () => {
    const now = Date.now();
    const wayPast = now - HABIT_PERIOD_MS.main * 2;
    const result = computeHabitStatus(MAIN_TRACK, new Date(wayPast).toISOString(), now);
    expect(result.progress).toBe(0);
    expect(result.status).toBe('OVERDUE');
  });

  test('main track uses a 24h period', () => {
    expect(HABIT_PERIOD_MS.main).toBe(24 * HOUR);
  });
});

describe('computePetMood', () => {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  function habitFromCheckin(agoMs: number | null): ComputedHabit[] {
    const tracks: TrackState[] = [
      makeTrackState(agoMs !== null ? new Date(now - agoMs).toISOString() : null),
    ];
    return computeAllHabits(tracks, now);
  }

  test('just checked in → happy', () => {
    const { mood } = computePetMood(habitFromCheckin(0), 'workout');
    expect(mood).toBe('happy');
  });

  test('still fresh (1h elapsed of 24h) → happy', () => {
    const { mood } = computePetMood(habitFromCheckin(1 * HOUR), 'workout');
    expect(mood).toBe('happy');
  });

  test('70% of period elapsed → okay (yellow)', () => {
    const { mood, reason } = computePetMood(
      habitFromCheckin(HABIT_PERIOD_MS.main * 0.7),
      'read pages',
    );
    expect(mood).toBe('okay');
    expect(reason).toContain('read pages');
  });

  test('90% of period elapsed → sad (red)', () => {
    const { mood, reason } = computePetMood(
      habitFromCheckin(HABIT_PERIOD_MS.main * 0.9),
      'workout',
    );
    expect(mood).toBe('sad');
    expect(reason).toContain('workout');
  });

  test('overdue → dead, reason includes habit name', () => {
    const { mood, reason } = computePetMood(habitFromCheckin(30 * HOUR), 'meditate');
    expect(mood).toBe('dead');
    expect(reason).toContain('meditate');
  });

  test('no check-ins ever → dead', () => {
    const { mood } = computePetMood(habitFromCheckin(null), 'workout');
    expect(mood).toBe('dead');
  });

  test('uses default habit name if none provided', () => {
    const { mood, reason } = computePetMood(habitFromCheckin(30 * HOUR));
    expect(mood).toBe('dead');
    expect(reason.length).toBeGreaterThan(0);
  });
});

describe('formatCountdown', () => {
  const HOUR = 60 * 60 * 1000;

  test('shows HH:MM format', () => {
    const result = formatCountdown(5 * HOUR + 30 * 60 * 1000);
    expect(result).toBe('05:30 left');
  });

  test('overdue returns overdue string', () => {
    expect(formatCountdown(0)).toBe('overdue');
    expect(formatCountdown(-1000)).toBe('overdue');
  });
});

describe('processCheckIn', () => {
  test('sets lastCheckInAt to now', () => {
    const state = makeTrackState();
    const now = new Date();
    const result = processCheckIn(state, 'small', now);
    expect(result.lastCheckInAt).toBe(now.toISOString());
  });

  test('increments streak for consecutive days', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const state: TrackState = {
      ...makeTrackState(),
      streak: 3,
      lastCompletedDay: yesterday.toISOString().slice(0, 10),
    };
    const now = new Date();
    const result = processCheckIn(state, 'medium', now);
    expect(result.streak).toBe(4);
  });
});
