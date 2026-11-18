import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Modal,
  useWindowDimensions,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Slab } from './theme';
import RewardCouponStack from './RewardCouponStack';
import {
  computeRewardOverlayLayout,
  countEarnedCoupons,
  FIGMA_REWARD_FRAME,
  RewardOverlayLayout,
} from './coupons';
import { CheckIn } from './types';

type CouponRewardOverlayProps = {
  visible: boolean;
  pendingCheckIn: CheckIn | null;
  checkIns: CheckIn[];
  onCollected: (checkInId: string) => void;
};

/** Initial counter-clockwise peel at the perforation line. */
const TILT_PEEL_DEG = -6;
/** Extra tilt as the body falls away. */
const TILT_FALL_DEG = -14;
/** Small vertical lift to open the tear gap at the dashed line. */
const TEAR_LIFT_PX = 10;
/** Horizontal drift while falling — reads as gravity + hand motion. */
const TEAR_DRIFT_PX = -14;

const PEEL_MS = 200;
const FALL_MS = 640;
const FADE_MS = 320;

type OverlayContentProps = {
  layout: RewardOverlayLayout;
  earnedCount: number;
  renderBody: (body: React.ReactNode) => React.ReactNode;
  hidePerforation: boolean;
  pinCopyToBottom: boolean;
};

function OverlayContent({
  layout,
  earnedCount,
  renderBody,
  hidePerforation,
  pinCopyToBottom,
}: OverlayContentProps) {
  return (
    <>
      <RewardCouponStack
        layout={layout}
        bodyWrapper={renderBody}
        hidePerforation={hidePerforation}
      />

      <View
        style={
          pinCopyToBottom
            ? { flex: 1, minHeight: layout.minGapAfterCoupon }
            : { height: layout.minGapAfterCoupon }
        }
      />

      <View style={[styles.copyBlock, { width: layout.copyWidth }]} pointerEvents="none">
        <Text
          style={[
            styles.cta,
            {
              fontSize: layout.ctaFontSize,
              lineHeight: layout.couponLineHeight,
            },
          ]}
        >
          Tear the power coupon off!{'\n'}You earned it!
        </Text>

        <View style={{ height: layout.minGapAfterCta }} />

        <Text
          style={[
            styles.earnedCount,
            {
              fontSize: layout.earnedFontSize,
              lineHeight: layout.couponLineHeight,
            },
          ]}
        >
          Already earned: {earnedCount}
        </Text>
      </View>
    </>
  );
}

