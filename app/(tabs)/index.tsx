import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppState } from '../../src/context';
import { DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { Spacing, FontSize, Slab, Radius, Border, Type, Colors } from '../../src/theme';
import { getStateTheme } from '../../src/stateTheme';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import PixelPet from '../../src/PixelPet';
import LineArtPet from '../../src/LineArtPet';
import PetEggShell, {
  PET_HOME_DEAD_DISPLAY_HEIGHT,
  PET_HOME_DEAD_LEFT_INSET,
  PET_HOME_DISPLAY_HEIGHT,
  PET_HOME_EGG_HEIGHT,
  PET_HOME_EGG_LEFT_INSET,
  PET_HOME_EGG_WIDTH,
  petEggShellStyles,
} from '../../src/PetEggShell';
import PetLives from '../../src/PetLives';
import HeroTaskCard from '../../src/HeroTaskCard';
import RestartPaywall from '../../src/RestartPaywall';
import CheckInConfirmModal from '../../src/CheckInConfirmModal';
import {
  CheckInConfirmCopy,
  pickCheckInConfirmCopy,
} from '../../src/checkInConfirmCopy';
import { HEART_VIEWBOX } from '../../assets/pet/heart-paths';
import { formatLifeTimer } from '../../src/logic';
import CouponRewardOverlay from '../../src/CouponRewardOverlay';
import { findCouponForReveal } from '../../src/coupons';

const EGG_FLIP_MS = 480;

/** Pad above the egg (room for lying-down pose). */
const HERO_PET_STAGE_PAD_TOP = 40;
/** Pad below the egg — half of the previous 40 so egg→card gap is 24 with marginBottom. */
const HERO_PET_STAGE_PAD_BOTTOM = 16;
const HERO_PET_STAGE_HEIGHT =
  HERO_PET_STAGE_PAD_TOP + PET_HOME_EGG_HEIGHT + HERO_PET_STAGE_PAD_BOTTOM;

/** Home life hearts — size matches Figma; used to align the egg under them. */
const HERO_HEART_SIZE = 51;
const HERO_HEART_HEIGHT = Math.round(
  (HERO_HEART_SIZE * HEART_VIEWBOX.h) / HEART_VIEWBOX.w,
);
/**
 * Pull the pet stage up so the egg top sits in the same band as the hearts
 * (hearts stay in flow; they layer above the egg via zIndex).
 */
const HERO_EGG_LIFT = HERO_HEART_HEIGHT + HERO_PET_STAGE_PAD_TOP - Spacing.sm;

export default function HomeScreen() {
  const { prefs, computedHabits, tracks, mood, lives, refresh, doCheckIn, checkIns, collectCoupon, couponRevealCheckInId } =
    useAppState();
  const [refreshing, setRefreshing] = React.useState(false);
  const [restartPaywallVisible, setRestartPaywallVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmCopy, setConfirmCopy] = React.useState<CheckInConfirmCopy | null>(null);
  const [eggFlipped, setEggFlipped] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const lastMainCheckIn = checkIns.find((c) => c.trackType === MAIN_TRACK);
  const pendingCoupon = findCouponForReveal(checkIns, couponRevealCheckInId);
  const theme = getStateTheme(mood, {
    lastCheckInWasPaidRestart: Boolean(lastMainCheckIn?.isPaidRestart),
  });
  const tabBarExtraPad = useFloatingTabBarExtraPadding();

  // Single-habit app: card uses the setup name; track status is separate.
  const habit = computedHabits[0] ?? null;
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petName = (prefs.petName || 'champ').trim();
  const petColor = prefs.petColor || theme.pet;
  const streakDays = tracks.find((t) => t.trackType === MAIN_TRACK)?.streak ?? 0;
  const showTrackedCard = mood === 'happy';

  const onHeroCheckIn = useCallback(() => {
    if (mood === 'dead') {
      setRestartPaywallVisible(true);
      return;
    }
    setConfirmCopy(pickCheckInConfirmCopy());
    setConfirmVisible(true);
  }, [mood]);

  const onConfirmCheckIn = useCallback(() => {
    setConfirmVisible(false);
    void doCheckIn(MAIN_TRACK, 'medium', null);
  }, [doCheckIn]);

  const onCancelConfirm = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  const onRestartUnlocked = useCallback(async () => {
    setRestartPaywallVisible(false);
    await doCheckIn(MAIN_TRACK, 'medium', null);
  }, [doCheckIn]);

  const toggleEggFlip = useCallback(() => {
    setEggFlipped((prev) => !prev);
  }, []);

  const onEditHabitName = useCallback(() => {
    router.navigate('/(tabs)/settings?focusHabit=1');
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Spacing.xxl + tabBarExtraPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.ink} />
        }
      >
        <Text style={[styles.greeting, { color: theme.ink }]}>
          {theme.greeting(petName)}
        </Text>

        <View style={styles.heroPetBlock}>
          <View style={styles.livesLayer}>
            <PetLives
              lives={lives}
              color={petColor}
              size={HERO_HEART_SIZE}
              gap={8}
              onPress={toggleEggFlip}
            />
          </View>
          <PetStage
            petType={prefs.petType}
            mood={mood}
            customSprite={prefs.customSprite}
            petColor={petColor}
            petHat={prefs.petHat ?? 'none'}
            petName={petName}
            flipped={eggFlipped}
            timeRemainingMs={habit?.timeRemainingMs ?? 0}
            onPress={toggleEggFlip}
          />
        </View>

        {habit ? (
          <HeroTaskCard
            habitName={habitName}
            motto={theme.motto(habitName)}
            accentColor={petColor}
            borderColor={theme.cardBorder}
            backgroundColor={theme.cardBg}
            mottoColor={theme.mottoInk}
            buttonColor={theme.cardInk}
            checkInLabel={theme.checkInLabel}
            showCrossOut={theme.showCrossOut}
            streakDays={showTrackedCard ? streakDays : null}
            onCheckIn={onHeroCheckIn}
            onHabitNamePress={onEditHabitName}
          />
        ) : (
          <View
            style={[
              styles.emptyCard,
              { borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
            ]}
          >
            <Text style={[styles.emptyCardText, { color: theme.cardInk }]}>
              name your habit in setup
            </Text>
          </View>
        )}
      </ScrollView>

      <RestartPaywall
        visible={restartPaywallVisible}
        onClose={() => setRestartPaywallVisible(false)}
        onUnlocked={onRestartUnlocked}
      />

      <CheckInConfirmModal
        visible={confirmVisible}
        copy={confirmCopy}
        backgroundColor={theme.bg}
        faceColor={petColor}
        onConfirm={onConfirmCheckIn}
        onCancel={onCancelConfirm}
      />

      <CouponRewardOverlay
        visible={Boolean(pendingCoupon)}
        pendingCheckIn={pendingCoupon}
        checkIns={checkIns}
        onCollected={collectCoupon}
      />
    </SafeAreaView>
  );
}

/** Two rectangular colon dots that blink once per second — digital-clock feel. */
function BlinkingColon({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Hard on/off every 500ms (classic digital colon tick).
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(500, withTiming(0, { duration: 0 })),
        withDelay(500, withTiming(1, { duration: 0 })),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const blinkStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.timerColon, blinkStyle]}>
      <View style={[styles.timerColonDot, { backgroundColor: color }]} />
      <View style={[styles.timerColonDot, { backgroundColor: color }]} />
    </Animated.View>
  );
}

