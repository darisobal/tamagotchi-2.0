import React from 'react';
import Animated from 'react-native-reanimated';
import { Circle, G, Path } from 'react-native-svg';
import { Mood } from './types';

/**
 * Single source of truth for the line-art pet's vector paths.
 *
 * The figure is drawn in a 164×360 viewBox (taken from `assets/pet/happy.svg`,
 * the user-supplied reference body). To keep all four moods consistent we
 * always render the same body / arms / legs and only swap the eyes + mouth.
 *
 * Layer order (bottom → top):
 *   1. head + body + legs
 *   2. arms (wrapped in an animated group so happy mood can wave)
 *   3. mouth
 *   4. eyes
 */

const STROKE_W = 5;

/** Head, body, legs — never change with mood. */
const BODY_PATHS: string[] = [
  // Head
  'M82 14 A 58 58 0 1 1 81.99 14',
  // Left torso edge
  'M48 128 L 48 248',
  // Right belly curve
  'M116 128 Q 162 188 102 248',
  // Left leg
  'M66 248 L 66 352',
  // Right leg
  'M98 248 L 98 352',
];

const ARM_PATHS: string[] = [
  // Left raised arm
  'M4 82 L 48 135',
  // Right raised arm
  'M116 135 L 160 82',
];

/** Mouth path varies by mood. */
const MOUTH_BY_MOOD: Record<Mood, string> = {
  happy: 'M52 92 Q 82 110 112 92',
  okay: 'M52 98 L 112 98',
  sad: 'M52 104 Q 82 90 112 104',
  dead: 'M52 104 Q 82 90 112 104',
  sleeping: 'M52 92 Q 82 110 112 92',
};

/** Dot eyes used for alive moods. */
const EYE_DOTS = [
  { cx: 58, cy: 65, r: 4 },
  { cx: 106, cy: 65, r: 4 },
] as const;

/** "X" eyes used only when mood === 'dead'. */
const EYE_X: string[] = [
  'M52 58 L 64 70',
  'M64 58 L 52 70',
  'M100 58 L 112 70',
  'M112 58 L 100 70',
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

      {mood === 'dead'
        ? EYE_X.map((d, i) => (
            <Path
              key={`eye-${i}`}
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
            />
          ))
        : EYE_DOTS.map(({ cx, cy, r }, i) => (
            <Circle key={`eye-${i}`} cx={cx} cy={cy} r={r} fill={strokeColor} />
          ))}
    </>
  );
}

/** ViewBox dimensions for a caller-provided <Svg>. */
export const PET_SVG_VB = { w: 164, h: 360 } as const;

/** Aspect ratio (width / height) — handy for scaling logic. */
export const PET_SVG_W_PER_H = PET_SVG_VB.w / PET_SVG_VB.h;
