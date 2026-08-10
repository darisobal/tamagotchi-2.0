import {
  TrackState,
  TrackType,
  Intensity,
  Mood,
  CheckIn,
  HabitStatus,
  ComputedHabit,
  PetMoodInfo,
  HABIT_PERIOD_MS,
  PET_LIVES_MAX,
  DEFAULT_HABIT_NAME,
} from './types';

// ─── Pet lives ───────────────────────────────────────────

/**
 * Hearts left after consecutive missed deadlines since the last check-in.
 * 0 misses → 3, 1 miss → 2, 2 misses → 1, 3+ misses → dead.
 * Checking in resets the miss streak (back to 3).
 */
export function computeLives(missedDeadlines: number, hasCheckIn: boolean): number {
  if (!hasCheckIn) return 0;
  return Math.max(0, PET_LIVES_MAX - Math.max(0, missedDeadlines));
}

export function livesToMood(lives: number): Mood {
  switch (lives) {
    case 3:
      return 'happy';
    case 2:
      return 'okay';
    case 1:
      return 'sad';
    default:
      return 'dead';
  }
}

function livesToStatus(lives: number): HabitStatus {
  switch (lives) {
    case 3:
      return 'GREEN';
    case 2:
      return 'YELLOW';
    case 1:
      return 'RED';
    default:
      return 'OVERDUE';
  }
}

// ─── Habit status computation ────────────────────────────

export function computeHabitStatus(
  trackType: TrackType,
  lastCheckInAtIso: string | null,
  nowMs: number,
  periodMs: number = HABIT_PERIOD_MS[trackType],
): ComputedHabit {

  if (!lastCheckInAtIso) {
    return {
      trackType,
      progress: 0,
      timeRemainingMs: 0,
      status: 'OVERDUE',
      lives: 0,
      lastCheckInAt: null,
    };
  }

  const startMs = new Date(lastCheckInAtIso).getTime();
  const elapsedMs = Math.max(nowMs - startMs, 0);
  const missedDeadlines = Math.floor(elapsedMs / periodMs);
  const lives = computeLives(missedDeadlines, true);
  const status = livesToStatus(lives);

  // Time left in the current period until the next heart is lost (0 when dead).
  const msIntoCurrentPeriod = elapsedMs % periodMs;
  const timeRemainingMs =
    lives === 0 ? 0 : periodMs - msIntoCurrentPeriod;
  const progress =
    lives === 0 ? 0 : Math.min(Math.max(timeRemainingMs / periodMs, 0), 1);

  return {
    trackType,
    progress,
    timeRemainingMs,
    status,
    lives,
    lastCheckInAt: lastCheckInAtIso,
  };
}

export function computeAllHabits(
  tracks: TrackState[],
  nowMs: number,
  periodMs: number = HABIT_PERIOD_MS.main,
): ComputedHabit[] {
  return tracks.map((t) =>
    computeHabitStatus(t.trackType, t.lastCheckInAt, nowMs, periodMs),
  );
}

// ─── Pet mood ────────────────────────────────────────────

export function computePetMood(
  habits: ComputedHabit[],
  habitName: string = DEFAULT_HABIT_NAME,
): PetMoodInfo {
  if (habits.length === 0) {
    return { mood: 'dead', reason: '', lives: 0 };
  }

  const habit = habits[0];
  const name = habitName || DEFAULT_HABIT_NAME;
  const lives = habit.lives;
  const mood = livesToMood(lives);

  if (lives === 0) {
    return { mood, lives, reason: `${name} ran out of hearts` };
  }
  if (lives === 1) {
    return { mood, lives, reason: `${name} — one heart left` };
  }
  if (lives === 2) {
    return { mood, lives, reason: `${name} — missed a check-in` };
  }

  return { mood, lives, reason: 'keep it up!' };
}

// ─── Mood helpers ────────────────────────────────────────

export function getMoodEmoji(mood: Mood): string {
  switch (mood) {
    case 'happy': return '(^.^)';
    case 'okay': return '(-.-)';
    case 'sad': return '(;_;)';
    case 'dead': return '(x_x)';
  }
}

