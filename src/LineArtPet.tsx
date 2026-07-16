import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Mood, PetHat as PetHatId } from './types';
import { Colors } from './theme';
import PetFigure, { PET_SVG_VB } from './PetFigure';
import PetHat from './PetHat';
import DeadBloodSplatter from './DeadBloodSplatter';
import { PET_HOME_DISPLAY_HEIGHT } from './PetEggShell';

const AnimatedView = Animated.createAnimatedComponent(View);

/** Where to drop the hat for the upright body (sits just above the hair tuft). */
const HAT_PLACEMENT = {
  cx: 70,
  baseY: 28,
  width: 66,
  height: 26,
} as const;

type LineArtPetProps = {
  mood: Mood;
  strokeColor?: string;
  /**
   * On-screen height of the posed figure in px (after dead rotation).
   * Happy and dead share the same vertical presence in the egg.
   */
  displayHeight?: number;
  hat?: PetHatId;
};

/**
 * Animated wrapper around `PetFigure`. Dead mood: figure is rotated −90° so it lies
 * horizontally (head left), with a blood splatter on the torso; hat rotates with the body.
 *
 * Sizing uses `displayHeight` (posed bounding-box height), not upright body height —
 * so the lying pet is scaled up to match the standing pet's on-screen height.
 */
export default function LineArtPet({
  mood,
  strokeColor = Colors.pet,
  displayHeight = PET_HOME_DISPLAY_HEIGHT,
  hat = 'none',
}: LineArtPetProps) {
  const isDead = mood === 'dead';

  /**
   * Art is always laid out upright in local space, then the wrapper rotates when dead.
   * Dead: local width becomes on-screen height → local width = displayHeight.
   * Upright: local height = displayHeight.
   */
  const artW = isDead
    ? displayHeight
    : (displayHeight * PET_SVG_VB.w) / PET_SVG_VB.h;
  const artH = isDead
    ? (displayHeight * PET_SVG_VB.h) / PET_SVG_VB.w
    : displayHeight;

  /** Posed layout box (accounts for −90° rotation). */
  const layoutW = isDead ? artH : artW;
  const layoutH = isDead ? artW : artH;

  const bob = useSharedValue(0);
  const breathe = useSharedValue(1);
  const armWave = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(bob);
    cancelAnimation(breathe);
    cancelAnimation(armWave);

    bob.value = 0;
    breathe.value = 1;
    armWave.value = 0;

    const slow = Easing.inOut(Easing.sin);

    if (mood === 'dead') {
      bob.value = withRepeat(
        withSequence(
          withTiming(-1.2, { duration: 4200, easing: slow }),
          withTiming(1.2, { duration: 4200, easing: slow }),
        ),
        -1,
        false,
      );
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.006, { duration: 5000, easing: slow }),
          withTiming(1, { duration: 5000, easing: slow }),
        ),
        -1,
        false,
      );
    } else {
      bob.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 2400, easing: slow }),
          withTiming(0, { duration: 2400, easing: slow }),
        ),
        -1,
        false,
      );
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.026, { duration: 2600, easing: slow }),
          withTiming(1, { duration: 2600, easing: slow }),
        ),
        -1,
        false,
      );

      if (mood === 'happy') {
        armWave.value = withRepeat(
          withSequence(
            withTiming(8, { duration: 720, easing: Easing.inOut(Easing.sin) }),
            withTiming(-6, { duration: 720, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
      }
    }

    return () => {
      cancelAnimation(bob);
      cancelAnimation(breathe);
      cancelAnimation(armWave);
    };
  }, [mood, bob, breathe, armWave]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { scale: breathe.value }],
  }));

  const armsAnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${armWave.value} 82 145)`,
  }));

  return (
    <AnimatedView style={[styles.wrap, { width: layoutW, height: layoutH }, wrapStyle]}>
      <View
        style={[
          styles.art,
          { width: artW, height: artH },
          isDead ? styles.artDead : null,
        ]}
      >
        <Svg
          width={artW}
          height={artH}
          viewBox={`0 0 ${PET_SVG_VB.w} ${PET_SVG_VB.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <PetFigure
            mood={mood}
            strokeColor={strokeColor}
            armsAnimatedProps={armsAnimatedProps}
          />
          {isDead ? <DeadBloodSplatter /> : null}
          <PetHat hat={hat} {...HAT_PLACEMENT} strokeColor={strokeColor} />
        </Svg>
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artDead: {
    transform: [{ rotate: '-90deg' }],
  },
});
