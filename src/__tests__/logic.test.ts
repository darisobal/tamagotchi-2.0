import {
  computeHabitStatus,
  computeAllHabits,
  computePetMood,
  computeLives,
  livesToMood,
  formatCountdown,
  processCheckIn,
} from '../logic';
import { TrackState, ComputedHabit, HABIT_PERIOD_MS, MAIN_TRACK, PET_LIVES_MAX } from '../types';

function makeTrackState(lastCheckInAt: string | null = null): TrackState {
  return {
    trackType: MAIN_TRACK,
    level: 50,
    lastCheckInAt,
    streak: 0,
    lastCompletedDay: null,
  };
}

describe('computeLives', () => {
  test('full progress → 3 lives', () => {
    expect(computeLives(1, true)).toBe(3);
    expect(computeLives(0.71, true)).toBe(3);
  });

  test('middle third → 2 lives', () => {
    expect(computeLives(0.5, true)).toBe(2);
    expect(computeLives(2 / 3, true)).toBe(2);
  });

  test('final third → 1 life', () => {
    expect(computeLives(0.2, true)).toBe(1);
    expect(computeLives(1 / 3, true)).toBe(1);
  });

  test('no check-in or overdue → 0 lives', () => {
    expect(computeLives(0, true)).toBe(0);
    expect(computeLives(0.5, false)).toBe(0);
  });
});

describe('livesToMood', () => {
  test('maps lives to the four moods', () => {
    expect(livesToMood(3)).toBe('happy');
    expect(livesToMood(2)).toBe('okay');
    expect(livesToMood(1)).toBe('sad');
    expect(livesToMood(0)).toBe('dead');
  });
});

describe('computeHabitStatus', () => {
  const HOUR = 60 * 60 * 1000;

  test('just checked in → progress ≈ 1, 3 lives, GREEN', () => {
    const now = Date.now();
    const result = computeHabitStatus(MAIN_TRACK, new Date(now).toISOString(), now);
    expect(result.progress).toBeCloseTo(1, 2);
    expect(result.lives).toBe(3);
    expect(result.status).toBe('GREEN');
    expect(result.timeRemainingMs).toBeCloseTo(HABIT_PERIOD_MS.main, -3);
  });

  test('no check-in ever → 0 lives, OVERDUE', () => {
    const result = computeHabitStatus(MAIN_TRACK, null, Date.now());
    expect(result.progress).toBe(0);
    expect(result.lives).toBe(0);
    expect(result.timeRemainingMs).toBe(0);
    expect(result.status).toBe('OVERDUE');
  });

  test('one third elapsed → 2 lives, YELLOW', () => {
    const now = Date.now();
    const thirdAgo = now - HABIT_PERIOD_MS.main / 3;
    const result = computeHabitStatus(MAIN_TRACK, new Date(thirdAgo).toISOString(), now);
    expect(result.progress).toBeCloseTo(2 / 3, 1);
    expect(result.lives).toBe(2);
    expect(result.status).toBe('YELLOW');
  });

  test('half period elapsed → 2 lives, YELLOW', () => {
    const now = Date.now();
    const halfAgo = now - HABIT_PERIOD_MS.main / 2;
    const result = computeHabitStatus(MAIN_TRACK, new Date(halfAgo).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.5, 1);
    expect(result.lives).toBe(2);
    expect(result.status).toBe('YELLOW');
  });

  test('two thirds elapsed → 1 life, RED', () => {
    const now = Date.now();
    const twoThirdsAgo = now - (HABIT_PERIOD_MS.main * 2) / 3;
    const result = computeHabitStatus(MAIN_TRACK, new Date(twoThirdsAgo).toISOString(), now);
    expect(result.progress).toBeCloseTo(1 / 3, 1);
    expect(result.lives).toBe(1);
    expect(result.status).toBe('RED');
  });

  test('90% elapsed → 1 life, RED', () => {
    const now = Date.now();
    const elapsed90 = now - HABIT_PERIOD_MS.main * 0.9;
    const result = computeHabitStatus(MAIN_TRACK, new Date(elapsed90).toISOString(), now);
    expect(result.progress).toBeCloseTo(0.1, 1);
    expect(result.lives).toBe(1);
    expect(result.status).toBe('RED');
  });

  test('past deadline → 0 lives, OVERDUE', () => {
    const now = Date.now();
    const wayPast = now - HABIT_PERIOD_MS.main * 2;
    const result = computeHabitStatus(MAIN_TRACK, new Date(wayPast).toISOString(), now);
    expect(result.progress).toBe(0);
    expect(result.lives).toBe(0);
    expect(result.status).toBe('OVERDUE');
  });

  test('main track uses a 24h period', () => {
    expect(HABIT_PERIOD_MS.main).toBe(24 * HOUR);
  });

  test('max lives is three', () => {
    expect(PET_LIVES_MAX).toBe(3);
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

  test('just checked in → happy, 3 lives', () => {
    const info = computePetMood(habitFromCheckin(0), 'workout');
    expect(info.mood).toBe('happy');
    expect(info.lives).toBe(3);
  });

  test('still fresh (1h elapsed of 24h) → happy', () => {
    const { mood } = computePetMood(habitFromCheckin(1 * HOUR), 'workout');
    expect(mood).toBe('happy');
  });

  test('half of period elapsed → okay (2 lives)', () => {
    const { mood, lives, reason } = computePetMood(
      habitFromCheckin(HABIT_PERIOD_MS.main * 0.5),
      'read pages',
    );
    expect(mood).toBe('okay');
    expect(lives).toBe(2);
    expect(reason).toContain('read pages');
  });

  test('two thirds of period elapsed → sad (1 life)', () => {
    const { mood, lives, reason } = computePetMood(
      habitFromCheckin((HABIT_PERIOD_MS.main * 2) / 3),
      'workout',
    );
    expect(mood).toBe('sad');
    expect(lives).toBe(1);
    expect(reason).toContain('workout');
  });

  test('overdue → dead, 0 lives', () => {
    const { mood, lives, reason } = computePetMood(habitFromCheckin(30 * HOUR), 'meditate');
    expect(mood).toBe('dead');
    expect(lives).toBe(0);
    expect(reason).toContain('meditate');
  });

  test('no check-ins ever → dead', () => {
    const { mood, lives } = computePetMood(habitFromCheckin(null), 'workout');
    expect(mood).toBe('dead');
    expect(lives).toBe(0);
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
