import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { PetHat as PetHatId } from './types';
import { Colors } from './theme';
import PetHat from './PetHat';
import {
  EMPTY_FACE_HAT,
  EMPTY_FACE_PATHS,
  EMPTY_FACE_SCENE_VB,
  EMPTY_FACE_STROKE_WIDTH,
} from '../assets/pet/empty-paths';

type Props = {
  width?: number;
  color?: string;
  hat?: PetHatId;
};

/** Sad doodle head from `assets/pet/empty.svg`, with optional hat overlay. */
export default function EmptyFace({
  width = 120,
  color = Colors.pet,
  hat = 'none',
}: Props) {
  const height = (width * EMPTY_FACE_SCENE_VB.h) / EMPTY_FACE_SCENE_VB.w;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${EMPTY_FACE_SCENE_VB.x} ${EMPTY_FACE_SCENE_VB.y} ${EMPTY_FACE_SCENE_VB.w} ${EMPTY_FACE_SCENE_VB.h}`}
      overflow="visible"
      accessibilityLabel="sad pet face"
    >
      {EMPTY_FACE_PATHS.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={EMPTY_FACE_STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <PetHat hat={hat} {...EMPTY_FACE_HAT} strokeColor={color} />
    </Svg>
  );
}
