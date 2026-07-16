/**
 * Visual language inspired by Figma "Business Visual" frames:
 * - Bold slab-serif headlines (Hepta Slab via @expo-google-fonts/hepta-slab)
 * - Pastel page backgrounds that change with the pet's state
 * - Thick black-bordered, 20px-rounded "task cards"
 * - Royal-blue character on a white egg shell
 */

export const Colors = {
  // Neutral page bg used by screens that don't follow the mood palette
  bg: '#FFEDD8',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Strong line art colour
  ink: '#000000',
  inkSoft: '#1A1A1A',

  // Character / accent (Figma habit title uses #22f)
  pet: '#2222FF',
  petSoft: '#3F39FF',

  // Mood-specific page palette
  stateGoodBg: '#DCFFD8',
  stateTodoBg: '#FFEDD8',
  stateSadBg: '#FFDCC8',
  stateBadBg: '#FF8484',

  // Confetti / sparkle dots used in "all good" state
  confetti: ['#1F1AE6', '#FF6F61', '#FFD93D', '#A66CFF', '#FF8FB1', '#000000'],

  // Legacy aliases (kept so existing imports still resolve)
  cardBorder: '#000000',
  primary: '#000000',
  primaryLight: '#FFFFFF',
  fitness: '#000000',
  fitnessLight: '#FFEDD8',
  selfRealization: '#000000',
  selfRealizationLight: '#FFEDD8',
  investing: '#000000',
  investingLight: '#FFEDD8',
  textPrimary: '#000000',
  textSecondary: '#222222',
  textMuted: '#666666',
  success: '#000000',
  warning: '#000000',
  danger: '#000000',
  white: '#FFFFFF',
  border: '#000000',
  shadow: 'rgba(0, 0, 0, 0)',
};

export const TrackColors: Record<string, { main: string; light: string }> = {
  fitness: { main: '#000000', light: '#FFEDD8' },
  selfRealization: { main: '#000000', light: '#FFEDD8' },
  investing: { main: '#000000', light: '#FFEDD8' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Border = {
  thin: 1,
  base: 2,
  thick: 4,
  hero: 8,
  tabDivider: 4,
  tabIndicator: 4,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  hero: 44,
  /** Greeting — scaled from Figma 62px @ 430w */
  display: 52,
  /** Habit title inside the task card — scaled from Figma 54px */
  habitTitle: 46,
  /** Card motto — Figma 20px */
  motto: 18,
  /** Primary CTA — scaled from Figma 25px */
  cta: 18,
  /** Bottom tab labels */
  tab: 12,
};

/** Internal names registered by `useFonts` from `@expo-google-fonts/hepta-slab`. */
export const Slab = {
  thin: 'HeptaSlab_100Thin',
  extraLight: 'HeptaSlab_200ExtraLight',
  light: 'HeptaSlab_300Light',
  regular: 'HeptaSlab_400Regular',
  medium: 'HeptaSlab_500Medium',
  semiBold: 'HeptaSlab_600SemiBold',
  bold: 'HeptaSlab_700Bold',
  extraBold: 'HeptaSlab_800ExtraBold',
  black: 'HeptaSlab_900Black',
} as const;

export const Font = {
  slab: Slab.regular,
  mono: Slab.regular,
};

/**
 * Shared type styles. Screen titles (home greeting, setup, history, auth headlines)
 * always use Hepta Slab Black at display size — see `.cursor/rules/screen-titles.mdc`.
 */
export const Type = {
  screenTitle: {
    fontFamily: Slab.black,
    fontSize: FontSize.display,
    letterSpacing: -1,
    lineHeight: FontSize.display + 4,
  },
} as const;
