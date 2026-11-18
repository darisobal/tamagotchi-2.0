import { CheckIn, PET_LIVES_MAX } from './types';

/** Figma coupon copy — capitals preserved per design. */
export const POWER_COUPON_HEADLINE = "YOU're\nthe STRONGEST ever!";
export const POWER_COUPON_SUBLINE = 'Best human! Beeeeeest Gangsta!!!!!!';
export const POWER_COUPON_BLUR_PREVIEW =
  "YOU're\nthe STRONGEST ever! Best human! Beeeeeest Gangsta";

/** Confetti dot palette from Figma coupon frames. */
export const COUPON_CONFETTI_COLORS = [
  '#000000',
  '#FF6F61',
  '#FF8FB1',
  '#1F1AE6',
  '#A66CFF',
  '#FFD93D',
] as const;

/** Confetti positions on the main coupon body (Figma frame 8, origin = main ticket top-left). */
export type CouponConfettiDot = {
  x: number;
  y: number;
  size: number;
  color: string;
};

export const REWARD_MAIN_CONFETTI: CouponConfettiDot[] = [
  { x: 248, y: 64, size: 19, color: '#000000' },
  { x: 18, y: 26, size: 19, color: '#000000' },
  { x: 323, y: 286, size: 19, color: '#FF6F61' },
  { x: 78, y: 4, size: 19, color: '#FF6F61' },
  { x: 228, y: 277, size: 19, color: '#FF6F61' },
  { x: 342, y: 100, size: 19, color: '#FF6F61' },
  { x: 143, y: 115, size: 34, color: '#1F1AE6' },
  { x: 330, y: 38, size: 19, color: '#A66CFF' },
  { x: 196, y: 16, size: 19, color: '#FF8FB1' },
  { x: 294, y: 372, size: 29, color: '#1F1AE6' },
  { x: 11, y: 190, size: 26, color: '#A66CFF' },
  { x: 97, y: 391, size: 19, color: '#FFD93D' },
  { x: 238, y: 132, size: 19, color: '#FF6F61' },
];

/** List-view confetti (percent of card). */
export const COUPON_CONFETTI_DOTS: CouponConfettiDot[] = [
  { x: 0.05, y: 0.06, size: 19, color: '#000000' },
  { x: 0.21, y: 0.01, size: 19, color: '#FF6F61' },
  { x: 0.60, y: 0.04, size: 19, color: '#000000' },
  { x: 0.67, y: 0.15, size: 19, color: '#FF8FB1' },
  { x: 0.99, y: 0.24, size: 19, color: '#FF6F61' },
  { x: 0.46, y: 0.27, size: 34, color: '#1F1AE6' },
  { x: 0.71, y: 0.30, size: 19, color: '#FF6F61' },
  { x: 0.10, y: 0.73, size: 26, color: '#A66CFF' },
  { x: 0.68, y: 0.65, size: 19, color: '#FF6F61' },
  { x: 0.94, y: 0.96, size: 19, color: '#FF8FB1' },
  { x: 0.33, y: 0.92, size: 19, color: '#FFD93D' },
  { x: 0.86, y: 0.88, size: 29, color: '#1F1AE6' },
];

/** Alternating tilt angles for the coupons home list. */
export const COUPON_LIST_ROTATIONS = [15, -15, 7, -7, 12, -12] as const;

export function couponRotationForIndex(index: number): number {
  return COUPON_LIST_ROTATIONS[index % COUPON_LIST_ROTATIONS.length];
}

/** True when a check-in at this moment qualifies for a power coupon. */
export function checkInEarnsCoupon(livesBeforeCheckIn: number, isPaidRestart: boolean): boolean {
  return !isPaidRestart && livesBeforeCheckIn === PET_LIVES_MAX;
}

export function isCouponEligible(checkIn: CheckIn): boolean {
  return Boolean(checkIn.couponEarned) && !checkIn.isPaidRestart;
}

export function countEarnedCoupons(checkIns: CheckIn[]): number {
  return checkIns.filter(isCouponEligible).length;
}

export function findPendingCoupon(checkIns: CheckIn[]): CheckIn | null {
  for (const checkIn of checkIns) {
    if (isCouponEligible(checkIn) && checkIn.couponCollected === false) {
      return checkIn;
    }
  }
  return null;
}

/** Overlay shows only for a coupon just earned this session — not on app reopen. */
export function findCouponForReveal(
  checkIns: CheckIn[],
  revealCheckInId: string | null,
): CheckIn | null {
  if (!revealCheckInId) return null;
  const checkIn = checkIns.find((row) => row.id === revealCheckInId);
  if (!checkIn || !isCouponEligible(checkIn) || checkIn.couponCollected !== false) {
    return null;
  }
  return checkIn;
}

/** Ordinal day label for coupons list — e.g. "August 12th". */
export function formatCouponDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const month = d.toLocaleDateString(undefined, { month: 'long' });
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  return `${month} ${day}${suffix}`;
}

