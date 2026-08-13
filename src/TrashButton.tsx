import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from './theme';

type TrashButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  size?: number;
};

export default function TrashButton({
  onPress,
  accessibilityLabel = 'delete',
  style,
  size = 24,
}: TrashButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="3" y="7" width="18" height="3" fill={Colors.ink} />
        <Rect x="8.5" y="4" width="7" height="3" fill={Colors.ink} />
        <Path
          d="M6 10h12l-1.2 11H7.2L6 10z"
          fill={Colors.ink}
        />
        <Rect x="10" y="12.5" width="2" height="6.5" fill={Colors.card} />
        <Rect x="14" y="12.5" width="2" height="6.5" fill={Colors.card} />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
