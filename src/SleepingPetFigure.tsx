import React, { useEffect } from 'react';
import { G, Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PetHat as PetHatId } from './types';
import PetHat from './PetHat';
import { SLEEPING_PET_PATH } from '../assets/pet/sleeping-paths';

/** Original traced art bounds (path coordinates). */
export const SLEEPING_PET_VB = { w: 225, h: 128 } as const;

/**
 * Expanded scene box — extra headroom above for hats and space up-right for zzz.
 * Used as the SVG viewBox so nothing clips at the edges.
 */
export const SLEEPING_SCENE_VB = {
  x: -10,
  y: -32,
  w: 252,
  h: 172,
} as const;

/** Hat anchor for the side-view sleeping head. */
export const SLEEPING_HAT_PLACEMENT = {
  cx: 50,
  baseY: 10,
  width: 54,
  height: 26,
} as const;

const AnimatedG = Animated.createAnimatedComponent(G);

const ZZZ_STROKE_W = 2.5;

/** Single hand-drawn z stroke (local 0,0 origin). */
const Z_PATH = 'M0 0 L9 0 L0 6 L10 6';

/** Base positions on the right side of the head — drift goes up and right. */
const ZZZ_SPECS = [
  { ox: 72, oy: 24, phase: 0 },
  { ox: 88, oy: 16, phase: 0.33 },
  { ox: 104, oy: 8, phase: 0.66 },
] as const;

const DRIFT_X = 16;
const DRIFT_Y = -14;
const CYCLE_MS = 2200;

type Props = {
  color: string;
  hat?: PetHatId;
};

/** Traced sleeping pet + hat + animated zzz (up-right, right of head). */
export default function SleepingPetFigure({ color, hat = 'none' }: Props) {
  return (
    <>
      <Path d={SLEEPING_PET_PATH} fill={color} fillRule="evenodd" />
      <PetHat hat={hat} {...SLEEPING_HAT_PLACEMENT} strokeColor={color} />
      {ZZZ_SPECS.map((spec, i) => (
        <FloatingZ key={i} color={color} spec={spec} />
      ))}
    </>
  );
}

function FloatingZ({
  color,
  spec,
}: {
  color: string;
  spec: (typeof ZZZ_SPECS)[number];
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = 0;
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: CYCLE_MS, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(drift);
  }, [drift]);

  const animatedProps = useAnimatedProps(() => {
    const t = (drift.value + spec.phase) % 1;
    const tx = spec.ox + t * DRIFT_X;
    const ty = spec.oy + t * DRIFT_Y;
    return {
      opacity: 1,
      transform: `translate(${tx} ${ty})`,
    };
  });

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path
        d={Z_PATH}
        fill="none"
        stroke={color}
        strokeWidth={ZZZ_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AnimatedG>
  );
}
