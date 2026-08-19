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
import { HAPPY_PET_ARM_PIVOT, HAPPY_PET_HAT, HAPPY_PET_SCENE_PAD_TOP, HAPPY_PET_SCENE_VB } from '../assets/pet/happy-paths';
import PetFigure, { PET_SVG_VB } from './PetFigure';
import SleepingPetFigure, { SLEEPING_SCENE_VB } from './SleepingPetFigure';
import PetHat from './PetHat';
import DeadBloodSplatter from './DeadBloodSplatter';
import PetSuccessBalls from './PetSuccessBalls';
import { PET_HOME_DISPLAY_HEIGHT } from './PetEggShell';

const AnimatedView = Animated.createAnimatedComponent(View);

const HAT_PLACEMENT = HAPPY_PET_HAT;

type LineArtPetProps = {
  mood: Mood;
  strokeColor?: string;
  /**
   * On-screen height of the posed figure in px (after dead rotation).
   * Call sites can pass different values for alive vs dead.
   */
  displayHeight?: number;
  hat?: PetHatId;
  /** When set on a happy pet, renders two sports-ball emoji on the lower torso. */
  ballEmoji?: string | null;
};

/**
 * Animated wrapper around `PetFigure`. Dead mood: figure is rotated −90° so it lies
 * horizontally (head left), with a blood splatter on the torso; hat rotates with the body.
 *
 * Sizing uses `displayHeight` (posed bounding-box height), not upright body height —
 * so a dead pet is scaled from its lying bounding box to that height.
 */
export default function LineArtPet({
  mood,
  strokeColor = Colors.pet,
  displayHeight = PET_HOME_DISPLAY_HEIGHT,
  hat = 'none',
  ballEmoji = null,
}: LineArtPetProps) {
  const isDead = mood === 'dead';
  const isSleeping = mood === 'sleeping';

  /**
   * Art is always laid out upright in local space, then the wrapper rotates when dead.
   * Sleeping uses a wide side-view figure; upright moods use the tall standing figure.
   */
  const artW = isSleeping
    ? (displayHeight * SLEEPING_SCENE_VB.w) / SLEEPING_SCENE_VB.h
    : isDead
      ? displayHeight
      : (displayHeight * HAPPY_PET_SCENE_VB.w) / HAPPY_PET_SCENE_VB.h;
  const artH = isSleeping
    ? displayHeight
    : isDead
      ? (displayHeight * PET_SVG_VB.h) / PET_SVG_VB.w
      : displayHeight;

  /** Posed layout box (accounts for −90° rotation when dead). */
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
    } else if (mood === 'sleeping') {
      bob.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 3200, easing: slow }),
          withTiming(0, { duration: 3200, easing: slow }),
        ),
        -1,
        false,
      );
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.018, { duration: 3400, easing: slow }),
          withTiming(1, { duration: 3400, easing: slow }),
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
    transform: `rotate(${armWave.value} ${HAPPY_PET_ARM_PIVOT.x} ${HAPPY_PET_ARM_PIVOT.y})`,
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
          viewBox={
            isSleeping
              ? `${SLEEPING_SCENE_VB.x} ${SLEEPING_SCENE_VB.y} ${SLEEPING_SCENE_VB.w} ${SLEEPING_SCENE_VB.h}`
              : `${HAPPY_PET_SCENE_VB.x} ${HAPPY_PET_SCENE_VB.y} ${HAPPY_PET_SCENE_VB.w} ${HAPPY_PET_SCENE_VB.h}`
          }
          overflow="visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {isSleeping ? (
            <SleepingPetFigure color={strokeColor} hat={hat} />
          ) : (
            <G transform={`translate(0, ${HAPPY_PET_SCENE_PAD_TOP})`}>
              <PetFigure
                mood={mood}
                strokeColor={strokeColor}
                armsAnimatedProps={armsAnimatedProps}
              />
              {isDead ? <DeadBloodSplatter /> : null}
              <PetHat hat={hat} {...HAT_PLACEMENT} strokeColor={strokeColor} />
            </G>
          )}
        </Svg>
      </View>
      {mood === 'happy' && ballEmoji ? (
        <PetSuccessBalls
          emoji={ballEmoji}
          layoutWidth={layoutW}
          layoutHeight={layoutH}
          variant="lineArt"
        />
      ) : null}
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
