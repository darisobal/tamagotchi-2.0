import React from 'react';
import Animated from 'react-native-reanimated';
import { G, Path } from 'react-native-svg';
import { Mood } from './types';

/**
 * Single source of truth for the line-art pet's vector paths.
 *
 * The figure is drawn in a 164×360 viewBox (taken from `assets/pet/happy.svg`,
 * the user-supplied reference body). To keep all four moods consistent we
 * always render the same body / arms / legs and only swap the eyes + mouth.
 *
 * Layer order (bottom → top):
 *   1. body outline + torso
 *   2. legs
 *   3. hair tuft / forehead
 *   4. arms (wrapped in an animated group so happy mood can wave)
 *   5. mouth
 *   6. eyes
 */

const STROKE_W = 5;

/** Body, torso, legs, hair tuft — never change with mood. */
const BODY_PATHS: string[] = [
  // Body / belly outline
  'M2.5 68.009C2.5 82.1361 5.62971 116.506 14.0853 127.22C21.0062 135.989 35.3727 139.451 61.5273 144.509C82.5854 148.581 97.2581 145.95 101.44 144.721C112.28 141.535 126.148 120.712 133.775 105.943C144.451 85.2726 135.786 59.6431 130.234 51.9537C123.031 41.9766 98.7737 35.3733 72.4471 31.213C55.8423 28.5891 43.5028 32.0439 38.9956 34.3324C28.6835 39.5681 19.2455 55.3274 14.1581 65.5672C12.5024 69.591 9.83125 78.522 7.01872 91.7231C5.99361 98.0712 5.78497 103.707 5.57 109.514',
  // Torso → leg curve (right side)
  'M50.7207 144.33C50.7207 144.402 50.7207 144.474 50.7474 167.153C50.774 189.832 50.8273 235.115 51.3985 259.419C51.9696 283.723 53.0569 285.675 54.3774 287.197C60.3821 294.121 74.0958 292.477 84.536 289.677C104.296 284.378 111.651 269.951 123.349 249.987C136.911 226.841 132.393 208.516 128.875 194.111C116.496 170.614 112.614 164.979 110.008 160.995C108.755 158.843 107.645 156.425 105.903 153.027',
  // Left leg
  'M70.3564 294.873V356.673',
  // Right leg
  'M108.047 286.098V343.543',
  // Hair-tuft / forehead
  'M63.8534 8.98328C63.7342 12.2214 64.1149 20.8526 67.3656 27.0872C69.746 31.6527 75.3835 33.8422 81.604 35.5611C84.3125 36.3096 87.3595 36.1943 90.5832 36.0278C93.1971 35.8928 95.2573 34.3228 97.2755 31.9675C102.128 26.3038 101.671 20.9718 101.142 12.0128C100.838 6.87235 92.1389 4.6789 84.6416 3.14649C77.4586 1.6783 71.7424 3.06573 69.9712 3.81918C65.8972 5.55223 66.533 18.6519 68.9135 26.3539C71.0277 33.1944 85.2767 32.3109 91.7026 32.4244C92.5374 32.4392 92.6278 31.0523 92.6884 30.2035C92.9292 26.8328 89.0327 23.6371 83.8547 20.1031C81.5568 18.5347 78.5145 18.3251 75.6577 18.4176C74.453 18.4566 73.7855 18.9604 73.375 19.532C72.9645 20.1036 72.8414 20.8506 72.8734 21.7769C72.9054 22.7031 73.0962 23.786 74.4238 24.9382C80.6515 30.3432 90.6205 29.3293 96.3868 28.4652C97.2478 28.3362 97.3976 26.7898 97.3563 25.8841C97.1523 21.4051 87.6931 19.0064 82.1284 17.7726C80.8334 17.4855 79.507 17.5917 78.8567 18.1579C78.2063 18.7241 78.2483 19.89 78.9406 20.7592C82.0089 24.6112 86.3248 23.2565 87.9594 22.9567C88.7768 22.8067 89.3716 21.9881 89.691 21.2221C90.0104 20.4561 89.9855 19.5956 89.376 18.8398C86.5615 15.35 81.0196 16.4954 77.1116 17.2485C74.4758 17.7565 75.9312 21.8154 75.8452 22.82C74.3453 22.9268 72.4113 22.7726 71.4519 23.136C71.2872 23.4718 71.7767 24.1148 73.0991 24.7831',
];

