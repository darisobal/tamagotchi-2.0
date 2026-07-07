import { Mood, Difficulty } from './types';
import { Colors } from './theme';

/**
 * Maps the pet's mood to a full visual + copy palette that matches
 * the three Figma frames (To do / All good / Failed).
 *
 * Two moods can share the same scene:
 *   happy        → "all good"   (you're winning)
 *   okay  / sad  → "to do"      (something's pending)
 *   dead         → "failed"     (you missed it)
 */

export type StateScene = 'allGood' | 'toDo' | 'failed';

export interface StateTheme {
  scene: StateScene;
  bg: string;
  ink: string;            // headline / body colour
  inkSoft: string;        // captions
  cardBg: string;         // hero card fill
  cardInk: string;        // hero card text colour
  cardBorder: string;
  numberInk: string;      // big "10" colour inside the card
  mottoInk: string;       // status line inside the hero card
  pet: string;            // pixel pet colour
  showConfetti: boolean;
  showCrossOut: boolean;  // strike-through "X" over the task
  greeting: (name?: string) => string;
  prelude: string | null; // small line above the number (e.g. "Go and do")
  motto: (firstHabit: string) => string;
}

export function moodToScene(mood: Mood): StateScene {
  switch (mood) {
    case 'happy':
      return 'allGood';
    case 'dead':
      return 'failed';
    case 'okay':
    case 'sad':
    default:
      return 'toDo';
  }
}

const PERSON_NAME = 'champ';

export function getStateTheme(mood: Mood, difficulty: Difficulty = 'gentle'): StateTheme {
  const scene = moodToScene(mood);
  const tough = difficulty === 'tough';

  if (scene === 'allGood') {
    return {
      scene,
      bg: Colors.stateGoodBg,
      ink: Colors.ink,
      inkSoft: '#1A1A1A',
      cardBg: 'transparent',
      cardInk: Colors.ink,
      cardBorder: Colors.ink,
      numberInk: Colors.ink,
      mottoInk: '#FFFFFF',
      pet: Colors.pet,
      showConfetti: true,
      showCrossOut: false,
      greeting: (name = PERSON_NAME) => `Hi ${name}!`,
      prelude: null,
      motto: () => (tough ? "DON'T STOP NOW!" : "YOU'RE THE STRONGEST!"),
    };
  }

  if (scene === 'failed') {
    return {
      scene,
      bg: Colors.stateBadBg,
      ink: Colors.ink,
      inkSoft: '#330000',
      cardBg: 'transparent',
      cardInk: Colors.ink,
      cardBorder: Colors.ink,
      numberInk: Colors.ink,
      mottoInk: '#FFFFFF',
      pet: Colors.pet,
      showConfetti: false,
      showCrossOut: true,
      greeting: () => (tough ? 'Damn it!' : 'oh no...'),
      prelude: null,
      motto: () => 'WASTED!',
    };
  }

  // toDo (default — peach)
  return {
    scene,
    bg: Colors.stateTodoBg,
    ink: Colors.ink,
    inkSoft: '#1A1A1A',
    cardBg: 'transparent',
    cardInk: Colors.ink,
    cardBorder: Colors.ink,
      numberInk: Colors.ink,
      mottoInk: '#FFFFFF',
      pet: Colors.pet,
      showConfetti: false,
      showCrossOut: false,
      greeting: (name = PERSON_NAME) => `Hi ${name}!`,
      prelude: 'Go and do',
    motto: () => (tough ? 'FAaaaaSTER!' : "Let's gooo!"),
  };
}
