import {
  computeHabitStatus,
  computeAllHabits,
  computePetMood,
  computeLives,
  livesToMood,
  formatCountdown,
  formatLifeTimer,
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
  test('no misses → 3 lives', () => {
    expect(computeLives(0, true)).toBe(3);
  });

  test('one missed deadline → 2 lives', () => {
    expect(computeLives(1, true)).toBe(2);
  });

  test('two missed deadlines → 1 life', () => {
    expect(computeLives(2, true)).toBe(1);
  });

  test('three or more misses → 0 lives', () => {
    expect(computeLives(3, true)).toBe(0);
    expect(computeLives(5, true)).toBe(0);
  });

  test('no check-in → 0 lives', () => {
    expect(computeLives(0, false)).toBe(0);
    expect(computeLives(1, false)).toBe(0);
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
  const DAY = HABIT_PERIOD_MS.main;

  test('just checked in → progress ≈ 1, 3 lives, GREEN', () => {
    const now = Date.now();
    const result = computeHabitStatus(MAIN_TRACK, new Date(now).toISOString(), now);
    expect(result.progress).toBeCloseTo(1, 2);
    expect(result.lives).toBe(3);
    expect(result.status).toBe('GREEN');
    expect(result.timeRemainingMs).toBeCloseTo(DAY, -3);
  });

  test('no check-in ever → 0 lives, OVERDUE', () => {
    const result = computeHabitStatus(MAIN_TRACK, null, Date.now());
    expect(result.progress).toBe(0);
    expect(result.lives).toBe(0);
    expect(result.timeRemainingMs).toBe(0);
    expect(result.status).toBe('OVERDUE');
  });

  test('still within first period → stays at 3 lives', () => {
    const now = Date.now();
    const halfAgo = now - DAY / 2;
    const result = computeHabitStatus(MAIN_TRACK, new Date(halfAgo).toISOString(), now);
    expect(result.lives).toBe(3);
    expect(result.status).toBe('GREEN');
    expect(result.progress).toBeCloseTo(0.5, 1);
  });

  test('almost at first deadline → still 3 lives', () => {
    const now = Date.now();
    const almostDay = now - (DAY - HOUR);
    const result = computeHabitStatus(MAIN_TRACK, new Date(almostDay).toISOString(), now);
    expect(result.lives).toBe(3);
    expect(result.status).toBe('GREEN');
    expect(result.timeRemainingMs).toBeCloseTo(HOUR, -3);
  });

  test('one missed deadline → 2 lives, YELLOW', () => {
    const now = Date.now();
    const dayPlus = now - (DAY + HOUR);
    const result = computeHabitStatus(MAIN_TRACK, new Date(dayPlus).toISOString(), now);
    expect(result.lives).toBe(2);
    expect(result.status).toBe('YELLOW');
    expect(result.timeRemainingMs).toBeCloseTo(DAY - HOUR, -3);
  });

  test('two missed deadlines → 1 life, RED', () => {
    const now = Date.now();
    const twoDaysPlus = now - (DAY * 2 + HOUR);
    const result = computeHabitStatus(MAIN_TRACK, new Date(twoDaysPlus).toISOString(), now);
    expect(result.lives).toBe(1);
    expect(result.status).toBe('RED');
  });

  test('three missed deadlines → 0 lives, OVERDUE', () => {
    const now = Date.now();
    const threeDays = now - DAY * 3;
    const result = computeHabitStatus(MAIN_TRACK, new Date(threeDays).toISOString(), now);
    expect(result.progress).toBe(0);
    expect(result.lives).toBe(0);
    expect(result.status).toBe('OVERDUE');
    expect(result.timeRemainingMs).toBe(0);
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
  const DAY = HABIT_PERIOD_MS.main;

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

  test('still within first period → happy', () => {
    const { mood, lives } = computePetMood(habitFromCheckin(DAY / 2), 'workout');
    expect(mood).toBe('happy');
    expect(lives).toBe(3);
  });

  test('one missed deadline → okay (2 lives)', () => {
    const { mood, lives, reason } = computePetMood(
      habitFromCheckin(DAY + HOUR),
      'read pages',
    );
    expect(mood).toBe('okay');
    expect(lives).toBe(2);
    expect(reason).toContain('read pages');
  });

  test('two missed deadlines → sad (1 life)', () => {
    const { mood, lives, reason } = computePetMood(
      habitFromCheckin(DAY * 2 + HOUR),
      'workout',
    );
    expect(mood).toBe('sad');
    expect(lives).toBe(1);
    expect(reason).toContain('workout');
  });

  test('three missed deadlines → dead, 0 lives', () => {
    const { mood, lives, reason } = computePetMood(habitFromCheckin(DAY * 3), 'meditate');
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

describe('formatLifeTimer', () => {
  const HOUR = 60 * 60 * 1000;

  test('shows HH:MM without suffix', () => {
    expect(formatLifeTimer(22 * HOUR + 2 * 60 * 1000)).toBe('22:02');
  });

  test('zero or negative is 00:00', () => {
    expect(formatLifeTimer(0)).toBe('00:00');
    expect(formatLifeTimer(-1000)).toBe('00:00');
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

  test('check-in after misses restores 3 lives via fresh deadline', () => {
    const now = Date.now();
    const DAY = HABIT_PERIOD_MS.main;
    const afterTwoMisses = computeHabitStatus(
      MAIN_TRACK,
      new Date(now - DAY * 2 - 1000).toISOString(),
      now,
    );
    expect(afterTwoMisses.lives).toBe(1);

    const checkedIn = processCheckIn(
      makeTrackState(new Date(now - DAY * 2 - 1000).toISOString()),
      'medium',
      new Date(now),
    );
    const afterCheckIn = computeHabitStatus(MAIN_TRACK, checkedIn.lastCheckInAt, now);
    expect(afterCheckIn.lives).toBe(3);
    expect(afterCheckIn.status).toBe('GREEN');
  });
});
