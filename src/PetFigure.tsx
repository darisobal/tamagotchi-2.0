import React from 'react';
import Animated from 'react-native-reanimated';
import { G, Path } from 'react-native-svg';
import { Mood } from './types';
import {
  HAPPY_PET_ARM_PATHS,
  HAPPY_PET_BODY_PATHS,
  HAPPY_PET_EYE_PATHS,
  HAPPY_PET_EYE_X,
  HAPPY_PET_MOUTH_BY_MOOD,
  HAPPY_PET_STROKE_WIDTH,
  HAPPY_PET_VB,
} from '../assets/pet/happy-paths';

/**
 * Renders the standing line-art pet from `assets/pet/happy.svg`.
 * Body, arms, and legs stay fixed; only eyes and mouth swap per mood.
 */

const AnimatedG = Animated.createAnimatedComponent(G);

type AnimatedPropsLike = Parameters<typeof AnimatedG>[0]['animatedProps'];

type Props = {
  mood: Mood;
  strokeColor: string;
  /** Optional reanimated props applied to the arms group (e.g. wave rotation). */
  armsAnimatedProps?: AnimatedPropsLike;
};

export default function PetFigure({ mood, strokeColor, armsAnimatedProps }: Props) {
  const mouth = HAPPY_PET_MOUTH_BY_MOOD[mood];
  const eyes = mood === 'dead' ? HAPPY_PET_EYE_X : HAPPY_PET_EYE_PATHS;

  return (
    <>
      {HAPPY_PET_BODY_PATHS.map((d, i) => (
        <Path
          key={`body-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={HAPPY_PET_STROKE_WIDTH}
          strokeLinecap="round"
        />
      ))}

      <AnimatedG animatedProps={armsAnimatedProps}>
        {HAPPY_PET_ARM_PATHS.map((d, i) => (
          <Path
            key={`arm-${i}`}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={HAPPY_PET_STROKE_WIDTH}
            strokeLinecap="round"
          />
        ))}
      </AnimatedG>

      <Path
        d={mouth}
        fill="none"
        stroke={strokeColor}
        strokeWidth={HAPPY_PET_STROKE_WIDTH}
        strokeLinecap="round"
      />

      {eyes.map((d, i) => (
        <Path
          key={`eye-${i}`}
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={HAPPY_PET_STROKE_WIDTH}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

/** ViewBox dimensions for a caller-provided <Svg>. */
export const PET_SVG_VB = HAPPY_PET_VB;

/** Aspect ratio (width / height) — handy for scaling logic. */
export const PET_SVG_W_PER_H = PET_SVG_VB.w / PET_SVG_VB.h;
