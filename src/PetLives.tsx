import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HEART_CRACK_PATH, HEART_FILLED_PATH, HEART_OUTLINE_PATH, HEART_STROKE_WIDTH, HEART_VIEWBOX } from '../assets/pet/heart-paths';
import { PET_LIVES_MAX } from './types';

type HeartIconProps = {
  size?: number;
  color: string;
};

export function HeartFilled({ size = 28, color }: HeartIconProps) {
  const height = (size * HEART_VIEWBOX.h) / HEART_VIEWBOX.w;
  return (
    <Svg width={size} height={height} viewBox={`0 0 ${HEART_VIEWBOX.w} ${HEART_VIEWBOX.h}`}>
      <Path d={HEART_FILLED_PATH} fill={color} />
    </Svg>
  );
}

export function HeartBroken({ size = 28, color }: HeartIconProps) {
  const height = (size * HEART_VIEWBOX.h) / HEART_VIEWBOX.w;
  const strokeProps = {
    fill: 'none' as const,
    stroke: color,
    strokeWidth: HEART_STROKE_WIDTH,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${HEART_VIEWBOX.w} ${HEART_VIEWBOX.h}`}>
      <Path d={HEART_OUTLINE_PATH} {...strokeProps} />
      <Path d={HEART_CRACK_PATH} {...strokeProps} />
    </Svg>
  );
}

type PetLivesProps = {
  lives: number;
  color: string;
  size?: number;
  gap?: number;
};

/** Three-heart life bar — filled hearts for remaining lives, broken for lost ones. */
export default function PetLives({ lives, color, size = 28, gap = 6 }: PetLivesProps) {
  const clamped = Math.max(0, Math.min(PET_LIVES_MAX, lives));

  return (
    <View style={[styles.row, { gap }]}>
      {Array.from({ length: PET_LIVES_MAX }, (_, i) => {
        const filled = i < clamped;
        return filled ? (
          <HeartFilled key={i} size={size} color={color} />
        ) : (
          <HeartBroken key={i} size={size} color={color} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