const ARM_PATHS: string[] = [
  // Left raised arm
  'M14.611 153.144C20.3458 157.739 34.0256 168.715 40.9061 174.718C42.7823 176.556 44.834 178.744 46.5215 180.813C48.209 182.882 49.4702 184.764 50.7695 186.704',
  // Right raised arm
  'M161.094 155.445C160.825 155.445 158.54 155.445 153.817 156.191C151.241 156.938 148.302 158.431 143.352 162.122C138.402 165.813 131.53 171.658 121.064 180.63',
];

/** Mouth path varies by mood. */
const MOUTH_BY_MOOD: Record<Mood, string> = {
  // Original happy.svg curve (smile)
  happy:
    'M45.0098 106.177C47.4597 106.645 61.0742 111.421 74.521 114.08C86.9571 114.221 97.3893 112.867 102.548 109.594C105.15 107.674 107.718 105.231 111.636 101.645',
  // Flat line
  okay: 'M48 110 L108 110',
  // Frown (curve flipped)
  sad: 'M48 116 Q 78 102 108 116',
  // Frown for dead
  dead: 'M48 116 Q 78 102 108 116',
};

/** Tiny squiggle dots used for alive moods. */
const EYE_DOTS: string[] = [
  'M46.3675 60.1499C46.3065 60.1499 46.2445 61.7346 46.3852 63.8099C46.9305 63.6488 47.3158 61.3842 47.1627 59.3112C47.0095 58.8315 46.7033 59.5136 46.3878 62.2026',
  'M91.6536 58.0973C91.6536 58.2098 91.4705 57.3338 91.0808 55.5666C90.8744 54.7333 90.6501 54.0292 90.4889 54.0773C90.3276 54.1253 90.236 54.9467 90.1416 57.9816',
];

/** "X" eyes used only when mood === 'dead'. */
const EYE_X: string[] = [
  'M40 55 L52 67',
  'M52 55 L40 67',
  'M85 53 L97 65',
  'M97 53 L85 65',
];

const AnimatedG = Animated.createAnimatedComponent(G);

type AnimatedPropsLike = Parameters<typeof AnimatedG>[0]['animatedProps'];

type Props = {
  mood: Mood;
  strokeColor: string;
  /** Optional reanimated props applied to the arms group (e.g. wave rotation). */
  armsAnimatedProps?: AnimatedPropsLike;
};

/** Renders the pet inside any caller-provided SVG with the same viewBox. */
export default function PetFigure({ mood, strokeColor, armsAnimatedProps }: Props) {
  const eyes = mood === 'dead' ? EYE_X : EYE_DOTS;
  const mouth = MOUTH_BY_MOOD[mood];

  return (
    <>
      {BODY_PATHS.map((d, i) => (
        <Path
          key={`body-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
      ))}

      <AnimatedG animatedProps={armsAnimatedProps}>
        {ARM_PATHS.map((d, i) => (
          <Path
            key={`arm-${i}`}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
          />
        ))}
      </AnimatedG>

      <Path
        d={mouth}
        fill="none"
        stroke={strokeColor}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
      />

      {eyes.map((d, i) => (
        <Path
          key={`eye-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

/** ViewBox dimensions for a caller-provided <Svg>. */
export const PET_SVG_VB = { w: 164, h: 360 } as const;

/** Aspect ratio (width / height) — handy for scaling logic. */
export const PET_SVG_W_PER_H = PET_SVG_VB.w / PET_SVG_VB.h;
