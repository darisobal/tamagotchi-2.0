export const BALL_EMOJI_CYCLE = ['⚽', '🎾', '🏀', '🏐', '🏈'] as const;

export type SuccessCelebrationKind = 'paid' | 'rockstar' | 'balls';

export interface SuccessCelebration {
  kind: SuccessCelebrationKind;
  /** Present when kind === 'balls' — both overlay balls use the same emoji. */
  ballEmoji?: string;
  ballIndex?: number;
}

/**
 * Maps persisted celebration count to the home-screen success tier.
 *
 * Progression: paid vibes (if applicable) → rockstar → balls (cycle of 5 emoji pairs).
 * Count advances on every successful check-in, including multiple check-ins the same day.
 */
export function getSuccessCelebration(params: {
  celebrationCount: number;
  lastCheckInWasPaidRestart: boolean;
  celebrationPaidStart: boolean;
}): SuccessCelebration {
  const { celebrationCount, lastCheckInWasPaidRestart, celebrationPaidStart } = params;

  if (lastCheckInWasPaidRestart) {
    return { kind: 'paid' };
  }

  const rockstarSteps = celebrationPaidStart ? 2 : 1;

  if (celebrationCount <= rockstarSteps) {
    return { kind: 'rockstar' };
  }

  const ballIndex = (celebrationCount - rockstarSteps - 1) % BALL_EMOJI_CYCLE.length;

  return {
    kind: 'balls',
    ballEmoji: BALL_EMOJI_CYCLE[ballIndex],
    ballIndex,
  };
}

export const BALLS_GREETING = 'holy shit.\nyou have balls!';