export function getStatusLine(habits: ComputedHabit[], habitName?: string): string {
  const { reason } = computePetMood(habits, habitName);
  return reason;
}

// ─── Countdown formatting ────────────────────────────────

export function formatCountdown(timeRemainingMs: number): string {
  if (timeRemainingMs <= 0) return 'overdue';

  const totalSeconds = Math.floor(timeRemainingMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  const hours = totalHours;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} left`;
}

/** HH:MM until the next life is lost (egg flip face). */
export function formatLifeTimer(timeRemainingMs: number): string {
  if (timeRemainingMs <= 0) return '00:00';

  const totalMinutes = Math.floor(timeRemainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ─── Streak ──────────────────────────────────────────────

/** Local YYYY-MM-DD; used for streaks and calendar day keys from check-ins. */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayBefore(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}

export function computeStreakAfterCheckIn(
  state: TrackState,
  now: Date
): { streak: number; lastCompletedDay: string } {
  const today = toDateString(now);

  if (state.lastCompletedDay === today) {
    return { streak: state.streak, lastCompletedDay: today };
  }

  if (state.lastCompletedDay && state.lastCompletedDay === dayBefore(today)) {
    return { streak: state.streak + 1, lastCompletedDay: today };
  }

  return { streak: 1, lastCompletedDay: today };
}

export function recomputeStreakFromCheckIns(checkIns: CheckIn[]): {
  streak: number;
  lastCompletedDay: string | null;
} {
  if (checkIns.length === 0) {
    return { streak: 0, lastCompletedDay: null };
  }

  const days = [
    ...new Set(checkIns.map((c) => toDateString(new Date(c.timestamp)))),
  ].sort();

  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (dayBefore(days[i]) === days[i - 1]) {
      streak++;
    } else {
      break;
    }
  }

  return {
    streak,
    lastCompletedDay: days[days.length - 1],
  };
}

// ─── Check-in processing ─────────────────────────────────

export function processCheckIn(
  state: TrackState,
  _intensity: Intensity,
  now: Date
): TrackState {
  const { streak, lastCompletedDay } = computeStreakAfterCheckIn(state, now);

  return {
    ...state,
    level: 100,
    lastCheckInAt: now.toISOString(),
    streak,
    lastCompletedDay,
  };
}

export function isCompletedToday(state: TrackState): boolean {
  if (!state.lastCompletedDay) return false;
  return state.lastCompletedDay === toDateString(new Date());
}

// ─── Progressive success celebration (allGood) ───────────

/**
 * Sports-ball emoji cycle shown after rockstar on consecutive happy days.
 * Unicode only — platform/system emoji fonts render these (no bundled art).
 *
 * Support (all Emoji 1.0 / Unicode ≤8.0, well before Expo SDK 54 targets):
 *   ⚽ U+26BD, 🎾 U+1F3BE, 🏀 U+1F3C0, 🏐 U+1F3D0, 🏈 U+1F3C8
 */
export const SUCCESS_BALL_EMOJIS = ['⚽', '🎾', '🏀', '🏐', '🏈'] as const;

export type SuccessCelebrationKind = 'paidVibes' | 'rockstar' | 'balls';

export type SuccessCelebration =
  | { kind: 'paidVibes' }
  | { kind: 'rockstar' }
  | { kind: 'balls'; ballIndex: number; emoji: (typeof SUCCESS_BALL_EMOJIS)[number] };

/** YYYY-MM-DD shifted by `deltaDays` (negative = earlier). */
export function shiftDateString(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + deltaDays);
  return toDateString(d);
}

/**
 * True when the first calendar day of the current streak had a paid €1 restart.
 * Used so the ladder stays: paid vibes → rockstar → balls (not paid → balls).
 */
export function streakBeganWithPaidRestart(
  checkIns: CheckIn[],
  streak: number,
  lastCompletedDay: string | null,
): boolean {
  if (streak < 1 || !lastCompletedDay) return false;
  const startDay = shiftDateString(lastCompletedDay, -(streak - 1));
  return checkIns.some(
    (c) =>
      Boolean(c.isPaidRestart) &&
      toDateString(new Date(c.timestamp)) === startDay,
  );
}

/**
 * Happy-window celebration tier derived from streak + paid-restart history.
 * Advances only when streak advances (new successful habit day) — not on reload.
 */
export function resolveSuccessCelebration(options: {
  isAllGood: boolean;
  lastCheckInWasPaidRestart: boolean;
  streak: number;
  streakBeganWithPaidRestart: boolean;
}): SuccessCelebration | null {
  const {
    isAllGood,
    lastCheckInWasPaidRestart,
    streak,
    streakBeganWithPaidRestart: beganPaid,
  } = options;

  if (!isAllGood) return null;
  if (lastCheckInWasPaidRestart) return { kind: 'paidVibes' };

  // After a paid-restart day: streak 2 is still rockstar; balls from streak 3.
  // Normal streak: rockstar on day 1, balls from day 2.
  const ballsFromStreak = beganPaid ? 3 : 2;
  if (streak >= ballsFromStreak) {
    const ballIndex =
      (streak - ballsFromStreak) % SUCCESS_BALL_EMOJIS.length;
    return {
      kind: 'balls',
      ballIndex,
      emoji: SUCCESS_BALL_EMOJIS[ballIndex],
    };
  }

  return { kind: 'rockstar' };
}

/**
 * Localhost / QA preview via URL query params (does not write to storage).
 *
 *   /?demo=paid
 *   /?demo=rockstar
 *   /?demo=balls          → soccer (index 0)
 *   /?demo=balls&ball=2   → tennis (1-based: 1…5)
 */
export function parseSuccessDemo(
  demoRaw: string | string[] | undefined,
  ballRaw?: string | string[] | undefined,
): SuccessCelebration | null {
  const demo = Array.isArray(demoRaw) ? demoRaw[0] : demoRaw;
  if (!demo) return null;

  const key = demo.trim().toLowerCase();
  if (key === 'paid' || key === 'paidvibes' || key === 'vibes') {
    return { kind: 'paidVibes' };
  }
  if (key === 'rockstar') {
    return { kind: 'rockstar' };
  }
  if (key === 'balls' || key === 'ball') {
    const ballParam = Array.isArray(ballRaw) ? ballRaw[0] : ballRaw;
    const parsed = ballParam ? Number.parseInt(ballParam, 10) : 1;
    const oneBased = Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
    const ballIndex = (oneBased - 1) % SUCCESS_BALL_EMOJIS.length;
    return {
      kind: 'balls',
      ballIndex,
      emoji: SUCCESS_BALL_EMOJIS[ballIndex],
    };
  }
  return null;
}

/** Map a celebration (including demos) to theme options that force that greeting. */
export function celebrationToThemeOptions(
  celebration: SuccessCelebration,
): {
  lastCheckInWasPaidRestart: boolean;
  streak: number;
  streakBeganWithPaidRestart: boolean;
} {
  if (celebration.kind === 'paidVibes') {
    return {
      lastCheckInWasPaidRestart: true,
      streak: 1,
      streakBeganWithPaidRestart: true,
    };
  }
  if (celebration.kind === 'rockstar') {
    return {
      lastCheckInWasPaidRestart: false,
      streak: 1,
      streakBeganWithPaidRestart: false,
    };
  }
  // Normal ladder: balls start at streak 2 + ballIndex
  return {
    lastCheckInWasPaidRestart: false,
    streak: 2 + celebration.ballIndex,
    streakBeganWithPaidRestart: false,
  };
}

// ─── Legacy compat (kept for imports that haven't migrated) ──

export function applyDecay(state: TrackState, _now: Date): TrackState {
  return state;
}

export function computeMood(levels: number[]): Mood {
  if (levels.length === 0) return 'okay';
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  if (avg >= 60) return 'happy';
  if (avg >= 40) return 'okay';
  if (avg >= 20) return 'sad';
  return 'dead';
}
