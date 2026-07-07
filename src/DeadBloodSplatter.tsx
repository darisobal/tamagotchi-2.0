import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Circle, G, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

/** ~ centroid of splatter blobs (viewBox coords) for scale origin. */
const ORIGIN = { x: 77, y: 169 };

/**
 * Messy red splatter on the torso for the lying-down dead pose.
 * Coordinates match the 164×360 pet viewBox (chest / belly region).
 */
export default function DeadBloodSplatter() {
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = 0;
    phase.value = withRepeat(
      withTiming(360, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(phase);
    };
  }, [phase]);

  const animatedProps = useAnimatedProps(() => {
    const rad = (phase.value * Math.PI) / 180;
    const opacity = 0.72 + 0.2 * (0.5 + 0.5 * Math.sin(rad));
    const scale = 1 + 0.04 * Math.sin(rad * 1.15 + 0.6);
    const ty = 1.2 * Math.sin(rad * 0.85);
    const { x, y } = ORIGIN;
    const transform = `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y}) translate(0 ${ty})`;
    return { opacity, transform };
  });

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Circle cx={76} cy={168} r={16} fill="#FF1A1A" />
      <Circle cx={68} cy={162} r={8} fill="#B71C1C" />
      <Circle cx={88} cy={176} r={6} fill="#FF5252" />
      <Path
        d="M52 178 Q62 195 78 188 T98 182"
        fill="none"
        stroke="#B71C1C"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M58 168 L66 182 M72 160 L80 174 M85 170 L92 185"
        fill="none"
        stroke="#8B0000"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M95 158 Q102 172 98 188"
        fill="none"
        stroke="#FF1A1A"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </AnimatedG>
  );
}
