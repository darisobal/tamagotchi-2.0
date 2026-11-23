import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Artwork } from './Artwork';
import { ArtworkAsset } from './artworkAssets';

/** Original vector layers, gently animated without changing the authored composition. */
export function DoubleSuccessDecor() {
  return <>
    <CelebrationLayer asset="double-rainbow" origin="191px 426px" duration={4200} rainbow />
    <CelebrationLayer asset="double-heart-left" origin="101px 239px" duration={2300} tilt={-5} />
    <CelebrationLayer asset="double-heart-right" origin="272px 240px" duration={2700} tilt={5} />
    <CelebrationLayer asset="double-heart-top" origin="289px 90px" duration={3000} tilt={-3} />
  </>;
}

function CelebrationLayer({ asset, origin, duration, rainbow = false, tilt = 0 }: {
  asset: ArtworkAsset; origin: string; duration: number; rainbow?: boolean; tilt?: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration, easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); progress.setValue(0); };
  }, [duration, progress]);
  const wave = (values: number[]) => progress.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: values });
  return <Animated.View pointerEvents="none" aria-hidden style={{
    position: 'absolute', width: 382, height: 438, transformOrigin: origin,
    transform: rainbow ? [
      { scaleX: wave([1, .99, .98, .99, 1]) },
      { scaleY: wave([1, 1.012, 1.024, 1.012, 1]) },
    ] : [
      { translateY: wave([0, -3, -6, -3, 0]) },
      { scale: wave([1, 1.06, 1, 1.035, 1]) },
      { rotate: progress.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [0, tilt, 0, -tilt, 0].map(value => `${value}deg`) }) },
    ],
  }}><Artwork asset={asset} width={382} height={438} /></Animated.View>;
}
