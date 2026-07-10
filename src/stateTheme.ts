import { Mood, Difficulty } from './types';
import { Colors } from './theme';

/**
 * Maps the pet's mood to a full visual + copy palette that matches
 * the Figma frames (All good / Neutral / Sad / Dead).
 *
 * Lives → mood → scene:
 *   3 hearts → happy   → allGood
 *   2 hearts → okay    → toDo (neutral)
 *   1 heart  → sad     → sad
 *   0 hearts → dead    → failed
 */

export type StateScene = 'allGood' | 'toDo' | 'sad' | 'failed';

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
  showConfetti: boolean;
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
    default:
      return 'toDo';
  }
}

const DEFAULT_NAME = 'champ';

/** Shared copy + palette tokens used across the four Figma home frames. */
const CHECK_IN_LABEL = 'I DID IT!!!!!1';

export function getStateTheme(mood: Mood, difficulty: Difficulty = 'gentle'): StateTheme {
  const scene = moodToScene(mood);
  const tough = difficulty === 'tough';

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
      showConfetti: true,
      showCrossOut: false,
      greeting: (name = DEFAULT_NAME) => `Hi ${name}!`,
      motto: () => (tough ? "DON'T STOP NOW!" : 'Skip = RIP.'),
      checkInLabel: CHECK_IN_LABEL,
    };
  }

  if (scene === 'failed') {
    return {
      scene,
      ...shared,
      bg: Colors.stateBadBg,
      inkSoft: '#330000',
      showConfetti: false,
      showCrossOut: true,
      greeting: (name = DEFAULT_NAME) => `Ugh, ${name}!`,
      motto: () => 'I died waiting.',
      checkInLabel: 'START AGAIN',
    };
  }

  if (scene === 'sad') {
    return {
      scene,
      ...shared,
      bg: Colors.stateSadBg,
      inkSoft: '#1A1A1A',
      showConfetti: false,
      showCrossOut: false,
      greeting: (name = DEFAULT_NAME) => `Hi ${name}!`,
      motto: () => 'Your laziness, my funeral.',
      checkInLabel: CHECK_IN_LABEL,
    };
  }

  // toDo — neutral (2 hearts)
  return {
    scene,
    ...shared,
    bg: Colors.stateTodoBg,
    inkSoft: '#1A1A1A',
    showConfetti: false,
    showCrossOut: false,
    greeting: (name = DEFAULT_NAME) => `Hi ${name}!`,
    motto: () => (tough ? 'FAaaaaSTER!' : "Don't make me die cringe."),
    checkInLabel: CHECK_IN_LABEL,
  };
}
