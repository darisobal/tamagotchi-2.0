import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, FontSize, Slab, Radius, Border } from './theme';

export type HeroTaskCardProps = {
  habitName: string;
  motto: string;
  accentColor: string;
  borderColor: string;
  backgroundColor?: string;
  mottoColor: string;
  buttonColor: string;
  checkInLabel: string;
  /** White X over the habit title (dead / failed state). */
  showCrossOut?: boolean;
  onCheckIn: () => void;
};

/**
 * Home habit card — title, motto, and CTA button inside the thick border.
 * Same structure for all moods (including dead / “start again”).
 */
export default function HeroTaskCard({
  habitName,
  motto,
  accentColor,
  borderColor,
  backgroundColor,
  mottoColor,
  buttonColor,
  checkInLabel,
  showCrossOut = false,
  onCheckIn,
}: HeroTaskCardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderColor, backgroundColor: backgroundColor ?? 'transparent' },
      ]}
    >
      <View style={styles.titleRow}>
        <Text
          style={[styles.title, { color: accentColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.45}
        >
          {habitName}
        </Text>
        {showCrossOut ? <CrossOut /> : null}
      </View>
      <Text style={[styles.motto, { color: mottoColor }]} numberOfLines={2}>
        {motto}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor, borderColor: buttonColor }]}
        onPress={onCheckIn}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{checkInLabel}</Text>
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
  card: {
    borderWidth: Border.hero,
    borderRadius: Radius.lg,
    paddingTop: Spacing.lg + Spacing.xs,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg + Spacing.xs,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: Slab.bold,
    fontSize: FontSize.habitTitle,
    lineHeight: FontSize.habitTitle + 6,
    letterSpacing: -1,
    flex: 1,
    minWidth: 0,
  },
  motto: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.motto,
    lineHeight: FontSize.motto + 4,
    letterSpacing: -0.2,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  button: {
    borderWidth: Border.base,
    borderRadius: Radius.md,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 293,
    minHeight: 56,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: Slab.semiBold,
    fontSize: FontSize.cta,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: FontSize.cta + 3,
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
