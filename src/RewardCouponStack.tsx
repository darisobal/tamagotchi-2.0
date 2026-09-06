import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { Colors, Slab } from './theme';
import {
  FIGMA_REWARD_FRAME,
  POWER_COUPON_BLUR_PREVIEW,
  POWER_COUPON_HEADLINE,
  POWER_COUPON_SUBLINE,
  REWARD_MAIN_CONFETTI,
  RewardOverlayLayout,
} from './coupons';
import {
  COUPON_ARTBOARD,
  COUPON_BODY_PATH,
  COUPON_STUB_PATH,
} from './couponShapes';

type RewardCouponStackProps = {
  notchColor?: string;
  layout: RewardOverlayLayout;
  bodyWrapper?: (body: React.ReactNode) => React.ReactNode;
  /** When true, the perforation line is hidden (e.g. after the body has torn away). */
  hidePerforation?: boolean;
};

function PerforationLine({
  width,
  notchRadius,
  notchColor,
}: {
  width: number;
  notchRadius: number;
  notchColor: string;
}) {
  const inset = width * (COUPON_ARTBOARD.perforationInset / COUPON_ARTBOARD.width);
  const lineWidth = width - inset * 2;

  return (
    <View style={[styles.perforationLine, { width, height: notchRadius * 2 }]}>
      <View
        pointerEvents="none"
        style={[
          styles.notch,
          {
            left: -notchRadius,
            top: '50%',
            marginTop: -notchRadius,
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
            right: -notchRadius,
            top: '50%',
            marginTop: -notchRadius,
            width: notchRadius * 2,
            height: notchRadius * 2,
            borderRadius: notchRadius,
            backgroundColor: notchColor,
          },
        ]}
      />
      <View style={{ marginLeft: inset, width: lineWidth }}>
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
    </View>
  );
}

function CouponStubShape({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${COUPON_ARTBOARD.width} ${COUPON_ARTBOARD.peekHeight}`}
      style={StyleSheet.absoluteFill}
    >
      <Path d={COUPON_STUB_PATH} fill={Colors.card} />
    </Svg>
  );
}

function CouponBodyShape({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${COUPON_ARTBOARD.width} ${COUPON_ARTBOARD.mainHeight}`}
      style={StyleSheet.absoluteFill}
    >
      <Path d={COUPON_BODY_PATH} fill={Colors.card} />
    </Svg>
  );
}

/** Figma frame 8 — peek stub + perforation + main body as two tear halves. */
export default function RewardCouponStack({
  notchColor = Colors.stateGoodBg,
  layout,
  bodyWrapper,
  hidePerforation = false,
}: RewardCouponStackProps) {
  const { scale } = layout;
  const unit = (value: number) => value * scale;

  const couponWidth = layout.couponWidth;
  const peekHeight = unit(FIGMA_REWARD_FRAME.peekHeight);
  const mainHeight = unit(FIGMA_REWARD_FRAME.mainHeight);
  const fontSize = layout.couponFontSize;
  const lineHeight = layout.couponLineHeight;
  const bodyTextTop = unit(FIGMA_REWARD_FRAME.bodyTextTop);
  const bodyTextLeft = unit(FIGMA_REWARD_FRAME.bodyTextLeft);
  const blurTextLeft = unit(FIGMA_REWARD_FRAME.blurTextLeft);
  const blurTextTop = unit(FIGMA_REWARD_FRAME.blurTextTopInPeek);
  const notchRadius = layout.notchRadius;
  const stackHeight = peekHeight + mainHeight;

  const mainBody = (
    <View style={[styles.mainBody, { width: couponWidth, height: mainHeight }]}>
      <CouponBodyShape width={couponWidth} height={mainHeight} />

      {REWARD_MAIN_CONFETTI.map((dot, i) => {
        const dotSize = unit(dot.size);
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: unit(dot.x) - dotSize / 2,
              top: unit(dot.y) - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dot.color,
            }}
          />
        );
      })}

      <View style={{ paddingTop: bodyTextTop, paddingHorizontal: bodyTextLeft }}>
        <Text style={[styles.headlineBlack, { fontSize, lineHeight }]}>
          {POWER_COUPON_HEADLINE}
        </Text>
        <Text style={[styles.headlineMedium, { fontSize, lineHeight }]}>
          {POWER_COUPON_SUBLINE}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.stack,
        {
          width: layout.copyWidth,
          minHeight: stackHeight,
        },
      ]}
    >
      <View
        style={[
          styles.ticket,
          {
            width: couponWidth,
            marginLeft: notchRadius,
          },
        ]}
      >
        {/* Top stub — rounded top corners, stays fixed during tear animation. */}
        <View style={[styles.peekBody, { width: couponWidth, height: peekHeight }]}>
          <CouponStubShape width={couponWidth} height={peekHeight} />
          <Text
            style={[
              styles.headlineBlack,
              styles.textBlurred,
              {
                fontSize,
                lineHeight,
                position: 'absolute',
                left: blurTextLeft,
                top: blurTextTop,
                width: couponWidth - blurTextLeft * 2,
              },
            ]}
          >
            {POWER_COUPON_BLUR_PREVIEW}
          </Text>
        </View>

        {/* Perforation sits on the seam — absolute so it never opens a layout gap. */}
        {!hidePerforation ? (
          <View
            pointerEvents="none"
            style={[
              styles.perforationSlot,
              {
                top: peekHeight - notchRadius,
                height: notchRadius * 2,
              },
            ]}
          >
            <PerforationLine
              width={couponWidth}
              notchRadius={notchRadius}
              notchColor={notchColor}
            />
          </View>
        ) : null}

        {/* Bottom coupon — flush against stub, no gap between the two halves. */}
        {bodyWrapper ? bodyWrapper(mainBody) : mainBody}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignItems: 'flex-start',
  },
  ticket: {
    position: 'relative',
    overflow: 'visible',
  },
  peekBody: {
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  perforationSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 4,
    justifyContent: 'center',
  },
  perforationLine: {
    justifyContent: 'center',
  },
  notch: {
    position: 'absolute',
    zIndex: 5,
  },
  mainBody: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 1,
  },
  headlineBlack: {
    fontFamily: Slab.black,
    color: Colors.ink,
  },
  headlineMedium: {
    fontFamily: Slab.medium,
    color: Colors.ink,
  },
  textBlurred: Platform.select({
    web: {
      filter: 'blur(8.5px)',
    } as object,
    default: {
      opacity: 0.35,
    },
  }),
});
