import {
  checkInEarnsCoupon,
  countEarnedCoupons,
  findCouponForReveal,
  findPendingCoupon,
  formatCouponDayLabel,
  isCouponEligible,
  computeRewardOverlayLayout,
  FIGMA_REWARD_FRAME,
  REWARD_OVERLAY_MIN_GAP,
} from '../coupons';
import { CheckIn, PET_LIVES_MAX } from '../types';

function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: '1',
    trackType: 'main',
    intensity: 'medium',
    note: null,
    timestamp: '2026-08-12T10:00:00.000Z',
    ...overrides,
  };
}

describe('coupons', () => {
  test('checkInEarnsCoupon requires full lives and excludes paid restarts', () => {
    expect(checkInEarnsCoupon(PET_LIVES_MAX, false)).toBe(true);
    expect(checkInEarnsCoupon(2, false)).toBe(false);
    expect(checkInEarnsCoupon(1, false)).toBe(false);
    expect(checkInEarnsCoupon(PET_LIVES_MAX, true)).toBe(false);
  });

  test('eligible check-ins require couponEarned and exclude paid restarts', () => {
    expect(isCouponEligible(makeCheckIn({ couponEarned: true }))).toBe(true);
    expect(isCouponEligible(makeCheckIn({ couponEarned: false }))).toBe(false);
    expect(isCouponEligible(makeCheckIn({ couponEarned: true, isPaidRestart: true }))).toBe(false);
  });

  test('countEarnedCoupons counts only couponEarned check-ins', () => {
    const checkIns = [
      makeCheckIn({ id: '1', couponEarned: true }),
      makeCheckIn({ id: '2', couponEarned: false }),
      makeCheckIn({ id: '3', couponEarned: true, isPaidRestart: true }),
    ];
    expect(countEarnedCoupons(checkIns)).toBe(1);
  });

  test('findPendingCoupon returns newest uncollected earned check-in', () => {
    const checkIns = [
      makeCheckIn({
        id: 'new',
        couponEarned: true,
        couponCollected: false,
        timestamp: '2026-08-13T10:00:00.000Z',
      }),
      makeCheckIn({
        id: 'old',
        couponEarned: true,
        couponCollected: false,
        timestamp: '2026-08-12T10:00:00.000Z',
      }),
      makeCheckIn({ id: 'done', couponEarned: true, couponCollected: true }),
    ];
    expect(findPendingCoupon(checkIns)?.id).toBe('new');
  });

  test('findCouponForReveal only returns the session check-in id', () => {
    const checkIns = [
      makeCheckIn({
        id: 'earned',
        couponEarned: true,
        couponCollected: false,
      }),
    ];
    expect(findCouponForReveal(checkIns, 'earned')?.id).toBe('earned');
    expect(findCouponForReveal(checkIns, null)).toBeNull();
    expect(findCouponForReveal(checkIns, 'missing')).toBeNull();
  });

  test('formatCouponDayLabel adds ordinal with capitalized month', () => {
    expect(formatCouponDayLabel('2026-08-12')).toMatch(/August 12th/);
  });

  test('computeRewardOverlayLayout keeps coupon and cta type at the same scale', () => {
    const layout = computeRewardOverlayLayout(430, 932, 0, 0);
    expect(layout.couponFontSize).toBeCloseTo(42, 0);
    expect(layout.ctaFontSize).toBe(layout.couponFontSize);
  });

  test('computeRewardOverlayLayout uses fixed minimum gaps', () => {
    const layout = computeRewardOverlayLayout(430, 932, 0, 0);
    expect(layout.minGapAfterCoupon).toBe(REWARD_OVERLAY_MIN_GAP);
    expect(layout.minGapAfterCta).toBe(REWARD_OVERLAY_MIN_GAP);
    expect(layout.bottomPad).toBeGreaterThanOrEqual(REWARD_OVERLAY_MIN_GAP);
  });

  test('computeRewardOverlayLayout fits minimum stack on short viewports', () => {
    const layout = computeRewardOverlayLayout(562, 747, 0, 0);
    const contentAfterTopPad =
      FIGMA_REWARD_FRAME.peekHeight +
      FIGMA_REWARD_FRAME.mainHeight +
      FIGMA_REWARD_FRAME.couponLineHeight * 3 +
      FIGMA_REWARD_FRAME.couponLineHeight;
    const minTotal =
      layout.topPad +
      layout.minGapAfterCoupon +
      layout.minGapAfterCta +
      layout.bottomPad +
      layout.scale * contentAfterTopPad;
    expect(minTotal).toBeLessThanOrEqual(747 + 1);
  });

  test('computeRewardOverlayLayout skips scroll on tall viewports', () => {
    const layout = computeRewardOverlayLayout(430, 932, 0, 0);
    expect(layout.needsScroll).toBe(false);
  });
});
