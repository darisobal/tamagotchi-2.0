import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  useWindowDimensions,
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
import { ComputedHabit, DEFAULT_HABIT_NAME, MAIN_TRACK } from '../../src/types';
import { Colors, Spacing, FontSize, Slab, Radius, Border } from '../../src/theme';
import { getStateTheme } from '../../src/stateTheme';
import { useFloatingTabBarExtraPadding } from '../../src/floatingTabBarPadding';
import PixelPet from '../../src/PixelPet';
import LineArtPet from '../../src/LineArtPet';
import { PET_SVG_W_PER_H } from '../../src/PetFigure';

/** White circle behind the hero pet (fixed size). */
const HERO_PET_DISC_SIZE = 300;

/** Outer stage height: 40px pad above/below the 300px disc (room for lying-down pose). */
const HERO_PET_STAGE_HEIGHT = 40 + HERO_PET_DISC_SIZE + 40;

/** Line art drawn at this base height, then visually scaled up. */
const LINE_ART_BASE_SIZE = 186;

/** Cap on the visual scale for the line-art figure (164×360 viewBox). */
const PET_LINE_ART_VISUAL_SCALE_MAX = 1.85;

export default function HomeScreen() {
  const { prefs, computedHabits, mood, refresh } = useAppState();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const theme = getStateTheme(mood, prefs.difficulty);
  const tabBarExtraPad = useFloatingTabBarExtraPadding();

  // Single-habit app: there's exactly one habit to render.
  const habit = computedHabits[0] ?? null;
  const habitName = (prefs.habitName || DEFAULT_HABIT_NAME).trim();

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
        <Text style={[styles.greeting, { color: theme.ink }]} numberOfLines={2}>
          {theme.greeting()}
        </Text>

        <PetStage
          petType={prefs.petType}
          mood={mood}
          customSprite={prefs.customSprite}
          petColor={prefs.petColor || theme.pet}
          petHat={prefs.petHat ?? 'none'}
          showConfetti={theme.showConfetti}
        />

        {habit ? (
          <HeroTaskCard
            habit={habit}
            habitName={habitName}
            theme={theme}
            prelude={theme.prelude}
            showCrossOut={theme.showCrossOut}
          />
        ) : (
          <View style={[styles.heroCard, { borderColor: theme.cardBorder }]}>
            <Text style={[styles.heroPrelude, { color: theme.cardInk }]}>
              name your habit in setup
            </Text>
            <Text style={[styles.heroNumber, { color: theme.numberInk }]}>0</Text>
            <Text style={[styles.heroUnit, { color: theme.cardInk }]}>habits</Text>
            <Text style={[styles.heroCardMotto, { color: theme.mottoInk }]} numberOfLines={2}>
              {theme.motto(habitName)}
            </Text>
          </View>
        )}
      </ScrollView>
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

  const { width: windowWidth } = useWindowDimensions();
  const horizontalPad = Spacing.lg * 2;
  const maxDrawW = Math.max(1, windowWidth - horizontalPad);

  // Upright: narrow width. Dead (lying): full body runs horizontally → wider layout box.
  const baseArtW =
    mood === 'dead' ? LINE_ART_BASE_SIZE : LINE_ART_BASE_SIZE * PET_SVG_W_PER_H;
  const petVisualScale = Math.min(
    PET_LINE_ART_VISUAL_SCALE_MAX,
    maxDrawW / baseArtW,
  );

  return (
    <View style={styles.petStage}>
      {showConfetti ? <ConfettiBurst /> : null}
      <View style={styles.petStageCompose}>
        <View
          style={[
            styles.petDisc,
            {
              width: HERO_PET_DISC_SIZE,
              height: HERO_PET_DISC_SIZE,
              marginTop: -HERO_PET_DISC_SIZE / 2,
              marginLeft: -HERO_PET_DISC_SIZE / 2,
            },
            styles.petDiscCentered,
          ]}
        />
        <View style={[styles.petForeground, { transform: [{ scale: petVisualScale }] }]}>
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
              size={LINE_ART_BASE_SIZE}
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

function HeroTaskCard({
  habit,
  habitName,
  theme,
  prelude,
  showCrossOut,
}: {
  habit: ComputedHabit;
  habitName: string;
  theme: ReturnType<typeof getStateTheme>;
  prelude: string | null;
  showCrossOut: boolean;
}) {
  return (
    <View style={[styles.heroCard, { borderColor: theme.cardBorder }]}>
      {prelude ? (
        <Text style={[styles.heroPrelude, styles.heroPreludeTop, { color: theme.cardInk }]}>
          {prelude}
        </Text>
      ) : null}
      <View style={styles.heroNumberRow}>
        <Text
          style={[styles.heroHabitTitle, { color: theme.numberInk }]}
          numberOfLines={4}
          adjustsFontSizeToFit
          minimumFontScale={0.28}
        >
          {habitName}
        </Text>
        {showCrossOut ? <CrossOut /> : null}
      </View>
      <Text style={[styles.heroCardMotto, { color: theme.mottoInk }]} numberOfLines={2}>
        {theme.motto(habitName)}
      </Text>
      <TouchableOpacity
        style={[
          styles.checkInBtn,
          styles.checkInBtnFullWidth,
          { backgroundColor: theme.cardInk, borderColor: theme.cardInk },
        ]}
        onPress={() =>
          router.push({ pathname: '/checkin', params: { track: habit.trackType } })
        }
        activeOpacity={0.85}
      >
        <Text style={styles.checkInBtnText}>check in</Text>
      </TouchableOpacity>
    </View>
  );
}

function CrossOut() {
  return (
    <View pointerEvents="none" style={styles.crossOutLayer}>
      <View style={[styles.crossLine, styles.crossLineA]} />
      <View style={[styles.crossLine, styles.crossLineB]} />
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
    fontFamily: Slab.black,
    fontSize: FontSize.display,
    letterSpacing: -1,
    lineHeight: FontSize.display + 4,
    marginBottom: Spacing.sm,
  },

  petStage: {
    height: HERO_PET_STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    overflow: 'visible',
  },
  petStageCompose: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  petDiscCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 0,
  },
  petForeground: {
    zIndex: 1,
    overflow: 'visible',
  },
  petDisc: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  heroCard: {
    borderWidth: Border.hero,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  heroPreludeTop: {
    marginBottom: Spacing.sm,
  },
  heroCardMotto: {
    fontFamily: Slab.black,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  heroPrelude: {
    fontFamily: Slab.extraBold,
    fontSize: FontSize.xl,
  },
  heroNumberRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  /** Habit label at the former hero number scale (single focal headline). */
  heroHabitTitle: {
    fontFamily: Slab.black,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2,
    textTransform: 'lowercase',
    flex: 1,
    minWidth: 0,
  },
  heroNumber: {
    fontFamily: Slab.black,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2,
  },
  heroUnit: {
    fontFamily: Slab.extraBold,
    fontSize: FontSize.lg,
    marginTop: Spacing.xs,
    textTransform: 'lowercase',
  },
  checkInBtn: {
    borderWidth: Border.base,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  checkInBtnFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInBtnText: {
    fontFamily: Slab.black,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  crossOutLayer: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    zIndex: 1,
  },
  crossLine: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    height: 8,
    width: '120%',
    top: '50%',
    left: '-10%',
  },
  crossLineA: {
    transform: [{ rotate: '-12deg' }],
  },
  crossLineB: {
    transform: [{ rotate: '12deg' }],
  },
});
