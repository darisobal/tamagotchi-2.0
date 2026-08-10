/**
 * Cheeky confirmation copy for the “i did it” gate.
 * Personality only — button meaning/position never changes with these pools.
 */

export const CONFIRMATION_MESSAGES = [
  'wait. you actually did it?\nno bullshit?',
  'look me in the eyes.\ndid you actually do it?',
  'you wouldn’t lie to this face, would you?',
  'okay, serious question.\ndid you really do it?',
  'this is between you and your conscience.\ndid you do it?',
] as const;

export const POSITIVE_BUTTON_LABELS = [
  'yep, I did',
  'I swear',
  'hell yeah',
  '100% did it',
  'cross my heart',
] as const;

export const NEGATIVE_BUTTON_LABELS = [
  'okay, you got me',
  'fine, I lied',
  '…not really',
  'abort mission',
  'okay, busted',
] as const;

export type ConfirmationMessage = (typeof CONFIRMATION_MESSAGES)[number];
export type PositiveButtonLabel = (typeof POSITIVE_BUTTON_LABELS)[number];
export type NegativeButtonLabel = (typeof NEGATIVE_BUTTON_LABELS)[number];

export type CheckInConfirmCopy = {
  message: ConfirmationMessage;
  positiveLabel: PositiveButtonLabel;
  negativeLabel: NegativeButtonLabel;
};

type LastPicks = {
  message: ConfirmationMessage | null;
  positiveLabel: PositiveButtonLabel | null;
  negativeLabel: NegativeButtonLabel | null;
};

/** In-memory only — avoid immediate repeats within the same app session. */
const lastPicks: LastPicks = {
  message: null,
  positiveLabel: null,
  negativeLabel: null,
};

function pickAvoidingRepeat<T>(
  pool: readonly T[],
  last: T | null,
  random: () => number,
): T {
  if (pool.length === 0) {
    throw new Error('empty copy pool');
  }
  if (pool.length === 1) return pool[0];

  const options = last == null ? [...pool] : pool.filter((item) => item !== last);
  const choices = options.length > 0 ? options : [...pool];
  const index = Math.floor(random() * choices.length);
  return choices[index];
}

/** Select a fresh message + button labels, avoiding the last shown values when possible. */
export function pickCheckInConfirmCopy(
  random: () => number = Math.random,
): CheckInConfirmCopy {
  const message = pickAvoidingRepeat(CONFIRMATION_MESSAGES, lastPicks.message, random);
  const positiveLabel = pickAvoidingRepeat(
    POSITIVE_BUTTON_LABELS,
    lastPicks.positiveLabel,
    random,
  );
  const negativeLabel = pickAvoidingRepeat(
    NEGATIVE_BUTTON_LABELS,
    lastPicks.negativeLabel,
    random,
  );

  lastPicks.message = message;
  lastPicks.positiveLabel = positiveLabel;
  lastPicks.negativeLabel = negativeLabel;

  return { message, positiveLabel, negativeLabel };
}

/** Test helper — clears session anti-repeat state. */
export function resetCheckInConfirmCopySession(): void {
  lastPicks.message = null;
  lastPicks.positiveLabel = null;
  lastPicks.negativeLabel = null;
}
