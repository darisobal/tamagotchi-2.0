import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { Artwork } from './Artwork';
import { ArtworkAsset } from './artworkAssets';

/** Each failed day detaches exactly one authored part; earlier parts stay fallen. */
export function FailurePet({ failures, animate }: { failures: number; animate: boolean }) {
  return <View style={{ width: 157.373, height: 267.971 }}>
    <FallingPart asset="failure-body" lost={failures >= 5} animate={animate && failures === 5} origin="99px 183px" end={[25, 85, 80]} />
    <FallingPart asset="failure-head" lost={failures >= 5} animate={animate && failures === 5} origin="87px 67px" end={[-90, 230, -35]} />
    <FallingPart asset="failure-left-arm" lost={failures >= 3} animate={animate && failures === 3} origin="68px 145px" end={[-55, 180, 65]} />
    <FallingPart asset="failure-right-arm" lost={failures >= 4} animate={animate && failures === 4} origin="131px 139px" end={[85, 130, -55]} />
    <FallingPart asset="failure-left-leg" lost={failures >= 1} animate={animate && failures === 1} origin="23.5px 260.65px" start={[56, -15, 100]} end={[-25, 50, -15]} />
    <FallingPart asset="failure-right-leg" lost={failures >= 2} animate={animate && failures === 2} origin="113px 227px" end={[55, 70, -80]} />
  </View>;
}

function FallingPart({ asset, lost, animate, origin, start = [0, 0, 0], end }: {
  asset: ArtworkAsset; lost: boolean; animate: boolean; origin: string;
  start?: [number, number, number]; end: [number, number, number];
}) {
  const progress = useRef(new Animated.Value(lost && !animate ? 1 : 0)).current;
  useEffect(() => {
    progress.setValue(lost && !animate ? 1 : 0);
    if (!lost || !animate) return;
    const animation = Animated.sequence([Animated.delay(600), Animated.timing(progress, {
      toValue: 1, duration: 1100, easing: Easing.inOut(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    })]);
    animation.start();
    return () => animation.stop();
  }, [lost, animate, progress]);
  return <Animated.View style={{ position: 'absolute', width: 157.373, height: 267.971, transformOrigin: origin, transform: [
    { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [start[0], end[0]] }) },
    { translateY: progress.interpolate({ inputRange: [0, .35, 1], outputRange: [start[1], start[1] - 15, end[1]] }) },
    { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: [`${start[2]}deg`, `${end[2]}deg`] }) },
  ] }}><Artwork asset={asset} /></Animated.View>;
}
