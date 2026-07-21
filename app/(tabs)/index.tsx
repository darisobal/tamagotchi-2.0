import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
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
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppState } from '../../src/context';
import { DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { Spacing, FontSize, Slab, Radius, Border, Type } from '../../src/theme';
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
import { HEART_VIEWBOX } from '../../assets/pet/heart-paths';

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
  const { prefs, computedHabits, mood, lives, refresh, doCheckIn } = useAppState();
  const [refreshing, setRefreshing] = React.useState(false);
  const [restartPaywallVisible, setRestartPaywallVisible] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const theme = getStateTheme(mood);
  const tabBarExtraPad = useFloatingTabBarExtraPadding();

  // Single-habit app: card uses the setup name; track status is separate.
  const habit = computedHabits[0] ?? null;
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();
  const petName = (prefs.petName || 'champ').trim();
  const petColor = prefs.petColor || theme.pet;

  const openCheckIn = useCallback(() => {
    router.push({ pathname: '/checkin', params: { track: MAIN_TRACK } });
  }, []);

  const onHeroCheckIn = useCallback(() => {
    if (mood === 'dead') {
      setRestartPaywallVisible(true);
      return;
    }
    openCheckIn();
  }, [mood, openCheckIn]);

  const onRestartUnlocked = useCallback(async () => {
    setRestartPaywallVisible(false);
    await doCheckIn(MAIN_TRACK, 'medium', null);
  }, [doCheckIn]);

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
            <PetLives lives={lives} color={petColor} size={HERO_HEART_SIZE} gap={8} />
          </View>
          <PetStage
            petType={prefs.petType}
            mood={mood}
            customSprite={prefs.customSprite}
            petColor={petColor}
            petHat={prefs.petHat ?? 'none'}
            showConfetti={theme.showConfetti}
          />
        </View>

        {habit ? (
          <>
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
              onCheckIn={onHeroCheckIn}
            />
            <Text style={[styles.habitStakes, { color: theme.ink }]}>
              {`miss a day, and ${petName} loses a life. skip three days, and ${petName} is gone.`}
            </Text>
          </>
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
    </SafeAreaView>
  );
}

function PetStage({
  petType,
  mood,
  customSprite,
  petColor,
  petHat,
  showConfetti,
}: {
  petType: ReturnType<typeof useAppState>['prefs']['petType'];
  mood: ReturnType<typeof useAppState>['mood'];
  customSprite: string | null | undefined;
  petColor: string;
  petHat: ReturnType<typeof useAppState>['prefs']['petHat'];
  showConfetti: boolean;
}) {
  const useSelfiePixels = petType === 'selfie' && Boolean(customSprite);
  const isDead = mood === 'dead';

  return (
    <View style={styles.petStage}>
      {showConfetti ? <ConfettiBurst /> : null}
      <View style={styles.petStageCompose}>
        <PetEggShell
          width={PET_HOME_EGG_WIDTH}
          style={[
            petEggShellStyles.centered,
            {
              top: HERO_PET_STAGE_PAD_TOP,
              marginTop: 0,
              marginLeft: -PET_HOME_EGG_WIDTH / 2 + PET_HOME_EGG_LEFT_INSET,
            },
          ]}
        />
        <View
          style={[
            styles.petForeground,
            // Dead pose is wider than the egg — pin its left (head/hat) to the egg's
            // left edge so only the feet clip on the right.
            isDead && styles.petForegroundDead,
          ]}
        >
          {useSelfiePixels ? (
            <PixelPet
              petType={petType}
              mood={mood}
              customSprite={customSprite ?? null}
              color={petColor}
              pixelSize={7}
            />
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
      </View>
    </View>
  );
}

type ConfettiDotSpec = {
  x: number;
  y: number;
  color: string;
  size: number;
  /** Vertical drift amplitude in px (each dot floats up & down). */
  drift: number;
  /** Animation period in ms — each dot uses a slightly different period. */
  period: number;
  /** Rotation amplitude in deg. */
  rotate: number;
  /** Phase delay in ms so the dots don't all move in unison. */
  delay: number;
};

const CONFETTI_DOTS: ConfettiDotSpec[] = [
  { x: 6,  y: 6,  color: '#A66CFF', size: 14, drift: 14, period: 2600, rotate: 35, delay: 0 },
  { x: 60, y: 20, color: '#FF6F61', size: 12, drift: 10, period: 2200, rotate: 28, delay: 350 },
  { x: 88, y: 4,  color: '#FF8FB1', size: 14, drift: 16, period: 2900, rotate: 40, delay: 120 },
  { x: 4,  y: 38, color: '#1F1AE6', size: 10, drift: 12, period: 2400, rotate: 25, delay: 800 },
  { x: 92, y: 50, color: '#FFD93D', size: 12, drift: 14, period: 2700, rotate: 32, delay: 600 },
  { x: 30, y: 90, color: '#000000', size: 10, drift: 10, period: 2100, rotate: 30, delay: 950 },
  { x: 70, y: 88, color: '#1F1AE6', size: 12, drift: 12, period: 2500, rotate: 28, delay: 200 },
  { x: 50, y: 60, color: '#FF6F61', size: 10, drift: 14, period: 2300, rotate: 35, delay: 450 },
  { x: 18, y: 64, color: '#FFD93D', size: 8,  drift: 10, period: 2050, rotate: 22, delay: 700 },
  { x: 82, y: 72, color: '#A66CFF', size: 9,  drift: 12, period: 2350, rotate: 30, delay: 250 },
];

function ConfettiBurst() {
  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {CONFETTI_DOTS.map((d, i) => (
        <ConfettiDot key={i} spec={d} />
      ))}
    </View>
  );
}

function ConfettiDot({ spec }: { spec: ConfettiDotSpec }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: spec.period / 2,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: spec.period / 2,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
    return () => {
      cancelAnimation(t);
    };
  }, [t, spec.delay, spec.period]);

  const animatedStyle = useAnimatedStyle(() => {
    // t goes 0 → 1 → 0 each cycle; map to symmetric -drift … +drift float.
    const ty = (t.value - 0.5) * 2 * spec.drift;
    const rot = (t.value - 0.5) * 2 * spec.rotate;
    const scale = 0.92 + t.value * 0.16;
    return {
      transform: [{ translateY: ty }, { rotate: `${rot}deg` }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${spec.x}%`,
          top: `${spec.y}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: spec.color,
        },
        animatedStyle,
      ]}
    />
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

  habitStakes: {
    fontFamily: Slab.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + 6,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
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
  petForeground: {
    zIndex: 1,
    overflow: 'visible',
    // Keep upright pet aligned with the egg's horizontal offset.
    marginLeft: PET_HOME_EGG_LEFT_INSET,
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
  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