export default function CouponRewardOverlay({
  visible,
  pendingCheckIn,
  checkIns,
  onCollected,
}: CouponRewardOverlayProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [animating, setAnimating] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [hidePerforation, setHidePerforation] = useState(false);
  const lockedCheckInRef = useRef<CheckIn | null>(null);
  const openedCheckInIdRef = useRef<string | null>(null);

  const rotation = useSharedValue(0);
  const bodyTranslateY = useSharedValue(0);
  const bodyTranslateX = useSharedValue(0);
  const bodyOpacity = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  const earnedCount = countEarnedCoupons(checkIns);

  const layout = useMemo(
    () => computeRewardOverlayLayout(screenWidth, screenHeight, insets.top, insets.bottom),
    [screenWidth, screenHeight, insets.top, insets.bottom],
  );

  const mainBodyHeight = layout.scale * FIGMA_REWARD_FRAME.mainHeight;
  const bodyPivot = mainBodyHeight / 2;
  const isWeb = Platform.OS === 'web';

  const resetAnimation = useCallback(() => {
    rotation.value = 0;
    bodyTranslateY.value = 0;
    bodyTranslateX.value = 0;
    bodyOpacity.value = 1;
    overlayOpacity.value = 1;
    setAnimating(false);
    setHidePerforation(false);
  }, [bodyOpacity, bodyTranslateX, bodyTranslateY, overlayOpacity, rotation]);

  useEffect(() => {
    if (!visible || !pendingCheckIn) return;

    lockedCheckInRef.current = pendingCheckIn;
    setSessionOpen(true);

    if (openedCheckInIdRef.current !== pendingCheckIn.id) {
      openedCheckInIdRef.current = pendingCheckIn.id;
      resetAnimation();
    }
  }, [visible, pendingCheckIn?.id, pendingCheckIn, resetAnimation]);

  const activeCheckIn = pendingCheckIn ?? lockedCheckInRef.current;

  const finishCollect = useCallback(() => {
    const checkInId = lockedCheckInRef.current?.id;
    lockedCheckInRef.current = null;
    openedCheckInIdRef.current = null;
    setAnimating(false);
    setSessionOpen(false);
    if (checkInId) onCollected(checkInId);
  }, [onCollected]);

  const onTearPress = useCallback(() => {
    if (!activeCheckIn || animating) return;
    setAnimating(true);

    // Phase 1 — peel: pivot at the perforation line, open a gap at the dashed cut.
    rotation.value = withSpring(TILT_PEEL_DEG, {
      damping: 20,
      stiffness: 260,
      mass: 0.75,
    });

    bodyTranslateY.value = withTiming(TEAR_LIFT_PX, {
      duration: PEEL_MS,
      easing: Easing.out(Easing.cubic),
    });

    bodyTranslateX.value = withTiming(TEAR_DRIFT_PX * 0.25, {
      duration: PEEL_MS,
      easing: Easing.out(Easing.cubic),
    });

    // Phase 2 — fall: body drops away from the fixed stub.
    rotation.value = withDelay(
      PEEL_MS * 0.55,
      withTiming(TILT_FALL_DEG, {
        duration: FALL_MS,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    bodyTranslateY.value = withDelay(
      PEEL_MS * 0.45,
      withTiming(screenHeight * 0.62, {
        duration: FALL_MS,
        easing: Easing.in(Easing.cubic),
      }),
    );

    bodyTranslateX.value = withDelay(
      PEEL_MS * 0.45,
      withTiming(TEAR_DRIFT_PX, {
        duration: FALL_MS,
        easing: Easing.inOut(Easing.quad),
      }),
    );

    bodyOpacity.value = withDelay(
      PEEL_MS + FALL_MS * 0.35,
      withTiming(0, {
        duration: FALL_MS * 0.55,
        easing: Easing.in(Easing.quad),
      }),
    );

    // Keep the green screen opaque until the coupon body is gone, then fade out once.
    overlayOpacity.value = withDelay(
      PEEL_MS + FALL_MS * 0.88,
      withSequence(
        withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 }, (finished) => {
          if (finished) runOnJS(finishCollect)();
        }),
      ),
    );
  }, [
    activeCheckIn,
    animating,
    bodyOpacity,
    bodyTranslateX,
    bodyTranslateY,
    finishCollect,
    overlayOpacity,
    rotation,
    screenHeight,
  ]);

  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => setHidePerforation(true), PEEL_MS * 0.7);
    return () => clearTimeout(timer);
  }, [animating]);

  const bodyAnimatedStyle = useAnimatedStyle(() => {
    if (isWeb) {
      return {
        opacity: bodyOpacity.value,
        zIndex: bodyTranslateY.value > 1 ? 3 : 1,
        transform: [
          { rotate: `${rotation.value}deg` },
          { translateY: bodyTranslateY.value },
          { translateX: bodyTranslateX.value },
        ],
      };
    }

    return {
      opacity: bodyOpacity.value,
      zIndex: bodyTranslateY.value > 1 ? 3 : 1,
      transform: [
        { translateY: -bodyPivot },
        { rotate: `${rotation.value}deg` },
        { translateY: bodyPivot + bodyTranslateY.value },
        { translateX: bodyTranslateX.value },
      ],
    };
  }, [bodyPivot, isWeb]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const renderBody = useCallback(
    (body: React.ReactNode) => (
      <Animated.View style={[styles.tornBody, isWeb && styles.tornBodyWeb, bodyAnimatedStyle]}>
        {body}
      </Animated.View>
    ),
    [bodyAnimatedStyle, isWeb],
  );

  if (!sessionOpen || !activeCheckIn) return null;

  const contentProps = {
    layout,
    earnedCount,
    renderBody,
    hidePerforation,
  };

  const pressAreaStyle = [
    styles.pressArea,
    {
      paddingHorizontal: layout.horizontalPad,
      paddingTop: layout.topPad,
      paddingBottom: layout.bottomPad,
    },
  ];

  return (
    <Modal visible={sessionOpen} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, overlayAnimatedStyle]}>
        <Pressable
          style={pressAreaStyle}
          onPress={onTearPress}
          disabled={animating}
          accessibilityRole="button"
          accessibilityLabel="Tear the power coupon off"
        >
          {layout.needsScroll ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <OverlayContent {...contentProps} pinCopyToBottom={false} />
            </ScrollView>
          ) : (
            <View style={styles.pinnedLayout}>
              <OverlayContent {...contentProps} pinCopyToBottom />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.stateGoodBg,
  },
  pressArea: {
    flex: 1,
  },
  pinnedLayout: {
    flex: 1,
    alignItems: 'flex-start',
  },
  scrollContent: {
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  tornBody: {},
  tornBodyWeb: {
    transformOrigin: 'top center',
    willChange: 'transform, opacity',
  } as object,
  copyBlock: {
    alignSelf: 'flex-start',
  },
  cta: {
    fontFamily: Slab.bold,
    color: Colors.ink,
  },
  earnedCount: {
    fontFamily: Slab.bold,
    color: Colors.ink,
  },
});
