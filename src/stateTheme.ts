import { Mood } from './types';
import { Colors } from './theme';

/**
 * Maps the pet's mood to a full visual + copy palette that matches
 * the Figma frames (All good / Neutral / Sad / Dead).
 *
 * Lives → mood → scene (one heart lost per missed 24h period):
 *   3 hearts → happy   → allGood
 *   2 hearts → okay    → toDo (neutral)
 *   1 heart  → sad     → sad
 *   0 hearts → dead    → failed
 */

export type StateScene = 'allGood' | 'toDo' | 'sad' | 'failed' | 'sleeping';

export interface StateTheme {
  scene: StateScene;
  bg: string;
  ink: string;
  inkSoft: string;
  cardBg: string;
  cardInk: string;
  cardBorder: string;
  numberInk: string;
  mottoInk: string;
  pet: string;
  showCrossOut: boolean;
  greeting: (name?: string) => string;
  motto: (firstHabit: string) => string;
  checkInLabel: string;
}

export function moodToScene(mood: Mood): StateScene {
  switch (mood) {
    case 'happy':
      return 'allGood';
    case 'okay':
      return 'toDo';
    case 'sad':
      return 'sad';
    case 'dead':
      return 'failed';
    case 'sleeping':
      return 'sleeping';
    default:
      return 'toDo';
  }
}

const DEFAULT_NAME = 'champ';

/** Shared copy + palette tokens used across the four Figma home frames. */
const CHECK_IN_LABEL = 'i did it!!!!!1';

export interface StateThemeOptions {
  /** Most recent check-in was a paid €1 restart (not a habit log). */
  lastCheckInWasPaidRestart?: boolean;
}

export function getStateTheme(mood: Mood, options?: StateThemeOptions): StateTheme {
  const scene = moodToScene(mood);
  const paidRestart = Boolean(options?.lastCheckInWasPaidRestart);

  const shared = {
    ink: Colors.ink,
    cardBg: 'transparent',
    cardInk: Colors.ink,
    cardBorder: Colors.ink,
    numberInk: Colors.pet,
    mottoInk: Colors.ink,
    pet: Colors.pet,
  };

  if (scene === 'allGood') {
    return {
      scene,
      ...shared,
      bg: Colors.stateGoodBg,
      inkSoft: '#1A1A1A',
      showCrossOut: false,
      greeting: (name = DEFAULT_NAME) => {
        if (paidRestart) return 'paid for\ngood vibes';
        return `hi ${name}!`;
      },
      motto: () => 'skip = rip.',
      checkInLabel: CHECK_IN_LABEL,
    };
  }

  if (scene === 'failed') {
    return {
      scene,
      ...shared,
      bg: Colors.stateBadBg,
      inkSoft: '#330000',
      showCrossOut: true,
      greeting: (name = DEFAULT_NAME) => `ugh, ${name}!`,
      motto: () => 'i died waiting.',
      checkInLabel: 'restart for 1€',
    };
  }

  if (scene === 'sad') {
    return {
      scene,
      ...shared,
      bg: Colors.stateSadBg,
      inkSoft: '#1A1A1A',
      showCrossOut: false,
      greeting: (name = DEFAULT_NAME) => `hi ${name}!`,
      motto: () => 'your laziness, my funeral.',
      checkInLabel: CHECK_IN_LABEL,
    };
  }

  if (scene === 'sleeping') {
    return {
      scene,
      ...shared,
      bg: Colors.stateGoodBg,
      inkSoft: '#1A1A1A',
      showCrossOut: false,
      greeting: () => "you've got zero progress.",
      motto: () => 'your first check-in wakes them up.',
      checkInLabel: 'start tracking',
    };
  }

  // toDo — neutral (2 hearts)
  return {
    scene,
    ...shared,
    bg: Colors.stateTodoBg,
    inkSoft: '#1A1A1A',
    showCrossOut: false,
    greeting: (name = DEFAULT_NAME) => `hi ${name}!`,
    motto: () => "don't make me die cringe.",
    checkInLabel: CHECK_IN_LABEL,
  };
}
