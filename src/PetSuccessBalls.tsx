import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  /** Same sports-ball emoji for both sides (Unicode; system-rendered). */
  emoji: string;
  /**
   * Font size in px. Callers should scale with the pet's display height
   * so the balls stay attached visually across screen sizes.
   */
  size?: number;
};

/**
 * Two sports-ball emoji overlaid on the pet's lower torso.
 * Absolute / non-layout — must sit inside the pet's visual layer so bob/scale
 * animations carry them without shifting surrounding UI.
 */
export default function PetSuccessBalls({ emoji, size = 28 }: Props) {
  return (
    <View pointerEvents="none" style={styles.layer} accessibilityElementsHidden>
      <View style={styles.pair}>
        <Text
          style={[styles.ball, { fontSize: size, lineHeight: size + 4, marginRight: size * 0.15 }]}
          allowFontScaling={false}
        >
          {emoji}
        </Text>
        <Text
          style={[styles.ball, { fontSize: size, lineHeight: size + 4, marginLeft: size * 0.15 }]}
          allowFontScaling={false}
        >
          {emoji}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  /** Horizontally centered pair — slight bias matches the line-art body's center. */
  pair: {
    position: 'absolute',
    // Lower abdomen / bottom of torso (~y 145 in 360 viewBox).
    top: '40%',
    left: '6%',
    right: '10%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ball: {
    textAlign: 'center',
  },
});