function LifeTimer({
  timeRemainingMs,
  color,
}: {
  timeRemainingMs: number;
  color: string;
}) {
  const formatted = formatLifeTimer(timeRemainingMs);
  const [hours, minutes] = formatted.split(':');

  return (
    <View style={styles.eggLifeTimerRow} accessibilityLabel={formatted}>
      <Text style={[styles.eggLifeTimer, { color }]}>{hours}</Text>
      <BlinkingColon color={color} />
      <Text style={[styles.eggLifeTimer, { color }]}>{minutes}</Text>
    </View>
  );
}

const PIXEL_PET_SIZE = 7;

function PetStage({
  petType,
  mood,
  customSprite,
  petColor,
  petHat,
  petName,
  flipped,
  timeRemainingMs,
  onPress,
}: {
  petType: ReturnType<typeof useAppState>['prefs']['petType'];
  mood: ReturnType<typeof useAppState>['mood'];
  customSprite: string | null | undefined;
  petColor: string;
  petHat: ReturnType<typeof useAppState>['prefs']['petHat'];
  petName: string;
  flipped: boolean;
  timeRemainingMs: number;
  onPress: () => void;
}) {
  const useSelfiePixels = petType === 'selfie' && Boolean(customSprite);
  const isDead = mood === 'dead';
  const isSleeping = mood === 'sleeping';
  const flipProgress = useSharedValue(flipped ? 1 : 0);

  useEffect(() => {
    flipProgress.value = withTiming(flipped ? 1 : 0, {
      duration: EGG_FLIP_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [flipped, flipProgress]);

  const frontFaceStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      // backfaceVisibility is unreliable on RN web for SVG children — hide past midpoint.
      opacity: interpolate(flipProgress.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0]),
      zIndex: flipProgress.value < 0.5 ? 2 : 0,
    };
  });

  const backFaceStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipProgress.value, [0, 0.5, 0.5, 1], [0, 0, 1, 1]),
      zIndex: flipProgress.value >= 0.5 ? 2 : 0,
    };
  });

  const eggShellStyle = [
    petEggShellStyles.centered,
    {
      top: HERO_PET_STAGE_PAD_TOP,
      marginTop: 0,
      marginLeft: -PET_HOME_EGG_WIDTH / 2 + PET_HOME_EGG_LEFT_INSET,
    },
  ];

  return (
    <View style={styles.petStage}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={flipped ? 'hide lives info' : 'show lives info'}
        style={styles.petStageCompose}
      >
        <Animated.View style={[styles.eggFace, frontFaceStyle]}>
          <PetEggShell width={PET_HOME_EGG_WIDTH} style={eggShellStyle} />
          <View
            style={[
              styles.petForeground,
              // Dead pose is wider than the egg — pin its left (head/hat) to the egg's
              // left edge so only the feet clip on the right.
              isDead && styles.petForegroundDead,
            ]}
          >
            {useSelfiePixels ? (
              <View style={styles.pixelPetWrap}>
                <PixelPet
                  petType={petType}
                  mood={mood}
                  customSprite={customSprite ?? null}
                  color={petColor}
                  pixelSize={PIXEL_PET_SIZE}
                />
              </View>
            ) : (
              <LineArtPet
                mood={mood}
                strokeColor={petColor}
                displayHeight={
                  isDead ? PET_HOME_DEAD_DISPLAY_HEIGHT : PET_HOME_DISPLAY_HEIGHT
                }
                hat={petHat}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.eggFace, backFaceStyle]}>
          <PetEggShell width={PET_HOME_EGG_WIDTH} style={eggShellStyle} />
          <View style={[styles.eggMessageWrap, isDead && styles.eggMessageWrapDead]}>
            {isDead ? (
              <Text style={styles.eggDeadMessage}>
                {'you are your pet\'s\nworst nightmare.'}
              </Text>
            ) : isSleeping ? (
              <>
                <Text style={styles.eggLifeLabel}>still dreaming...</Text>
                <Text style={[styles.eggSleepHint, { color: petColor }]}>
                  check in to wake up
                </Text>
                <Text style={styles.eggLifeFooter}>
                  {`${petName} has all three hearts — for now`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.eggLifeLabel}>to lose a life:</Text>
                <LifeTimer timeRemainingMs={timeRemainingMs} color={petColor} />
                <Text style={styles.eggLifeFooter}>
                  {`skip three days, and ${petName} is gone`}
                </Text>
              </>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  greeting: {
    ...Type.screenTitle,
    /**
     * Descenders (e.g. “g” in “ugh”) need extra room so they aren’t clipped
     * above the hearts — keep padding beyond the shared screen-title metrics.
     */
    lineHeight: Math.round(FontSize.display * 1.35),
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xs,
    overflow: 'visible',
  },

  emptyCard: {
    borderWidth: Border.hero,
    borderRadius: Radius.lg,
    paddingTop: Spacing.lg + Spacing.xs,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg + Spacing.xs,
    marginBottom: Spacing.lg,
  },
  emptyCardText: {
    fontFamily: Slab.extraBold,
    fontSize: FontSize.xl,
  },

  heroPetBlock: {
    position: 'relative',
    overflow: 'visible',
  },
  /** Hearts stay in their current spot; paint above the raised egg. */
  livesLayer: {
    position: 'relative',
    zIndex: 2,
  },
  petStage: {
    height: HERO_PET_STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -HERO_EGG_LIFT,
    marginBottom: Spacing.sm,
    overflow: 'visible',
    zIndex: 0,
  },
  petStageCompose: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Match egg band so the in-flow pet stays centered on the egg (asymmetric pads).
    paddingTop: HERO_PET_STAGE_PAD_TOP,
    paddingBottom: HERO_PET_STAGE_PAD_BOTTOM,
    position: 'relative',
    overflow: 'visible',
  },
  eggFace: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HERO_PET_STAGE_PAD_TOP,
    paddingBottom: HERO_PET_STAGE_PAD_BOTTOM,
  },
  eggMessageWrap: {
    position: 'absolute',
    top: HERO_PET_STAGE_PAD_TOP,
    left: '50%',
    width: PET_HOME_EGG_WIDTH,
    height: PET_HOME_EGG_HEIGHT,
    marginLeft: -PET_HOME_EGG_WIDTH / 2 + PET_HOME_EGG_LEFT_INSET,
    paddingHorizontal: Spacing.xl + Spacing.md,
    paddingVertical: Spacing.xxl + Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  eggMessageWrapDead: {
    justifyContent: 'center',
  },
  eggLifeLabel: {
    fontFamily: Slab.bold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + 4,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  eggLifeTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggLifeTimer: {
    fontFamily: Slab.black,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
    textAlign: 'center',
  },
  timerColon: {
    width: 12,
    height: 56,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  timerColonDot: {
    width: 8,
    height: 8,
    borderRadius: 1,
  },
  eggLifeFooter: {
    fontFamily: Slab.bold,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + 4,
    color: Colors.ink,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
  },
  eggDeadMessage: {
    fontFamily: Slab.bold,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl + 10,
    color: Colors.ink,
    textAlign: 'center',
  },
  eggSleepHint: {
    fontFamily: Slab.black,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl + 8,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  petForeground: {
    zIndex: 1,
    overflow: 'visible',
    // Keep upright pet aligned with the egg's horizontal offset.
    marginLeft: PET_HOME_EGG_LEFT_INSET,
  },
  pixelPetWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  petForegroundDead: {
    position: 'absolute',
    left: '50%',
    // Pin near the egg's left edge (+ insets) so the hat stays visible; feet overflow right.
    marginLeft:
      -PET_HOME_EGG_WIDTH / 2 + PET_HOME_EGG_LEFT_INSET + PET_HOME_DEAD_LEFT_INSET,
    // Center on the egg (not the asymmetric stage).
    top: HERO_PET_STAGE_PAD_TOP + PET_HOME_EGG_HEIGHT / 2,
    marginTop: -PET_HOME_DEAD_DISPLAY_HEIGHT / 2,
  },
});
