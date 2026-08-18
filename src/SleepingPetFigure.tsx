import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PetHat as PetHatId } from './types';
import PetHat from './PetHat';
import { SLEEPING_PET_PATH } from '../assets/pet/sleeping-paths';

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

const Z_PATH = 'M0 0 L9 0 L0 6 L10 6';
const Z_GLYPH_VB = { w: 10, h: 6 } as const;

/** Scene-space spawn + drift. Spawn ≈ 200px left, 8px top @ 300px display height. */
const ZZZ_SPAWN = { x: 146, y: -86 } as const;
const ZZZ_RISE = { x: 28, y: -22 } as const;
const ZZZ_SCALES = [0.75, 0.95, 1.15] as const;
const ZZZ_COUNT = ZZZ_SCALES.length;

const ZZZ_CYCLE_MS = 5400;
/** Fraction of each z's slot spent rising (rest = hidden). */
const ZZZ_RISE_FRAC = 0.48;

type Props = {
  color: string;
  hat?: PetHatId;
};

/** Traced sleeping pet + hat (zzz rendered as a View overlay from LineArtPet). */
export default function SleepingPetFigure({ color, hat = 'none' }: Props) {
  return (
    <>
      <Path d={SLEEPING_PET_PATH} fill={color} fillRule="evenodd" />
      <PetHat hat={hat} {...SLEEPING_HAT_PLACEMENT} strokeColor={color} />
    </>
  );
}

/** Map scene viewBox coords → px within the posed layout box. */
export function sceneToLayoutPx(
  x: number,
  y: number,
  layoutW: number,
  layoutH: number,
): { left: number; top: number } {
  return {
    left: ((x - SLEEPING_SCENE_VB.x) / SLEEPING_SCENE_VB.w) * layoutW,
    top: ((y - SLEEPING_SCENE_VB.y) / SLEEPING_SCENE_VB.h) * layoutH,
  };
}

type SleepZzzOverlayProps = {
  color: string;
  layoutW: number;
  layoutH: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * zzz overlay — each glyph is an Animated.View with translateX/Y.
 * Same animation driver as the pet bob (works on web + native).
 */
export function SleepZzzOverlay({ color, layoutW, layoutH }: SleepZzzOverlayProps) {
  const clock = useSharedValue(0);

  useEffect(() => {
    clock.value = 0;
    clock.value = withRepeat(
      withTiming(1, { duration: ZZZ_CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(clock);
  }, [clock]);

  if (layoutW <= 0 || layoutH <= 0) return null;

  const spawn = sceneToLayoutPx(ZZZ_SPAWN.x, ZZZ_SPAWN.y, layoutW, layoutH);
  const end = sceneToLayoutPx(
    ZZZ_SPAWN.x + ZZZ_RISE.x,
    ZZZ_SPAWN.y + ZZZ_RISE.y,
    layoutW,
    layoutH,
  );
  const driftX = end.left - spawn.left;
  const driftY = end.top - spawn.top;
  const baseGlyphH = layoutH * 0.055;

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, { width: layoutW, height: layoutH }]}
    >
      {ZZZ_SCALES.map((scale, index) => (
        <FloatingZ
          key={index}
          color={color}
          index={index}
          scale={scale}
          glyphH={baseGlyphH * scale}
          spawn={spawn}
          driftX={driftX}
          driftY={driftY}
          clock={clock}
        />
      ))}
    </View>
  );
}

function FloatingZ({
  color,
  index,
  scale,
  glyphH,
  spawn,
  driftX,
  driftY,
  clock,
}: {
  color: string;
  index: number;
  scale: number;
  glyphH: number;
  spawn: { left: number; top: number };
  driftX: number;
  driftY: number;
  clock: Animated.SharedValue<number>;
}) {
  const glyphW = (glyphH * Z_GLYPH_VB.w) / Z_GLYPH_VB.h;

  const style = useAnimatedStyle(() => {
    const slot = (clock.value + index / ZZZ_COUNT) % 1;
    const riseT = slot / ZZZ_RISE_FRAC;

    if (riseT >= 1) {
      return {
        opacity: 0,
        transform: [{ translateX: spawn.left }, { translateY: spawn.top }],
      };
    }

    const t = 1 - (1 - riseT) * (1 - riseT);
    const opacity = Math.max(0.35, 1 - t * 0.75);

    return {
      opacity,
      transform: [
        { translateX: spawn.left + t * driftX },
        { translateY: spawn.top + t * driftY },
      ],
    };
  });

  return (
    <AnimatedView style={[styles.glyph, { width: glyphW, height: glyphH }, style]}>
      <Svg width={glyphW} height={glyphH} viewBox={`0 0 ${Z_GLYPH_VB.w} ${Z_GLYPH_VB.h}`}>
        <Path
          d={Z_PATH}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
  },
  glyph: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
