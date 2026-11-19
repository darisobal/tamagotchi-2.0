import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { artworkAssets } from './artworkAssets';
import { readAsset } from './readAsset';

/** Keep the static authored scene for people who request reduced motion. */
export function useSceneMotion(enabled: boolean) {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return enabled && !reduced;
}

export function MissedRain({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [progress]);
  return <Animated.View pointerEvents="none" aria-hidden style={{ position: 'absolute', width: 382, height: 438, transform: [
    { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 438] }) },
    { translateX: progress.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [0, 3, 0, -3, 0] }) },
  ] }}>
    {children}
  </Animated.View>;
}

let looseLegXml: Promise<string> | undefined;
export function RunawayLeg() {
  const [xml, setXml] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let active = true;
    looseLegXml ??= readAsset(artworkAssets['8dcbc'].source).then(source => {
      const path = source.match(/<path\b[^>]*id="Vector 39"[^>]*\/>/)?.[0];
      if (!path) throw new Error('Missing authored loose leg');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="157.373" height="246.121" viewBox="0 0 157.373 246.121">${path}</svg>`;
    });
    void looseLegXml.then(value => { if (active) setXml(value); }).catch(() => { looseLegXml = undefined; });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(800),
      Animated.timing(progress, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
      Animated.delay(1700),
      Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: Platform.OS !== 'web', isInteraction: false }),
    ]));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [progress]);
  // Starts at the body, hops outward, then rests at the original drawing's position.
  return <Animated.View pointerEvents="none" aria-hidden style={{ position: 'absolute', left: -.305, top: 21.853, width: 157.373, height: 246.121, transformOrigin: '23.8px 238.8px', transform: [
    { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [56, 0] }) },
    { translateY: progress.interpolate({ inputRange: [0, .45, .8, 1], outputRange: [-15, -36, 3, 0] }) },
    { rotate: progress.interpolate({ inputRange: [0, .8, 1], outputRange: ['100deg', '-8deg', '0deg'] }) },
  ] }}>{xml ? <SvgXml xml={xml} /> : null}</Animated.View>;
}
