import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  HEART_CRACK_PATH,
  HEART_CRACK_STROKE_WIDTH,
  HEART_FILLED_PATH,
  HEART_OUTLINE_PATH,
  HEART_STROKE_WIDTH,
  HEART_VIEWBOX,
} from '../assets/pet/heart-paths';
import { PET_LIVES_MAX } from './types';

type HeartIconProps = {
  size?: number;
  color: string;
};

const HEART_VB = `${HEART_VIEWBOX.minX} ${HEART_VIEWBOX.minY} ${HEART_VIEWBOX.w} ${HEART_VIEWBOX.h}`;

export function HeartFilled({ size = 28, color }: HeartIconProps) {
  const height = (size * HEART_VIEWBOX.h) / HEART_VIEWBOX.w;
  return (
    <Svg width={size} height={height} viewBox={HEART_VB}>
      <Path
        d={HEART_FILLED_PATH}
        fill={color}
        stroke={color}
        strokeWidth={HEART_STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HeartBroken({ size = 28, color }: HeartIconProps) {
  const height = (size * HEART_VIEWBOX.h) / HEART_VIEWBOX.w;

  return (
    <Svg width={size} height={height} viewBox={HEART_VB}>
      <Path
        d={HEART_OUTLINE_PATH}
        fill="none"
        stroke={color}
        strokeWidth={HEART_STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d={HEART_CRACK_PATH}
        fill="none"
        stroke={color}
        strokeWidth={HEART_CRACK_STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
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
