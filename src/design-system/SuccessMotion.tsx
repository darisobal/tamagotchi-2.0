import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

const FlipProgress = createContext<Animated.Value | null>(null);
const native = Platform.OS !== 'web';

/** Upright pause → flip → wiggly handstand → flip back; the loop joins seamlessly. */
export function SuccessFlip({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 6400, easing: Easing.linear, useNativeDriver: native, isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [progress]);
  return <FlipProgress.Provider value={progress}><Animated.View style={{ width: 175.175, height: 264.578, transform: [
    { translateY: progress.interpolate({ inputRange: [0, .15, .27, .4, .7, .8, .9, 1], outputRange: [0, 0, -15, 0, 0, -15, 0, 0] }) },
    { rotate: progress.interpolate({ inputRange: [0, .15, .27, .4, .7, .8, .9, 1], outputRange: ['180deg', '180deg', '250deg', '360deg', '360deg', '430deg', '540deg', '540deg'] }) },
  ] }}>{children}</Animated.View></FlipProgress.Provider>;
}

/** Rotate the original leg strokes about their attachment points, not their centres. */
export function SuccessLeg({ side, children }: { side: 'left' | 'right'; children: React.ReactNode }) {
  const progress = useContext(FlipProgress);
  if (!progress) return <>{children}</>;
  const direction = side === 'left' ? 1 : -1;
  return <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: 175.175, height: 264.578,
    transformOrigin: side === 'left' ? '65px 40px' : '114px 40px',
    transform: [{ rotate: progress.interpolate({ inputRange: [0, .18, .4, .46, .52, .58, .64, .7, .9, 1],
      outputRange: [65, 65, 0, 14, -5, 10, 0, 0, 65, 65].map(angle => `${angle * direction}deg`) }) }],
  }}>{children}</Animated.View>;
}

/** Float and tumble the authored confetti without deforming its circles or strokes. */
export function SuccessConfetti({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: native, isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [progress]);
  return <Animated.View pointerEvents="none" aria-hidden style={{ position: 'absolute', width: 382, height: 438, transform: [
    { translateY: progress.interpolate({ inputRange: [0, .5, 1], outputRange: [-7, 7, -7] }) },
    { rotate: progress.interpolate({ inputRange: [0, .5, 1], outputRange: ['-3deg', '3deg', '-3deg'] }) },
    { scale: progress.interpolate({ inputRange: [0, .5, 1], outputRange: [.96, 1, .96] }) },
  ] }}>{children}</Animated.View>;
}
