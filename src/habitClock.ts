import { TrackState } from './types';

export const FAILURE_LIMIT = 5;
export interface FailureRecord { at: number; day: string; level: number; }
export interface HabitClock {
  history?: FailureRecord[];
  deadlineAt: number;
  periodMs: number;
  failures: number;
  lastFailureDay: string | null;
  rewardedDay: string | null;
}
export function localDay(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Old profiles retain their last deadline; history is never rewritten or rewarded twice. */
export function initialClock(track: TrackState, periodMs: number, planStartedAt: string | null, now: number): HabitClock {
  if (track.habitClock) return track.habitClock;
  const anchor = Date.parse(track.lastCheckInAt ?? planStartedAt ?? '');
  return { deadlineAt: (Number.isFinite(anchor) ? anchor : now) + periodMs, periodMs,
    failures: 0, lastFailureDay: null, rewardedDay: track.lastCompletedDay };
}

/** Pure projection also catches deadlines missed while the app was closed. */
export function advanceClock(clock: HabitClock, now: number): HabitClock {
  let next = { ...clock, history: [...(clock.history ?? [])] };
  while (next.deadlineAt <= now && next.failures < FAILURE_LIMIT) {
    const day = localDay(next.deadlineAt);
    if (next.lastFailureDay !== day) {
      next.failures += 1;
      next.history.push({ at: next.deadlineAt, day, level: next.failures });
    }
    next.lastFailureDay = day;
    next.deadlineAt += next.periodMs;
  }
  return next;
}

export function failClock(clock: HabitClock, now: number): HabitClock {
  const next = advanceClock(clock, now);
  const today = localDay(now);
  if (next.lastFailureDay === today || next.rewardedDay === today || next.failures >= FAILURE_LIMIT) return next;
  return { ...next, failures: next.failures + 1, lastFailureDay: today,
    history: [...(next.history ?? []), { at: now, day: today, level: next.failures + 1 }] };
}

export function rewardClock(clock: HabitClock, now: number, periodMs: number, restart = false): HabitClock {
  const next = advanceClock(clock, now);
  const today = localDay(now);
  if (restart) return { history: next.history, deadlineAt: now + periodMs, periodMs, failures: 0, lastFailureDay: null, rewardedDay: today };
  if (next.failures >= FAILURE_LIMIT) throw new Error('Start again to revive your pet.');
  if (next.rewardedDay === today) return next;
  return { ...next, deadlineAt: next.deadlineAt + periodMs, periodMs,
    failures: 0, lastFailureDay: null, rewardedDay: today };
}

export function formatHabitTimer(remainingMs: number): string {
  if (remainingMs >= 48 * 60 * 60 * 1000) return `${Math.floor(remainingMs / 86400000)} days left`;
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} left`;
}
