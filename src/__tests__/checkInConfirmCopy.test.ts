import {
  CONFIRMATION_MESSAGES,
  NEGATIVE_BUTTON_LABELS,
  POSITIVE_BUTTON_LABELS,
  pickCheckInConfirmCopy,
  resetCheckInConfirmCopySession,
} from '../checkInConfirmCopy';

describe('pickCheckInConfirmCopy', () => {
  beforeEach(() => {
    resetCheckInConfirmCopySession();
  });

  test('returns values from the approved pools', () => {
    const copy = pickCheckInConfirmCopy(() => 0);
    expect(CONFIRMATION_MESSAGES).toContain(copy.message);
    expect(POSITIVE_BUTTON_LABELS).toContain(copy.positiveLabel);
    expect(NEGATIVE_BUTTON_LABELS).toContain(copy.negativeLabel);
  });

  test('avoids immediately repeating the same message and button labels', () => {
    // Always pick index 0 from whatever pool remains after filtering.
    const alwaysFirst = () => 0;
    const first = pickCheckInConfirmCopy(alwaysFirst);
    const second = pickCheckInConfirmCopy(alwaysFirst);

    expect(second.message).not.toBe(first.message);
    expect(second.positiveLabel).not.toBe(first.positiveLabel);
    expect(second.negativeLabel).not.toBe(first.negativeLabel);
  });

  test('pools stay independent across picks', () => {
    const picks = Array.from({ length: 20 }, () => pickCheckInConfirmCopy());
    for (const copy of picks) {
      expect(CONFIRMATION_MESSAGES).toContain(copy.message);
      expect(POSITIVE_BUTTON_LABELS).toContain(copy.positiveLabel);
      expect(NEGATIVE_BUTTON_LABELS).toContain(copy.negativeLabel);
    }
  });
});
