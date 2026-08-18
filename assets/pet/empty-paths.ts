/**
 * Sad doodle head for the progress empty state.
 * Paths from Figma `Group 527` / `assets/pet/empty.svg` (Tamagotchi 2.0).
 */

/** Original Figma art bounds (face paths only). */
export const EMPTY_FACE_VB = { w: 142, h: 122 } as const;

/** Expanded scene — headroom above the face so hats are not clipped. */
export const EMPTY_FACE_SCENE_VB = {
  x: 0,
  y: -36,
  w: EMPTY_FACE_VB.w,
  h: EMPTY_FACE_VB.h + 36,
} as const;

export const EMPTY_FACE_STROKE_WIDTH = 5;

/** Head outline, frown, and dot eyes — same layer order as the SVG source. */
export const EMPTY_FACE_PATHS = [
  'M2.5 40.2374C2.5 54.3646 5.62971 88.7342 14.0853 99.448C21.0062 108.217 35.3727 111.679 61.5273 116.737C82.5854 120.81 97.2581 118.179 101.44 116.949C112.28 113.763 126.148 92.9402 133.775 78.1715C144.451 57.501 135.786 31.8716 130.234 24.1821C123.031 14.2051 98.7737 7.60174 72.4471 3.44147C55.8423 0.817496 43.5028 4.27237 38.9956 6.56085C28.6835 11.7966 19.2455 27.5559 14.1581 37.7957C12.5024 41.8195 9.83125 50.7504 7.01872 63.9515C5.99361 70.2997 5.78497 75.9355 5.57 81.7421',
  'M110.565 88.6438C108.265 87.6787 95.9339 80.1887 83.3283 74.805C71.1905 72.0937 60.704 71.2594 54.9796 73.3942C52.0372 74.7335 49.0184 76.5925 44.4432 79.2895',
  'M62.5677 42.4804C62.5066 42.4804 62.4447 44.0651 62.5854 46.1404C63.1307 45.9793 63.516 43.7147 63.3629 41.6417C63.2097 41.162 62.9035 41.8441 62.5879 44.5331',
  'M95.012 43.5221C95.012 43.6347 94.8289 42.7587 94.4392 40.9914C94.2327 40.1582 94.0085 39.4541 93.8472 39.5021C93.686 39.5501 93.5944 40.3716 93.5 43.4065',
] as const;

/** Hat placement tuned for the empty-state head viewBox. */
export const EMPTY_FACE_HAT = {
  cx: 71,
  baseY: 10,
  width: 57,
  height: 22,
} as const;
