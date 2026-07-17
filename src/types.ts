/**
 * Single-habit data model.
 *
 * The app tracks exactly one user-defined habit (the "main" track). The
 * user-facing label is stored in `UserPrefs.habitName` so it can be renamed
 * at any time without migrating data.
 */

export type TrackType = 'main';

export type Intensity = 'small' | 'medium' | 'big';

export type PetType = 'dino' | 'bird' | 'selfie';

export type Mood = 'happy' | 'okay' | 'sad' | 'dead';

/** How long until the next check-in is due (single-habit app). */
export type HabitCadence = 'daily' | 'every2days' | 'weekly';

export interface CheckIn {
  id: string;
  trackType: TrackType;
  intensity: Intensity;
  note: string | null;
  timestamp: string; // ISO string
  /**
   * True when this check-in restarted the pet after a paid revive (€1 IAP).
   * History marks that calendar day as a paid day.
   */
  isPaidRestart?: boolean;
}

export interface TrackState {
  trackType: TrackType;
  level: number; // 0–100
  lastCheckInAt: string | null; // ISO string
  streak: number;
  lastCompletedDay: string | null; // YYYY-MM-DD
}

export type PetHat = 'none' | 'top' | 'beanie' | 'crown';

export interface UserPrefs {
  petType: PetType;
  onboardingDone: boolean;
  customSprite?: string | null;
  /** Human-readable name for the single tracked habit. */
  habitName: string;
  /** Display name for the pet. */
  petName: string;
  /** Hex colour used to draw the line-art pet. */
  petColor: string;
  /** Cosmetic hat sitting on top of the pet. */
  petHat: PetHat;
  /** Time between check-ins before the habit goes overdue. */
  habitCadence: HabitCadence;
}

/** Pet colour swatches shown in onboarding + settings. */
export const PET_COLOR_OPTIONS: { id: string; color: string; label: string }[] = [
  { id: 'royal',  color: '#1F1AE6', label: 'royal' },
  { id: 'coral',  color: '#FF6F61', label: 'coral' },
  { id: 'forest', color: '#2E7D32', label: 'forest' },
  { id: 'grape',  color: '#A66CFF', label: 'grape' },
  { id: 'pink',   color: '#FF1493', label: 'pink' },
  { id: 'ink',    color: '#000000', label: 'ink' },
];

export const DEFAULT_PET_COLOR = '#1F1AE6';

export const PET_HAT_OPTIONS: { id: PetHat; label: string; symbol: string }[] = [
  { id: 'none',   label: 'no hat',  symbol: 'x' },
  { id: 'top',    label: 'top hat', symbol: 'T' },
  { id: 'beanie', label: 'beanie',  symbol: 'B' },
  { id: 'crown',  label: 'crown',   symbol: 'C' },
];

export const MAIN_TRACK: TrackType = 'main';

/** Used by storage/iteration code that previously walked multiple tracks. */
export const ALL_TRACKS: TrackType[] = [MAIN_TRACK];

export const DEFAULT_HABIT_NAME = 'read 10 pages';

/** Previous placeholder default — migrate so existing users see the new example. */
export const LEGACY_DEFAULT_HABIT_NAME = 'my habit';

export function resolveHabitName(stored: string | null | undefined): string {
  if (!stored || stored === LEGACY_DEFAULT_HABIT_NAME) return DEFAULT_HABIT_NAME;
  return stored;
}

export const DEFAULT_PET_NAME = 'noodle';

/** Previous placeholder default — migrate so existing users see the new example. */
export const LEGACY_DEFAULT_PET_NAME = 'buddy';

export function resolvePetName(stored: string | null | undefined): string {
  if (!stored || stored === LEGACY_DEFAULT_PET_NAME) return DEFAULT_PET_NAME;
  return stored;
}

export function normalizeUserPrefs(partial: Partial<UserPrefs>): UserPrefs {
  return {
    petType: partial.petType ?? 'dino',
    onboardingDone: partial.onboardingDone ?? true,
    customSprite: partial.customSprite ?? null,
    habitName: resolveHabitName(partial.habitName),
    petName: resolvePetName(partial.petName),
    petColor: partial.petColor ?? DEFAULT_PET_COLOR,
    petHat: partial.petHat ?? 'none',
    habitCadence: partial.habitCadence ?? DEFAULT_HABIT_CADENCE,
  };
}

export const DEFAULT_HABIT_CADENCE: HabitCadence = 'daily';

/** Labels for the cadence picker in settings / onboarding. */
export const CADENCE_OPTIONS: { id: HabitCadence; label: string }[] = [
  { id: 'daily', label: 'daily' },
  { id: 'every2days', label: 'every two days' },
  { id: 'weekly', label: 'weekly' },
];

export const INTENSITY_POINTS: Record<Intensity, number> = {
  small: 10,
  medium: 20,
  big: 30,
};

// ─── Progress-based habit system ─────────────────────────

export type HabitStatus = 'GREEN' | 'YELLOW' | 'RED' | 'OVERDUE';

export interface ComputedHabit {
  trackType: TrackType;
  progress: number;        // 0..1, fraction of current period still left
  timeRemainingMs: number; // ms until next missed deadline (0 if dead)
  status: HabitStatus;
  lives: number;           // 0..PET_LIVES_MAX
  lastCheckInAt: string | null;
}

/** Hearts left — each missed period costs one; die after missing PET_LIVES_MAX in a row. */
export const PET_LIVES_MAX = 3;

export interface PetMoodInfo {
  mood: Mood;
  reason: string;
  lives: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Legacy default period per track (daily). */
export const HABIT_PERIOD_MS: Record<TrackType, number> = {
  main: DAY,
};

/** Milliseconds for each cadence setting. */
export const HABIT_CADENCE_MS: Record<HabitCadence, number> = {
  daily: DAY,
  every2days: 2 * DAY,
  weekly: 7 * DAY,
};

export function habitCadenceToPeriodMs(cadence: HabitCadence | undefined): number {
  if (!cadence) return HABIT_PERIOD_MS.main;
  return HABIT_CADENCE_MS[cadence];
}
