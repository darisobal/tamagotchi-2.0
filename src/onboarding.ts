import { HabitCadence, UserPrefs, habitCadenceToPeriodMs, HABIT_NAME_MAX } from './types';
import type { UserSnapshot } from './sync';

export const CADENCE_RULES: Record<HabitCadence, string> = {
  daily: 'check in within every 24 hours.',
  every2days: 'check in within every 48 hours.',
  weekly: 'check in within every 7 days (168 hours).',
};

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).toLowerCase();
}

export function startPlan(prefs: UserPrefs, habitName: string, cadence: HabitCadence, petName: string, now: Date): UserPrefs {
  if (!habitName.trim()) throw new Error('give your habit a name before continuing.');
  if (!petName.trim()) throw new Error('give your pet a name before continuing.');
  return { ...prefs, habitName: habitName.trim().slice(0, HABIT_NAME_MAX), habitCadence: cadence,
    petName: petName.trim(), planStartedAt: now.toISOString(), onboardingDone: true, onboardingDraft: null };
}

export function firstDeadline(cadence: HabitCadence, now = Date.now()): string {
  return new Date(now + habitCadenceToPeriodMs(cadence)).toISOString();
}

export function hasProgress(snapshot: UserSnapshot | null): boolean {
  return Boolean(snapshot && (snapshot.prefs.onboardingDone || snapshot.prefs.planStartedAt || snapshot.checkIns.length));
}

export function initialRoute(prefs: UserPrefs, passwordRecoveryPending: boolean): '/reset-password' | '/onboarding' | '/(tabs)' {
  return passwordRecoveryPending ? '/reset-password' : prefs.onboardingDone ? '/(tabs)' : '/onboarding';
}

/** Import a guest only into a verified empty account. Conflicting plans stay separate. */
export function guestTransition(guest: UserSnapshot, account: UserSnapshot, remote: UserSnapshot | null): 'guest' | 'account' | 'choose' {
  if (!hasProgress(guest)) return 'account';
  if (hasProgress(remote) || hasProgress(account)) return 'choose';
  return 'guest';
}
