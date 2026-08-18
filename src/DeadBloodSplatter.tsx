import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import { Circle, G, Line, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);

/** ~ centroid of splatter blobs (viewBox coords) for scale origin. */
const ORIGIN = { x: 82, y: 188 };

/** One blood streak in the fountain — angles are in SVG space (+x = up on screen when dead). */
const FOUNTAIN_LINES = [
  { spreadY: -14, launchX: 34, launchY: -6, fallX: -48, fallY: 10, offset: 0, stroke: '#FF1A1A', width: 3 },
  { spreadY: -6, launchX: 28, launchY: -2, fallX: -42, fallY: 6, offset: 0.14, stroke: '#B71C1C', width: 2.5 },
  { spreadY: 4, launchX: 30, launchY: 3, fallX: -44, fallY: 14, offset: 0.28, stroke: '#FF5252', width: 2.5 },
  { spreadY: 12, launchX: 26, launchY: 5, fallX: -38, fallY: 18, offset: 0.42, stroke: '#B71C1C', width: 2 },
  { spreadY: -10, launchX: 22, launchY: -8, fallX: -36, fallY: 4, offset: 0.56, stroke: '#8B0000', width: 2 },
  { spreadY: 8, launchX: 24, launchY: 6, fallX: -40, fallY: 16, offset: 0.7, stroke: '#FF1A1A', width: 2.5 },
  { spreadY: -2, launchX: 36, launchY: 0, fallX: -52, fallY: 8, offset: 0.84, stroke: '#B71C1C', width: 3 },
] as const;

const CYCLE_MS = 1400;

type FountainLineProps = (typeof FOUNTAIN_LINES)[number] & {
  phase: SharedValue<number>;
};

function FountainLine({
  phase,
  spreadY,
  launchX,
  launchY,
  fallX,
  fallY,
  offset,
  stroke,
  width,
}: FountainLineProps) {
  const animatedProps = useAnimatedProps(() => {
    const t = ((phase.value / 360 + offset) % 1);
    const { x: ox, y: oy } = ORIGIN;

    // 0 → 0.35: spray upward (+x on screen); 0.35 → 1: arc down with gravity (−x).
    const launch = Math.min(t / 0.35, 1);
    const fall = Math.max(0, (t - 0.35) / 0.65);

    const tipX = ox + launchX * launch + fallX * fall;
    const tipY = oy + spreadY * launch + launchY * launch + fallY * fall;

    const tailLaunch = Math.max(0, launch - 0.45);
    const tailFall = Math.max(0, fall - 0.08);
    const tailX = ox + launchX * tailLaunch * 0.35 + fallX * tailFall * 0.55;
    const tailY =
      oy + spreadY * tailLaunch * 0.35 + launchY * tailLaunch * 0.35 + fallY * tailFall * 0.55;

    const opacity =
      t < 0.08 ? t / 0.08 : t > 0.88 ? (1 - t) / 0.12 : 0.92;

    return {
      x1: tailX,
      y1: tailY,
      x2: tipX,
      y2: tipY,
      opacity,
      strokeOpacity: opacity,
    };
  });

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

/**
 * Messy red splatter on the torso for the lying-down dead pose, with fountain
 * blood lines that spray up then drip down. Coordinates match the 164×360 viewBox.
 */
export default function DeadBloodSplatter() {
  const pulse = useSharedValue(0);
  const fountain = useSharedValue(0);

  useEffect(() => {
    pulse.value = 0;
    pulse.value = withRepeat(
      withTiming(360, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );

    fountain.value = 0;
    fountain.value = withRepeat(
      withTiming(360, { duration: CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(fountain);
    };
  }, [pulse, fountain]);

  const splatterProps = useAnimatedProps(() => {
    const rad = (pulse.value * Math.PI) / 180;
    const opacity = 0.72 + 0.2 * (0.5 + 0.5 * Math.sin(rad));
    const scale = 1 + 0.04 * Math.sin(rad * 1.15 + 0.6);
    const ty = 1.2 * Math.sin(rad * 0.85);
    const { x, y } = ORIGIN;
    const transform = `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y}) translate(0 ${ty})`;
    return { opacity, transform };
  });

  return (
    <>
      <AnimatedG animatedProps={splatterProps}>
        <Circle cx={82} cy={188} r={16} fill="#FF1A1A" />
        <Circle cx={74} cy={182} r={8} fill="#B71C1C" />
        <Circle cx={94} cy={196} r={6} fill="#FF5252" />
        <Path
          d="M58 198 Q68 215 84 208 T104 202"
          fill="none"
          stroke="#B71C1C"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M64 188 L72 202 M78 180 L86 194 M91 190 L98 205"
          fill="none"
          stroke="#8B0000"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d="M101 178 Q108 192 104 208"
          fill="none"
          stroke="#FF1A1A"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </AnimatedG>

      {FOUNTAIN_LINES.map((line, i) => (
        <FountainLine key={i} phase={fountain} {...line} />
      ))}
    </>
  );
}
