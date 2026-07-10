import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Normalized egg silhouette (viewBox 0 0 100 120) — narrow top, wider bottom. */
export const PET_EGG_VIEWBOX = { w: 100, h: 120 };

/** Egg path with the wide end at the bottom (matches Figma, flipped from source art). */
export const PET_EGG_PATH =
  'M50 118 C74 118 98 98 98 68 C98 38 76 2 50 2 C24 2 2 38 2 68 C2 98 26 118 50 118 Z';

type PetEggShellProps = {
  width: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export function petEggHeight(width: number): number {
  return width * (PET_EGG_VIEWBOX.h / PET_EGG_VIEWBOX.w);
}

export default function PetEggShell({
  width,
  height = petEggHeight(width),
  color = '#FFFFFF',
  style,
}: PetEggShellProps) {
  return (
    <View style={[{ width, height }, style]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${PET_EGG_VIEWBOX.w} ${PET_EGG_VIEWBOX.h}`}
      >
        <Path d={PET_EGG_PATH} fill={color} />
      </Svg>
    </View>
  );
}

export const petEggShellStyles = StyleSheet.create({
  centered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 0,
  },
});
