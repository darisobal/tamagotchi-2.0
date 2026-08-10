import {
  BALL_EMOJI_CYCLE,
  getSuccessCelebration,
} from '../successProgression';

describe('getSuccessCelebration', () => {
  test('paid restart on latest check-in shows paid vibes', () => {
    const result = getSuccessCelebration({
      celebrationCount: 1,
      lastCheckInWasPaidRestart: true,
      celebrationPaidStart: true,
    });
    expect(result.kind).toBe('paid');
  });

  test('first normal success shows rockstar', () => {
    const result = getSuccessCelebration({
      celebrationCount: 1,
      lastCheckInWasPaidRestart: false,
      celebrationPaidStart: false,
    });
    expect(result.kind).toBe('rockstar');
  });

  test('second check-in the same day shows balls tier 0', () => {
    const result = getSuccessCelebration({
      celebrationCount: 2,
      lastCheckInWasPaidRestart: false,
      celebrationPaidStart: false,
    });
    expect(result.kind).toBe('balls');
    expect(result.ballEmoji).toBe(BALL_EMOJI_CYCLE[0]);
    expect(result.ballIndex).toBe(0);
  });

  test('ball emoji cycles every five tiers after rockstar', () => {
    for (let count = 2; count <= 7; count++) {
      const result = getSuccessCelebration({
        celebrationCount: count,
        lastCheckInWasPaidRestart: false,
        celebrationPaidStart: false,
      });
      expect(result.kind).toBe('balls');
      expect(result.ballIndex).toBe((count - 2) % 5);
      expect(result.ballEmoji).toBe(BALL_EMOJI_CYCLE[(count - 2) % 5]);
    }
  });

  test('paid run: paid → rockstar → balls', () => {
    expect(
      getSuccessCelebration({
        celebrationCount: 1,
        lastCheckInWasPaidRestart: true,
        celebrationPaidStart: true,
      }).kind,
    ).toBe('paid');

    expect(
      getSuccessCelebration({
        celebrationCount: 2,
        lastCheckInWasPaidRestart: false,
        celebrationPaidStart: true,
      }).kind,
    ).toBe('rockstar');

    expect(
      getSuccessCelebration({
        celebrationCount: 3,
        lastCheckInWasPaidRestart: false,
        celebrationPaidStart: true,
      }).kind,
    ).toBe('balls');
  });
});
