import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G } from 'react-native-svg';
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

const AnimatedView = Animated.createAnimatedComponent(View);

/** Where to drop the hat for the upright body (sits just above the hair tuft). */
const HAT_PLACEMENT = {
  cx: 70,
  baseY: 28,
  width: 66,
  height: 26,
} as const;

const VB_CX = PET_SVG_VB.w / 2;
const VB_CY = PET_SVG_VB.h / 2;

type LineArtPetProps = {
  mood: Mood;
  strokeColor?: string;
  /** Visual height of the figure in px (upright: full body height; same scale when lying). */
  size?: number;
  hat?: PetHatId;
};

/**
 * Animated wrapper around `PetFigure`. Dead mood: figure is rotated −90° so it lies
 * horizontally (head left), with a blood splatter on the torso; hat rotates with the body.
 */
export default function LineArtPet({
  mood,
  strokeColor = Colors.pet,
  size = 160,
  hat = 'none',
}: LineArtPetProps) {
  const isDead = mood === 'dead';

  /** Upright: narrow×tall. Dead (after rotation): wide×short — same viewBox scale (size = 360 px tall). */
  const uprightW = (size * PET_SVG_VB.w) / PET_SVG_VB.h;
  const uprightH = size;
  const svgW = isDead ? uprightH : uprightW;
  const svgH = isDead ? uprightW : uprightH;

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

  const deadTransform = `translate(${VB_CX} ${VB_CY}) rotate(-90) translate(${-VB_CX} ${-VB_CY})`;

  return (
    <AnimatedView style={[styles.wrap, { width: svgW, height: svgH }, wrapStyle]}>
      <Svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${PET_SVG_VB.w} ${PET_SVG_VB.h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {isDead ? (
          <G transform={deadTransform}>
            <PetFigure
              mood={mood}
              strokeColor={strokeColor}
              armsAnimatedProps={armsAnimatedProps}
            />
            <DeadBloodSplatter />
            <PetHat hat={hat} {...HAT_PLACEMENT} strokeColor={strokeColor} />
          </G>
        ) : (
          <>
            <PetFigure
              mood={mood}
              strokeColor={strokeColor}
              armsAnimatedProps={armsAnimatedProps}
            />
            <PetHat hat={hat} {...HAT_PLACEMENT} strokeColor={strokeColor} />
          </>
        )}
      </Svg>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
