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

/** Home screen egg + pet (offset layout). */
export const PET_HOME_EGG_WIDTH = 340;
export const PET_HOME_EGG_HEIGHT = petEggHeight(PET_HOME_EGG_WIDTH); // 408
/** Alive (happy / okay / sad) posed height on home. */
export const PET_HOME_DISPLAY_HEIGHT = 300;
/** Dead posed height on home — kept separate so alive can grow without changing dead. */
export const PET_HOME_DEAD_DISPLAY_HEIGHT = 200;
/** Dead pose: inset from the egg's left edge (hat/head stay visible). */
export const PET_HOME_DEAD_LEFT_INSET = 24;
/** Shift egg + pet right from center; 0 = centered. */
export const PET_HOME_EGG_LEFT_INSET = 80;

/** Setup screen pet size (no egg on setup). */
export const PET_SETUP_DISPLAY_HEIGHT = 200;
/** Dead pose: nudge right so the hat/head stay visible; feet may clip on the right. */
export const PET_SETUP_DEAD_LEFT_INSET = 24;

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
