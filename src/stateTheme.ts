import { Mood } from './types';
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
const CHECK_IN_LABEL = 'i did it!!!!!1';

export function getStateTheme(mood: Mood): StateTheme {
  const scene = moodToScene(mood);

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
      greeting: (name = DEFAULT_NAME) => `hi ${name}!`,
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
      showConfetti: false,
      showCrossOut: true,
      greeting: (name = DEFAULT_NAME) => `ugh, ${name}!`,
      motto: () => 'i died waiting.',
      checkInLabel: 'start again',
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
      greeting: (name = DEFAULT_NAME) => `hi ${name}!`,
      motto: () => 'your laziness, my funeral.',
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
    greeting: (name = DEFAULT_NAME) => `hi ${name}!`,
    motto: () => "don't make me die cringe.",
    checkInLabel: CHECK_IN_LABEL,
  };
}
