import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

/** A small, calm sideways wander; the scene and ground remain stationary. */
export function IdleMotion({ children }: { children: React.ReactNode }) {
  const offset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const move = (toValue: number, duration: number) => Animated.timing(offset, {
      toValue, duration, easing: Easing.inOut(Easing.sin),
      useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    });
    const animation = Animated.sequence([
      move(-6, 1500),
      Animated.loop(Animated.sequence([move(6, 3000), move(-6, 3000)]), { resetBeforeIteration: false }),
    ]);
    animation.start();
    return () => { animation.stop(); offset.setValue(0); };
  }, [offset]);
  return <Animated.View style={{ transform: [{ translateX: offset }] }}>{children}</Animated.View>;
}
