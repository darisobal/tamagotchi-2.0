import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { PetHat as PetHatId } from './types';

type Props = {
  hat: PetHatId;
  /** Horizontal centre in viewBox units. */
  cx: number;
  /** Y where the hat brim/cuff sits (top of the pet's head). */
  baseY: number;
  /** Visible width of the hat in viewBox units. */
  width: number;
  /** Visible height of the hat (from `baseY` upward). */
  height: number;
  /** Outline + main fill colour. */
  strokeColor: string;
};

/**
 * Tiny SVG hat overlay drawn above the line-art pet's head. Designed to nest
 * inside the same viewBox as the rest of the pet figure so it bobs/scales
 * with the body.
 */
export default function PetHat({ hat, cx, baseY, width, height, strokeColor }: Props) {
  if (hat === 'none') return null;

  const halfW = width / 2;
  const stroke = Math.max(2, Math.round(width / 14));

  if (hat === 'top') {
    const brimY = baseY;
    const brimH = Math.max(2, Math.round(height / 5));
    const crownTop = baseY - height;
    const crownW = width * 0.6;
    return (
      <G>
        <Rect
          x={cx - halfW}
          y={brimY - brimH / 2}
          width={width}
          height={brimH}
          rx={brimH / 2}
          ry={brimH / 2}
          fill={strokeColor}
        />
        <Rect
          x={cx - crownW / 2}
          y={crownTop}
          width={crownW}
          height={height - brimH / 2}
          fill={strokeColor}
        />
        <Rect
          x={cx - crownW / 2}
          y={brimY - brimH / 2 - 2}
          width={crownW}
          height={Math.max(2, brimH - 1)}
          fill="#FFFFFF"
        />
      </G>
    );
  }

  if (hat === 'beanie') {
    const cuffH = Math.max(3, Math.round(height / 4));
    const cuffTop = baseY - cuffH / 2;
    const bodyTop = cuffTop - (height - cuffH) + cuffH;
    const top = baseY - height;
    return (
      <G>
        <Path
          d={`M ${cx - halfW} ${cuffTop + cuffH / 2} Q ${cx} ${top - cuffH / 2} ${cx + halfW} ${cuffTop + cuffH / 2} Z`}
          fill={strokeColor}
          stroke={strokeColor}
          strokeWidth={stroke / 2}
          strokeLinejoin="round"
        />
        <Rect
          x={cx - halfW}
          y={cuffTop}
          width={width}
          height={cuffH}
          rx={cuffH / 2}
          ry={cuffH / 2}
          fill={strokeColor}
        />
        <Rect
          x={cx - halfW + stroke}
          y={cuffTop + cuffH / 2 - 1}
          width={width - stroke * 2}
          height={2}
          fill="#FFFFFF"
          opacity={0.5}
        />
        <Circle cx={cx} cy={top - cuffH / 4} r={Math.max(3, height / 8)} fill={strokeColor} />
        {/* Suppress unused var warning while still computing for clarity. */}
        {bodyTop < 0 ? null : null}
      </G>
    );
  }

  if (hat === 'crown') {
    const baseH = Math.max(3, Math.round(height / 3));
    const top = baseY - height;
    const midX = cx;
    const leftX = cx - halfW;
    const rightX = cx + halfW;
    const baseTopY = baseY - baseH;
    const peakY = top;
    const dipY = baseTopY + 1;
    const d =
      `M ${leftX} ${baseY} ` +
      `L ${rightX} ${baseY} ` +
      `L ${rightX} ${baseTopY} ` +
      `L ${rightX - width * 0.18} ${peakY + 2} ` +
      `L ${cx + width * 0.22} ${dipY} ` +
      `L ${midX} ${peakY} ` +
      `L ${cx - width * 0.22} ${dipY} ` +
      `L ${leftX + width * 0.18} ${peakY + 2} ` +
      `L ${leftX} ${baseTopY} Z`;
    return (
      <G>
        <Path d={d} fill="#FFC73A" stroke={strokeColor} strokeWidth={stroke} strokeLinejoin="round" />
        <Circle cx={cx} cy={baseTopY + baseH / 2} r={Math.max(1.6, baseH / 4)} fill="#FF3B6B" />
        <Circle
          cx={cx - width * 0.25}
          cy={baseTopY + baseH / 2}
          r={Math.max(1.2, baseH / 5)}
          fill="#1F1AE6"
        />
        <Circle
          cx={cx + width * 0.25}
          cy={baseTopY + baseH / 2}
          r={Math.max(1.2, baseH / 5)}
          fill="#1F1AE6"
        />
      </G>
    );
  }

  return null;
}

/**
 * Standalone hat thumbnail (no pet body). Used by the hat picker tiles so the
 * user sees the hat itself rather than a pet wearing it.
 */
export function HatOnlyPreview({
  hat,
  size = 64,
  strokeColor,
}: {
  hat: PetHatId;
  size?: number;
  strokeColor: string;
}) {
  const VB_W = 80;
  const VB_H = 60;
  return (
    <Svg width={size} height={(size * VB_H) / VB_W} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      <PetHat
        hat={hat}
        cx={VB_W / 2}
        baseY={VB_H - 6}
        width={56}
        height={44}
        strokeColor={strokeColor}
      />
    </Svg>
  );
}