/** Figma iPhone 14 Pro Max frame used for reward overlay spacing. */
export const FIGMA_REWARD_FRAME = {
  screenWidth: 430,
  screenHeight: 932,
  horizontalPad: 28,
  couponWidth: 374,
  peekHeight: 120,
  mainHeight: 424,
  couponTop: 122,
  bodyTextTop: 55,
  bodyTextLeft: 28,
  blurTextTop: -258,
  blurTextLeft: 30,
  /** Blur text offset relative to peek container top. */
  blurTextTopInPeek: -260,
  ctaTop: 672,
  earnedTop: 824,
  couponFontSize: 42,
  couponLineHeight: 48,
  ctaFontSize: 42,
  earnedFontSize: 22,
} as const;

export function scaleFigma(value: number, screenWidth: number): number {
  return value * (screenWidth / FIGMA_REWARD_FRAME.screenWidth);
}

/** Minimum spacing between ticket, CTA, and earned counter (px). */
export const REWARD_OVERLAY_MIN_GAP = 20;

export type RewardOverlayLayout = {
  /** Single scale applied to coupon, type, and spacing. */
  scale: number;
  horizontalPad: number;
  topPad: number;
  bottomPad: number;
  couponWidth: number;
  couponHeight: number;
  notchRadius: number;
  minGapAfterCoupon: number;
  minGapAfterCta: number;
  couponFontSize: number;
  couponLineHeight: number;
  ctaFontSize: number;
  earnedFontSize: number;
  /** Width of the copy block — matches coupon card for left alignment. */
  copyWidth: number;
  /** When true, content exceeds the viewport even at minimum scale — allow scroll. */
  needsScroll: boolean;
};

const ABSOLUTE_MIN_REWARD_SCALE = 0.55;

/** CTA can wrap to three lines on narrower copy widths — budget conservatively. */
const REWARD_CTA_MIN_LINES = 3;

function rewardOverlayMinHeightAtScale(
  scale: number,
  insetTop: number,
  insetBottom: number,
): number {
  const topInset = Math.max(insetTop, 0);
  const bottomPad = Math.max(insetBottom, REWARD_OVERLAY_MIN_GAP);
  const stackTopFigma = FIGMA_REWARD_FRAME.couponTop - FIGMA_REWARD_FRAME.peekHeight;
  const scaledFigmaHeight =
    stackTopFigma +
    FIGMA_REWARD_FRAME.peekHeight +
    FIGMA_REWARD_FRAME.mainHeight +
    FIGMA_REWARD_FRAME.couponLineHeight * REWARD_CTA_MIN_LINES +
    FIGMA_REWARD_FRAME.couponLineHeight;

  return (
    topInset +
    scaledFigmaHeight * scale +
    REWARD_OVERLAY_MIN_GAP * 2 +
    bottomPad
  );
}

/** One proportional layout for the reward overlay — coupon + copy scale together. */
export function computeRewardOverlayLayout(
  screenWidth: number,
  screenHeight: number,
  insetTop: number,
  insetBottom: number,
): RewardOverlayLayout {
  const widthScale = screenWidth / FIGMA_REWARD_FRAME.screenWidth;
  const bottomPad = Math.max(insetBottom, REWARD_OVERLAY_MIN_GAP);
  const topInset = Math.max(insetTop, 0);

  const stackTopFigma = FIGMA_REWARD_FRAME.couponTop - FIGMA_REWARD_FRAME.peekHeight;
  const scaledFigmaHeight =
    stackTopFigma +
    FIGMA_REWARD_FRAME.peekHeight +
    FIGMA_REWARD_FRAME.mainHeight +
    FIGMA_REWARD_FRAME.couponLineHeight * REWARD_CTA_MIN_LINES +
    FIGMA_REWARD_FRAME.couponLineHeight;

  let scale = Math.max(ABSOLUTE_MIN_REWARD_SCALE, widthScale);

  const minHeightAtScale = (s: number) =>
    rewardOverlayMinHeightAtScale(s, insetTop, insetBottom);

  if (minHeightAtScale(scale) > screenHeight) {
    const fixedParts = topInset + REWARD_OVERLAY_MIN_GAP * 2 + bottomPad;
    const availableForScaled = screenHeight - fixedParts;
    scale = Math.max(
      ABSOLUTE_MIN_REWARD_SCALE,
      availableForScaled / scaledFigmaHeight,
    );
  }

  const unit = (value: number) => value * scale;
  const couponWidth = unit(FIGMA_REWARD_FRAME.couponWidth);
  const notchRadius = unit(12);
  const needsScroll = minHeightAtScale(scale) > screenHeight + 1;

  return {
    scale,
    horizontalPad: unit(FIGMA_REWARD_FRAME.horizontalPad),
    topPad: topInset + unit(stackTopFigma),
    bottomPad,
    couponWidth,
    couponHeight: unit(FIGMA_REWARD_FRAME.peekHeight + FIGMA_REWARD_FRAME.mainHeight),
    notchRadius,
    minGapAfterCoupon: REWARD_OVERLAY_MIN_GAP,
    minGapAfterCta: REWARD_OVERLAY_MIN_GAP,
    couponFontSize: unit(FIGMA_REWARD_FRAME.couponFontSize),
    couponLineHeight: unit(FIGMA_REWARD_FRAME.couponLineHeight),
    ctaFontSize: unit(FIGMA_REWARD_FRAME.ctaFontSize),
    earnedFontSize: unit(FIGMA_REWARD_FRAME.earnedFontSize),
    copyWidth: couponWidth + notchRadius * 2,
    needsScroll,
  };
}
