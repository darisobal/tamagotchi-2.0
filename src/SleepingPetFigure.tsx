import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { G, Path } from 'react-native-svg';
import { PetHat as PetHatId } from './types';
import PetHat from './PetHat';
import { SLEEPING_PET_PATH } from '../assets/pet/sleeping-paths';
import { SLEEP_Z_GLYPHS, type SleepZGlyph } from '../assets/pet/sleep-z-paths';

/** Original traced art bounds (path coordinates). */
export const SLEEPING_PET_VB = { w: 225, h: 128 } as const;

/** Expanded scene box — headroom above for hats and zzz. */
export const SLEEPING_SCENE_VB = {
  x: -10,
  y: -92,
  w: 268,
  h: 234,
} as const;

/** Hat anchor for the side-view sleeping head. */
export const SLEEPING_HAT_PLACEMENT = {
  cx: 50,
  baseY: 10,
  width: 54,
  height: 26,
} as const;

/** Gentle drift along the zzz diagonal (scene units). */
const Z_WAVE_AMP = 1.8;
const Z_WAVE_MS = 4200;

const AnimatedG = Animated.createAnimatedComponent(G);

type Props = {
  color: string;
  hat?: PetHatId;
};

/** Traced sleeping pet, hat, and in-scene zzz animation. */
export default function SleepingPetFigure({ color, hat = 'none' }: Props) {
  return (
    <>
      <Path d={SLEEPING_PET_PATH} fill={color} fillRule="evenodd" />
      <PetHat hat={hat} {...SLEEPING_HAT_PLACEMENT} strokeColor={color} />
      <SleepZzz color={color} />
    </>
  );
}

function SleepZzz({ color }: { color: string }) {
  const wave = useSharedValue(0);

  useEffect(() => {
    wave.value = 0;
    wave.value = withRepeat(
      withTiming(Math.PI * 2, { duration: Z_WAVE_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(wave);
  }, [wave]);

  return (
    <>
      {SLEEP_Z_GLYPHS.map((glyph, index) => (
        <SleepZSymbol key={index} color={color} glyph={glyph} index={index} wave={wave} />
      ))}
    </>
  );
}

type SleepZSymbolProps = {
  color: string;
  glyph: SleepZGlyph;
  index: number;
  wave: SharedValue<number>;
};

/**
 * Always-visible z glyphs from the user artwork. Each one drifts a little along
 * the stack diagonal with a phase offset so they softly pass through one another.
 */
function SleepZSymbol({ color, glyph, index, wave }: SleepZSymbolProps) {
  const animatedProps = useAnimatedProps(() => {
    const angle = wave.value + index * ((Math.PI * 2) / SLEEP_Z_GLYPHS.length);
    const shift = Math.sin(angle) * Z_WAVE_AMP;
    const x = glyph.x + shift * 0.75;
    const y = glyph.y - shift * 0.6;

    return {
      transform: `translate(${x} ${y})`,
    };
  });

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={glyph.path} fill={color} fillRule="evenodd" />
    </AnimatedG>
  );
}
