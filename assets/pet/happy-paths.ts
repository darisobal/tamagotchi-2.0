/**
 * Standing happy pet — paths from Figma `Group 523` / `assets/pet/happy.svg`.
 * Do not hand-edit; update the SVG export and mirror paths here.
 */

import { Mood } from '../../src/types';

/** Original Figma art bounds. */
export const HAPPY_PET_VB = { w: 164, h: 332 } as const;

/** Expanded scene — headroom above the head so hats are not clipped. */
export const HAPPY_PET_SCENE_PAD_TOP = 32;

export const HAPPY_PET_SCENE_VB = {
  x: 0,
  y: 0,
  w: HAPPY_PET_VB.w,
  h: HAPPY_PET_VB.h + HAPPY_PET_SCENE_PAD_TOP,
} as const;

export const HAPPY_PET_STROKE_WIDTH = 5;

/** Head outline, torso, legs — same for every mood. */
export const HAPPY_PET_BODY_PATHS = [
  'M2.5 40.2374C2.5 54.3646 5.62971 88.7342 14.0853 99.448C21.0062 108.217 35.3727 111.679 61.5273 116.737C82.5854 120.81 97.2581 118.179 101.44 116.949C112.28 113.763 126.148 92.9402 133.775 78.1715C144.451 57.501 135.786 31.8716 130.234 24.1821C123.031 14.2051 98.7737 7.60174 72.4471 3.44147C55.8423 0.817496 43.5028 4.27237 38.9956 6.56085C28.6835 11.7966 19.2455 27.5559 14.1581 37.7957C12.5024 41.8195 9.83125 50.7504 7.01872 63.9515C5.99361 70.2997 5.78497 75.9355 5.57 81.7421',
  'M50.7207 116.559C50.7207 116.631 50.7207 116.703 50.7474 139.381C50.774 162.06 50.8273 207.343 51.3985 231.647C51.9696 255.951 53.0569 257.903 54.3774 259.426C60.3821 266.349 74.0958 264.705 84.536 261.906C104.296 256.607 111.651 242.179 123.349 222.215C136.911 199.069 132.393 180.744 128.875 166.34C116.496 142.842 112.614 137.208 110.008 133.224C108.755 131.071 107.645 128.653 105.903 125.256',
  'M70.3564 267.101V328.901',
  'M108.047 258.327V315.771',
] as const;

/** Raised arms — animated on happy mood. */
export const HAPPY_PET_ARM_PATHS = [
  'M14.611 125.373C20.3458 129.967 34.0256 140.944 40.9061 146.946C42.7823 148.784 44.834 150.973 46.5215 153.041C48.209 155.11 49.4702 156.992 50.7695 158.932',
  'M161.094 127.673C160.825 127.673 158.54 127.673 153.817 128.42C151.241 129.166 148.302 130.659 143.352 134.351C138.402 138.042 131.53 143.886 121.064 152.858',
] as const;

/** Squiggle dot eyes from the SVG (Vector 42 & 43). */
export const HAPPY_PET_EYE_PATHS = [
  'M46.3675 32.3784C46.3065 32.3784 46.2445 33.9631 46.3852 36.0383C46.9305 35.8773 47.3158 33.6126 47.1627 31.5396C47.0095 31.0599 46.7033 31.7421 46.3878 34.4311',
  'M91.6536 30.3257C91.6536 30.4383 91.4705 29.5622 91.0808 27.795C90.8744 26.9618 90.6501 26.2577 90.4889 26.3057C90.3276 26.3537 90.236 27.1752 90.1416 30.2101',
] as const;

/** Happy smile from the SVG (Vector 41). */
export const HAPPY_PET_MOUTH_HAPPY =
  'M45.0098 78.4051C47.4597 78.8734 61.0742 83.6494 74.521 86.308C86.9571 86.4489 97.3893 85.0951 102.548 81.822C105.15 79.9028 107.718 77.4593 111.636 73.8739';

/** Alternate mouths aligned to the happy mouth band. */
export const HAPPY_PET_MOUTH_BY_MOOD: Record<Mood, string> = {
  happy: HAPPY_PET_MOUTH_HAPPY,
  okay: 'M48 82 L108 82',
  sad: 'M48 88 Q 78 74 108 88',
  dead: 'M48 88 Q 78 74 108 88',
  sleeping: HAPPY_PET_MOUTH_HAPPY,
};

/** X eyes for dead mood — centered on the SVG eye paths. */
export const HAPPY_PET_EYE_X = [
  'M40 27 L 52 39',
  'M52 27 L 40 39',
  'M85 25 L 97 37',
  'M97 25 L 85 37',
] as const;

/** Hat brim sits on the round head top (~y 3 in the SVG paths). */
export const HAPPY_PET_HAT = {
  cx: 70,
  baseY: 8,
  width: 66,
  height: 26,
} as const;

/** Shoulder pivot for the happy arm wave. */
export const HAPPY_PET_ARM_PIVOT = { x: 82, y: 125 } as const;

/** Torso centroid for dead blood splatter (viewBox coords). */
export const HAPPY_PET_TORSO_ORIGIN = { x: 77, y: 140 } as const;
