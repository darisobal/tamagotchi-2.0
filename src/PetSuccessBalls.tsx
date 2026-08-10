import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type PetSuccessBallsProps = {
  emoji: string;
  layoutWidth: number;
  layoutHeight: number;
  /** Line-art pet uses SVG proportions; pixel/selfie pets are squarer. */
  variant?: 'lineArt' | 'pixel';
  style?: ViewStyle;
};

/** Vertical anchor as a fraction of layout height — torso midpoint per pet type. */
const TORSO_CENTER_Y: Record<'lineArt' | 'pixel', number> = {
  lineArt: 0.37,
  pixel: 0.62,
};

/**
 * Two sports-ball emoji centered on the pet's torso.
 * Absolutely positioned — does not affect surrounding layout.
 */
export default function PetSuccessBalls({
  emoji,
  layoutWidth,
  layoutHeight,
  variant = 'lineArt',
  style,
}: PetSuccessBallsProps) {
  const size = Math.round(layoutHeight * (variant === 'lineArt' ? 0.095 : 0.14));
  const gap = Math.round(size * 0.2);
  const centerY = layoutHeight * TORSO_CENTER_Y[variant];

  return (
    <View pointerEvents="none" style={[styles.layer, { width: layoutWidth, height: layoutHeight }, style]}>
      <View
        style={[
          styles.cluster,
          {
            top: centerY - size / 2,
            width: layoutWidth,
            height: size,
          },
        ]}
      >
        <Text style={[styles.ball, { fontSize: size, lineHeight: size * 1.05, marginRight: gap }]}>
          {emoji}
        </Text>
        <Text style={[styles.ball, { fontSize: size, lineHeight: size * 1.05 }]}>
          {emoji}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'visible',
  },
  cluster: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    textAlign: 'center',
  },
});
