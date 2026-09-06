import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { Colors, Slab } from './theme';
import {
  COUPON_CONFETTI_DOTS,
  FIGMA_REWARD_FRAME,
  POWER_COUPON_HEADLINE,
  POWER_COUPON_SUBLINE,
} from './coupons';
import { COUPON_ARTBOARD, COUPON_FULL_PATH } from './couponShapes';

const LIST_PERFORATION_Y_RATIO = 48 / 424;

export type PowerCouponVariant = 'list';

type PowerCouponProps = {
  rotation?: number;
  notchColor?: string;
  scale?: number;
  variant?: PowerCouponVariant;
};

function ListCoupon({
  rotation,
  notchColor,
  scale,
}: {
  rotation: number;
  notchColor: string;
  scale: number;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const horizontalPad = 28;
  const couponWidth = Math.min(
    (screenWidth - horizontalPad * 2) * scale,
    FIGMA_REWARD_FRAME.couponWidth * (screenWidth / FIGMA_REWARD_FRAME.screenWidth) * scale,
  );
  const couponHeight = couponWidth * (COUPON_ARTBOARD.mainHeight / COUPON_ARTBOARD.width);
  const perforationY = couponHeight * LIST_PERFORATION_Y_RATIO;
  const notchRadius = couponWidth * (COUPON_ARTBOARD.notchRadius / COUPON_ARTBOARD.width);
  const fontSize = couponWidth * (42 / COUPON_ARTBOARD.width);
  const lineHeight = couponWidth * (48 / COUPON_ARTBOARD.width);
  const lineInset = couponWidth * (COUPON_ARTBOARD.perforationInset / COUPON_ARTBOARD.width);
  const lineWidth = couponWidth - lineInset * 2;

  return (
    <View
      style={[
        styles.stack,
        {
          width: couponWidth + notchRadius * 2,
          height: couponHeight,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <View
        style={[
          styles.mainBody,
          {
            width: couponWidth,
            height: couponHeight,
            marginHorizontal: notchRadius,
          },
        ]}
      >
        <Svg
          width={couponWidth}
          height={couponHeight}
          viewBox={`0 0 ${COUPON_ARTBOARD.width} ${COUPON_ARTBOARD.mainHeight}`}
          style={StyleSheet.absoluteFill}
        >
          <Path d={COUPON_FULL_PATH} fill={Colors.card} />
        </Svg>

        {COUPON_CONFETTI_DOTS.map((dot, i) => (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: dot.x * couponWidth - dot.size / 2,
              top: dot.y * couponHeight - dot.size / 2,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: dot.color,
            }}
          />
        ))}

        <View
          pointerEvents="none"
          style={[
            styles.notch,
            {
              top: perforationY - notchRadius,
              left: -notchRadius,
              width: notchRadius * 2,
              height: notchRadius * 2,
              borderRadius: notchRadius,
              backgroundColor: notchColor,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.notch,
            {
              top: perforationY - notchRadius,
              right: -notchRadius,
              width: notchRadius * 2,
              height: notchRadius * 2,
              borderRadius: notchRadius,
              backgroundColor: notchColor,
            },
          ]}
        />
        <View style={[styles.perforationRow, { top: perforationY - 1, left: lineInset, width: lineWidth }]}>
          <Svg width={lineWidth} height={2}>
            <Line
              x1={0}
              y1={1}
              x2={lineWidth}
              y2={1}
              stroke={Colors.ink}
              strokeWidth={2}
              strokeDasharray="8 6"
            />
          </Svg>
        </View>

        <View style={{ paddingTop: perforationY + 24, paddingHorizontal: 20 }}>
          <Text style={[styles.headlineBlack, { fontSize, lineHeight }]}>
            {POWER_COUPON_HEADLINE}
          </Text>
          <Text style={[styles.headlineMedium, { fontSize, lineHeight }]}>
            {POWER_COUPON_SUBLINE}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function PowerCoupon({
  rotation = 0,
  notchColor = Colors.stateGoodBg,
  scale = 1,
}: PowerCouponProps) {
  return <ListCoupon rotation={rotation} notchColor={notchColor} scale={scale} />;
}

const styles = StyleSheet.create({
  stack: {
    alignItems: 'center',
  },
  perforationRow: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  notch: {
    position: 'absolute',
    zIndex: 3,
  },
  mainBody: {
    position: 'relative',
    overflow: 'visible',
  },
  headlineBlack: {
    fontFamily: Slab.black,
    color: Colors.ink,
  },
  headlineMedium: {
    fontFamily: Slab.medium,
    color: Colors.ink,
  },
});
