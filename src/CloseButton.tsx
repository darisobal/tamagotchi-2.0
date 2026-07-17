import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Border, Colors, Radius, Slab } from './theme';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  size?: number;
};

/**
 * Shared close / dismiss control — square ink border, chunky "x".
 * Used for modal dismiss, screen dismiss, and destructive remove actions.
 */
export default function CloseButton({
  onPress,
  accessibilityLabel = 'close',
  style,
  size = 36,
}: CloseButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, { width: size, height: size }, style]}
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>x</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: Border.base,
    borderColor: Colors.ink,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  icon: {
    fontSize: 18,
    fontFamily: Slab.black,
    color: Colors.ink,
    marginTop: -2,
    lineHeight: 20,
  },
});
